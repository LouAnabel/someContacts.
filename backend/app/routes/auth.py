from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from app import db, jwt
from app.models.user import User
from app.models.token_block_list import TokenBlockList
from app.services.token_service import store_token_pair, store_single_token, revoke_current_token, \
    revoke_all_user_tokens
import re
import logging
from datetime import datetime, date as date_type

# create Blueprint for authentication of user
auth_bp = Blueprint('auth', __name__)
logger = logging.getLogger(__name__)


# email validation using regex
def validate_email(email):
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_pattern, email) is not None

# Validate password strength requirements
def validate_password(password):
    if len(password) < 6:
        return False, "Password must be at least 6 characters"
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
        print("data received:", data)

        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400

        # Basic validation
        if not data.get('email') or not data.get('password'):
            return jsonify({
                'success': False,
                'message': 'email and password required.'
            }), 400

        if not data.get('first_name') or not data.get('last_name'):
            return jsonify({
                'success': False,
                'message': 'first name and last name required.'
            }), 400

        # Email format validation
        if not validate_email(data['email']):
            return jsonify({
                'success': False,
                'message': 'invalid email format.'
            }), 400

        # Password strength validation
        is_valid, password_error = validate_password(data['password'])
        if not is_valid:
            return jsonify({
                'success': False,
                'message': password_error
            }), 400

        # Check if user exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({
                'success': False,
                'message': 'email already registered.'
            }), 409

        # After successful validation, create user
        user = User(
            email=data['email'],
            first_name=data.get('first_name'),
            last_name=data.get('last_name')
        )
        user.set_password(data['password'])  # uses bcrypt

        db.session.add(user)
        db.session.commit()

        logger.info(f"User registered: {user.email}")

        return jsonify({
            'success': True,
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


# create login endpoint route & create and save access & refresh token
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

        # Basic validation
        if not email or not password:
            return jsonify({
                'success': False,
                'message': 'email and password required.'
            }), 400

        # Email format validation
        if not validate_email(email):
            return jsonify({
                'success': False,
                'message': 'invalid email format.'
            }), 400

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):  # uses bcrypt
            return jsonify({
                'success': False,
                'message': 'invalid credentials.'
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

        logger.info(f"welcome. user logged in: {user.email}.")

        return jsonify({
            'success': True,
            'message': 'Login successful',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }), 200

    except Exception as e:
        logger.error(f"Login failed: {e}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Login failed',
            'error': str(e)
        }), 500


# refresh token route
@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user_id = get_jwt_identity()
        current_jwt = get_jwt()

        try:
            # Revoke ALL old tokens for this user (both access AND refresh)
            revoked_count = revoke_all_user_tokens(int(current_user_id))
            logger.info(f"Revoked {revoked_count} old tokens for user {current_user_id}")
        except Exception as revoke_error:
            logger.error(f"Failed to revoke old tokens: {revoke_error}")
            return jsonify({
                'success': False,
                'message': 'failed to revoke old tokens.'
            }), 500

        # Generate BOTH new access and refresh tokens
        new_access_token = create_access_token(identity=str(current_user_id))
        new_refresh_token = create_refresh_token(identity=str(current_user_id))

        # Store BOTH tokens in database
        if not store_token_pair(new_access_token, new_refresh_token, int(current_user_id)):
            return jsonify({
                'success': False,
                'message': 'failed to store new tokens.'
            }), 500

        return jsonify({
            'success': True,
            'message': 'token refreshed successfully.',
            'access_token': new_access_token,
            'refresh_token': new_refresh_token
        }), 200

    except Exception as e:
        logger.error(f"Token refresh failed: {e}")
        return jsonify({
            'success': False,
            'message': 'token refresh failed.',
            'error': str(e)
        }), 500


# create logout route
@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        current_user_id = get_jwt_identity()
        jwt_payload = get_jwt()

        # Revoke the current token
        if revoke_current_token(jwt_payload):
            user = User.query.get(int(current_user_id))
            if user:
                logger.info(f"User logged out: {user.email}")

            return jsonify({
                'success': True,
                'message': 'goodbye. successfully logged out.'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'sorry. failed to logout.'
            }), 500

    except Exception as e:
        logger.error(f"Logout failed: {e}")
        return jsonify({
            'success': False,
            'message': 'sorry. logout failed.',
            'error': str(e)
        }), 500


# Logout from all devices
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
                logger.info(f"user logged out from all devices: {user.email} ({revoked_count} tokens revoked.)")

            # Provide different messages based on revoked count
            if revoked_count == 0:
                message = "no active sessions found to revoke."
            elif revoked_count == 1:
                message = "successfully logged out from 1 session."
            else:
                message = f"successfully logged out from all devices ({revoked_count} sessions ended.)"

            return jsonify({
                'success': True,
                'message': message,
                'revoked_count': revoked_count
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'sorry. failed to logout from all devices.'
            }), 500

    except Exception as e:
        logger.error(f"sorry. logout all failed: {e}.")
        return jsonify({
            'success': False,
            'message': 'sorry. logout all failed.',
            'error': str(e)
        }), 500


# Get current user info
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))

        if not user:
            return jsonify({
                'success': False,
                'message': 'sorry. user not found.'
            }), 404

        return jsonify({
            'success': True,
            'user': user.to_dict()
        }), 200

    except Exception as e:
        logger.error(f"sorry. failed to get user info: {e}.")
        return jsonify({
            'success': False,
            'message': 'sorry. failed to get user info.',
            'error': str(e)
        }), 500


