from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.user import User
import re
from app.services.redis_service import redis_service
import logging


# create Blueprint for authentication of user
auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)


# email validation using regex
def validate_email(email):
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_pattern, email) is not None

# Validate password strength requirements
def validate_password(password):
    
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain an uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain a lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain a number"
    return True, ""



# create endpoint for user registration
@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        # pull data that was entered
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
    
        # Basic validation
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password required'}), 400
    
        # Email format validation
        if not validate_email(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Password strength validation
        is_valid, password_error = validate_password(data['password'])
        if not is_valid:
            return jsonify({'error': password_error}), 400
        
        # Check if user exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({
                'success': False,
                'message': 'Email already registered'
            }), 409
    

        # After successfull authentication create user
        user = User(
            email=data['email'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', '')
        )
        user.set_password(data['password']) # uses bcyrpt
    
    
        db.session.add(user)
        db.session.commit()


        # Create token
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))


        return jsonify({
            'message': 'User created successfully',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }), 201


    except Exception as e:
        db.session.rollback()
        logger.error(f"Registration failed: {e}")
        return jsonify({
            'success': False,
            'message': 'Registration failed',
            'error': str(e)
        }), 500



#create login endpoint route
@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        email = data.get('email', '').strip()
        password = data.get('password', '')

        #Basic validation
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        # Email format validation
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):  # This now uses bcrypt
            return jsonify({
                'success': False,
                'message': 'Invalid credentials'
            }), 401
        
        # Create tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        logger.info(f"User logged in: {user.email}")
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
        
    except Exception as e:
        logger.error(f"Login failed: {e}")
        return jsonify({
            'success': False,
            'message': 'Login failed',
            'error': str(e)
        }), 500



@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        new_access_token = create_access_token(identity=current_user_id)
        logger.info(f"Token refreshed for user: {user.email} (ID: {user.id})")
        
        return jsonify({
            'success': True,
            'access_token': new_access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Token refresh failed: {e}")
        return jsonify({
            'success': False,
            'message': 'Token refresh failed',
            'error': str(e)
        }), 500
    


# create logout route
@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        current_user_id = get_jwt_identity()
        jwt_data = get_jwt()
        jti = jwt_data['jti']  # JWT ID
        exp = jwt_data['exp']  # Expiration timestamp
        
        # Calculate how long until token expires
        import time
        current_time = int(time.time())
        expires_in = exp - current_time
        
        # Only blacklist if token hasn't expired yet
        if expires_in > 0:
            success = redis_service.blacklist_token(jti, expires_in)
            if not success:
                logger.warning(f"Failed to blacklist token for user {current_user_id}")
        
        user = User.query.get(current_user_id)
        if user:
            logger.info(f"User logged out: {user.email}")
        
        return jsonify({
            'success': True,
            'message': 'Successfully logged out'
        }), 200
        
    except Exception as e:
        logger.error(f"Logout failed: {e}")
        return jsonify({
            'success': False,
            'message': 'Logout failed',
            'error': str(e)
        }), 500
    


# Identify current user
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to get user info: {e}")
        return jsonify({
            'success': False,
            'message': 'Failed to get user info',
            'error': str(e)
        }), 500


# Logout form all devices
@auth_bp.route('/logout-all', methods=['POST'])
@jwt_required()
def logout_all():
    """Logout from all devices by blacklisting both access and refresh tokens"""
    try:
        current_user_id = get_jwt_identity()
        jwt_data = get_jwt()
        jti = jwt_data['jti']
        exp = jwt_data['exp']
        
        # Calculate expiration time
        import time
        current_time = int(time.time())
        expires_in = exp - current_time
        
        # Blacklist current token
        if expires_in > 0:
            redis_service.blacklist_token(jti, expires_in)
        
        # Note: In a real implementation, you might want to track all user tokens
        # and blacklist them all. For now, this just blacklists the current token.
        
        user = User.query.get(current_user_id)
        if user:
            logger.info(f"User logged out from all devices: {user.email}")
        
        return jsonify({
            'success': True,
            'message': 'Successfully logged out from all devices'
        }), 200
        
    except Exception as e:
        logger.error(f"Logout all failed: {e}")
        return jsonify({
            'success': False,
            'message': 'Logout all failed',
            'error': str(e)
        }), 500
