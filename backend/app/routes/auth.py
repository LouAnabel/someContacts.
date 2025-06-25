from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.user import User
import re
import logging
from app.services.token_service import add_token_to_blacklist, is_token_revoked,  revoke_all_user_tokens
from datetime import datetime, timezone
from app import jwt


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


        return jsonify({
            'message': 'User created successfully',
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



#create login endpoint route & create access & refresh token
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
        if not user or not user.check_password(password):  # This uses bcrypt
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
        
        new_access_token = create_access_token(identity=str(current_user_id))
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

        from app.models.token_block_list import TokenBlockList
        jti = jwt_data['jti']
        exp_timestamp = jwt_data['exp']
        token_type = jwt_data.get('type', 'access')
        expires_at = datetime.fromtimestamp(exp_timestamp, tz=timezone.utc)

        # Add current token to blacklist directly
        blacklisted_token = TokenBlockList(
            jti=jti,
            token_type=token_type,
            user_id=int(current_user_id),
            expires=expires_at,
            revoked_at=datetime.now(timezone.utc)
        )

        db.session.add(blacklisted_token)
        db.session.commit()

        user = User.query.get(current_user_id)
        if user:
            logger.info(f"User logged out: {user.email}")
        
        return jsonify({
            'success': True,
            'message': 'Successfully logged out'
        }), 200
        
    except Exception as e:
        logger.error(f"Logout failed: {e}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Logout failed',
            'error': str(e)
        }), 500


# Logout form all devices
@auth_bp.route('/logout-all', methods=['POST'])
@jwt_required()
def logout_all():
    """Logout from all devices by blacklisting both access and refresh tokens"""
    try:
        current_user_id = get_jwt_identity()
        # Revoke all tokens for this user
        revoked_count = revoke_all_user_tokens(int(current_user_id))
        
        user = User.query.get(int(current_user_id))
        if user:
            logger.info(f"User logged out from all devices: {user.email} ({revoked_count} tokens revoked)")
        
        return jsonify({
            'success': True,
            'message': f'Successfully logged out from all devices ({revoked_count} sessions ended)'
        }), 200
        
    except Exception as e:
        logger.error(f"Logout all failed: {e}")
        return jsonify({
            'success': False,
            'message': 'Logout all failed',
            'error': str(e)
        }), 500


# Identify current user
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))
        
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


# JWT token checkers
@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    try:
        return is_token_revoked(jwt_payload)
    except Exception as e:
        logger.error(f"Error in token blocklist loader: {e}")
        return False  # Don't block users if we can't check

@jwt.user_lookup_loader
def load_user(jwt_header, jwt_payload):
    identity_claim = current_app.config["JWT_IDENTITY_CLAIM"]
    user_id = jwt_payload[identity_claim]
    return User.query.get(int(user_id))