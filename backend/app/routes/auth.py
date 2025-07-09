from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from app import db
from app.models.user import User
from app.models.token_block_list import TokenBlockList
from app.services.token_service import store_token_pair, store_single_token, revoke_current_token, revoke_all_user_tokens
import re
import logging
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



#create login endpoint route & create and save access & refresh token
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
        
        # adds token pair to database
        if not store_token_pair(access_token, refresh_token, user.id):
            return jsonify({
                'success': False,
                'message': 'Failed to create session'
            }), 500
        
        logger.info(f"User logged in: {user.email}")
        
        return jsonify({
            'success': True,
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()  # Assuming you have a to_dict method
        }), 200
    
    except Exception as e:
        logger.error(f"Login failed: {e}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Login failed',
            'error': str(e)
        }), 500


# Updated refresh route
from app.services.token_service import revoke_user_access_tokens

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user_id = get_jwt_identity()
        
        # Get the current refresh token's JTI to revoke it specifically
        current_jwt = get_jwt()
        current_refresh_jti = current_jwt['jti']
        
        try:
            # Revoke ALL old tokens for this user (both access AND refresh)
            revoked_count = revoke_all_user_tokens(int(current_user_id))
            logger.info(f"Revoked {revoked_count} old tokens for user {current_user_id}")
        except Exception as revoke_error:
            logger.error(f"Failed to revoke old tokens: {revoke_error}")
            return jsonify({
                'success': False,
                'message': 'Failed to revoke old tokens'
            }), 500
        
        # Generate BOTH new access and refresh tokens
        new_access_token = create_access_token(identity=str(current_user_id))
        new_refresh_token = create_refresh_token(identity=str(current_user_id))
        
        # Store BOTH tokens in database using your existing function
        if not store_token_pair(new_access_token, new_refresh_token, current_user_id):
            return jsonify({
                'success': False,
                'message': 'Failed to store new tokens'
            }), 500
        
        return jsonify({
            'success': True,
            'access_token': new_access_token,
            'refresh_token': new_refresh_token  # ← KEY CHANGE: Return new refresh token
        }), 200
        
    except Exception as e:
        logger.error(f"Token refresh failed: {e}")
        return jsonify({
            'success': False,
            'message': 'Token refresh failed',
            'error': str(e)
        }), 500
    


# create logout route
# Note: This only revokes the current access token, not the refresh token.
@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        current_user_id = get_jwt_identity()
        jwt_payload = get_jwt()

        # Revoke the current token
        if revoke_current_token(jwt_payload):
            user = User.query.get(current_user_id)
            if user:
                logger.info(f"User logged out: {user.email}")
            
            return jsonify({
                'success': True,
                'message': 'Successfully logged out'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to logout'
            }), 500
        
    except Exception as e:
        logger.error(f"Logout failed: {e}")
        return jsonify({
            'success': False,
            'message': 'Logout failed',
            'error': str(e)
        }), 500



# Logout form all devices:
# revoking ALL tokens (access and refresh) for the user. This will invalidate all sessions across all devices.
@auth_bp.route('/logout-all', methods=['POST'])
@jwt_required()
def logout_all():
    try:
        current_user_id = get_jwt_identity()
        # Revoke all tokens for this user
        revoked_count = revoke_all_user_tokens(int(current_user_id))
        
        if revoked_count >= 0:  # 0 or more tokens revoked (0 is valid if no active tokens)
            user = User.query.get(int(current_user_id))
            if user:
                logger.info(f"User logged out from all devices: {user.email} ({revoked_count} tokens revoked)")
        
        # Provide different messages based on revoked count
            if revoked_count == 0:
                message = "No active sessions found to revoke"
            elif revoked_count == 1:
                message = "Successfully logged out from 1 session"
            else:
                message = f"Successfully logged out from all devices ({revoked_count} sessions ended)"
            
            return jsonify({
                'success': True,
                'message': message,
                'revoked_count': revoked_count
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to logout from all devices'
            }), 500
        
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


@jwt.user_lookup_loader
def load_user(jwt_header, jwt_payload):
    identity_claim = current_app.config["JWT_IDENTITY_CLAIM"]
    user_id = jwt_payload[identity_claim]
    return User.query.get(int(user_id))