from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.init import db
from app.models.user import User
import re

auth_bp = Blueprint('auth', __name__)


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
    # pull data that was entered
    data = request.get_json()
    
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
        return jsonify({'error': 'Email already registered'}), 400
    

    # After successfull authentication create user
    user = User(
        email=data['email'],
        first_name=data.get('first_name', ''),
        last_name=data.get('last_name', '')
    )
    user.set_password(data['password'])
    
    try:
        db.session.add(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration Failed!'}), 500
    
    
    # Create token
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'message': 'User created successfully',
        'access_token': access_token,
        'user': user.to_dict()
    }), 201


#create login endpoint route
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    #Basic validation
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    
    # Email format validation
    if not validate_email(data['email']):
        return jsonify({'error': 'Invalid email format'}), 400
    

    user = User.query.filter_by(email=data['email']).first()

    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401


# Identify current user
@auth_bp.route('/me', methods=['GET'])
@jwt_required()

def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({'user': user.to_dict()}), 200