@auth_bp.route('/update', methods=['PUT'])
@jwt_required()
def update_user_data():
    try:
        from app.models.contact_email import ContactEmail
        from app.models.contact_phone import ContactPhone
        from app.models.contact_address import ContactAddress
        from app.models.contact_link import ContactLink

        current_user_id = get_jwt_identity()
        user = User.query.get(int(current_user_id))

        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404

        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400

        logger.info(f"Updating user {current_user_id}")

        # Update basic fields
        basic_fields = ['first_name', 'last_name', 'birth_date']

        for field in basic_fields:
            if field in data:
                if field == 'birth_date':
                    try:
                        date_value = datetime.strptime(data[field], '%d.%m.%Y').date()
                        if date_value > date_type.today():
                            return jsonify({
                                'success': False,
                                'message': 'birth_date cannot be in the future'
                            }), 400
                        setattr(user, field, date_value)
                    except ValueError:
                        return jsonify({
                            'success': False,
                            'message': f'Invalid date format for {field}. Use DD.MM.YYYY'
                        }), 400
                else:
                    setattr(user, field, data[field])

        # Update emails
        if 'emails' in data and isinstance(data['emails'], list):
            # Clear existing emails
            user.emails.delete()

            # Add new emails
            for email_data in data['emails']:
                if 'email' in email_data and 'title' in email_data:
                    new_email = ContactEmail(
                        owner_type='user',
                        user_id=user.id,
                        email=email_data['email'],
                        title=email_data['title']
                    )
                    db.session.add(new_email)

        # Update phones
        if 'phones' in data and isinstance(data['phones'], list):
            # Clear existing phones
            user.phones.delete()

            # Add new phones
            for phone_data in data['phones']:
                if 'phone' in phone_data and 'title' in phone_data:
                    new_phone = ContactPhone(
                        owner_type='user',
                        user_id=user.id,
                        phone=phone_data['phone'],
                        title=phone_data['title']
                    )
                    db.session.add(new_phone)

        # Update addresses
        if 'addresses' in data and isinstance(data['addresses'], list):
            # Clear existing addresses
            user.addresses.delete()

            # Add new addresses
            for address_data in data['addresses']:
                if all(k in address_data for k in ['street_and_nr', 'postal_code', 'city', 'country', 'title']):
                    new_address = ContactAddress(
                        owner_type='user',
                        user_id=user.id,
                        street_and_nr=address_data['street_and_nr'],
                        additional_info=address_data.get('additional_info'),
                        postal_code=address_data['postal_code'],
                        city=address_data['city'],
                        country=address_data['country'],
                        title=address_data['title']
                    )
                    db.session.add(new_address)

        # Update links
        if 'links' in data and isinstance(data['links'], list):
            # Clear existing links
            user.links.delete()

            # Add new links
            for link_data in data['links']:
                if 'url' in link_data and 'title' in link_data:
                    new_link = ContactLink(
                        owner_type='user',
                        user_id=user.id,
                        url=link_data['url'],
                        title=link_data['title']
                    )
                    db.session.add(new_link)

        db.session.commit()
        logger.info(f"User {current_user_id} updated successfully")

        return jsonify({
            'success': True,
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"User update failed: {e}")
        return jsonify({
            'success': False,
            'message': 'User update failed',
            'error': str(e)
        }), 500


# JWT loader callback
@jwt.user_lookup_loader
def load_user(jwt_header, jwt_payload):
    identity_claim = current_app.config["JWT_IDENTITY_CLAIM"]
    user_id = jwt_payload[identity_claim]
    return User.query.get(int(user_id))