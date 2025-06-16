from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.contact import Contact
# from app.models.category import Category  # Import when you create category model
import re
from datetime import datetime

contacts_bp = Blueprint('contacts', __name__)


# Email validation
def validate_email(email):
    if not email:  # Email is optional for contacts
        return True
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_pattern, email) is not None


# Phone validation 
def validate_phone(phone):
    if not phone:  # Phone is optional
        return True
    # Remove spaces, dashes, parentheses for validation
    clean_phone = re.sub(r'[^\d]', '', phone)
    
    # Check if remaining characters are digits and reasonable length
    # Allow international numbers (7-15 digits)
    return clean_phone.isdigit() and 7 <= len(clean_phone) <= 15


# Date validation helper
def validate_date(date_string):
    if not date_string:
        return True
    try:
        datetime.strptime(date_string, '%Y-%m-%d')
        return True
    except ValueError:
        return False



# CREATE - add a new Contact
@contacts_bp.route('/add', methods=['POST'])
@jwt_required()
def create_contact():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        # Validate required fields
        if not data.get('first_name'):
            return jsonify({'error': 'First name is required'}), 400
        
        # Validate email format if provided
        if data.get('email') and not validate_email(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
            
        # Validate phone format if provided
        if data.get('phone') and not validate_phone(data['phone']):
            return jsonify({'error': 'Invalid phone number format'}), 400
        
        # Validate birth_date format if provided
        if data.get('birth_date') and not validate_date(data['birth_date']):
            return jsonify({'error': 'Invalid birth date format. Use YYYY-MM-DD'}), 400

        # Validate last_contact_date format if provided
        if data.get('last_contact_date') and not validate_date(data['last_contact_date']):
            return jsonify({'error': 'Invalid last contact date format. Use YYYY-MM-DD'}), 400

        # Create new contact
        contact = Contact(
            user_id=user_id,
            first_name=data['first_name'].strip(),
            last_name=data.get('last_name', '').strip(),
            email=data.get('email', '').strip(),
            phone=data.get('phone', '').strip(),
            category=data.get('category', '').strip(),  # Fixed field name
            birth_date=datetime.strptime(data['birth_date'], '%Y-%m-%d').date() if data.get('birth_date') else None,
            last_contact_date=datetime.strptime(data['last_contact_date'], '%Y-%m-%d').date() if data.get('last_contact_date') else None,
            last_contact_place=data.get('last_contact_place', '').strip(),  # Fixed field name
            address=data.get('address', '').strip(),
            city=data.get('city', '').strip(),
            country=data.get('country', '').strip(),
            notes=data.get('notes', '').strip()
        )
        
        db.session.add(contact)
        db.session.commit()

        return jsonify({
            'message': 'Contact successfully created',
            'contact': contact.to_dict()
        }), 201  # Changed to 201 for created
    
    except ValueError as e:
        return jsonify({'error': 'Invalid date format'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create contact'}), 500
    


# Read - Get all contacts 
@contacts_bp.route('/all', methods=['GET'])
@jwt_required()  # Fixed decorator
def get_all_contacts():
    try:
        user_id = get_jwt_identity()

        # Get query parameters for pagination and search
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '', type=str)
        
        # Limit per_page to prevent abuse
        per_page = min(per_page, 100)
        
        # Build query
        query = Contact.query.filter_by(user_id=user_id)

        # Add search functionality
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                db.or_(
                    Contact.first_name.ilike(search_term),
                    Contact.last_name.ilike(search_term),
                    Contact.email.ilike(search_term),
                    Contact.last_contact_place.ilike(search_term),
                    Contact.city.ilike(search_term)
                )
            )

        # Order by first name, last name
        query = query.order_by(Contact.first_name, Contact.last_name)

        # Paginate
        contacts = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        return jsonify({
            'contacts': [contact.to_dict() for contact in contacts.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': contacts.total,
                'pages': contacts.pages,
                'has_next': contacts.has_next,
                'has_prev': contacts.has_prev
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve contacts'}), 500
    


# READ - Get a specific contact
@contacts_bp.route('/<int:contact_id>', methods=['GET'])
@jwt_required()
def get_contact(contact_id):
    try:
        user_id = get_jwt_identity()
        
        # find the contact
        contact = Contact.query.filter_by(id=contact_id, user_id=user_id).first()
        
        if not contact:
            return jsonify({'error': 'Contact not found'}), 404
        
        return jsonify({'contact': contact.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to retrieve contact'}), 500
        
    

# UPDATE - Update Contact by ID
@contacts_bp.route('/update/<int:contact_id>', methods=['PUT'])
@jwt_required()  # Fixed decorator
def update_contact(contact_id):
    try:
        user_id = get_jwt_identity()
        data = request.get_json() 

        # find the contact
        contact = Contact.query.filter_by(id=contact_id, user_id=user_id).first()

        if not contact:
            return jsonify({'error': 'Contact cannot be found'}), 404
        
        # Validate required fields
        if 'first_name' in data and not data['first_name'].strip():
            return jsonify({'error': 'First name cannot be empty'}), 400
        
        # Validate email format if provided
        if 'email' in data and data['email'] and not validate_email(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
            
        # Validate phone format if provided
        if 'phone' in data and data['phone'] and not validate_phone(data['phone']):
            return jsonify({'error': 'Invalid phone number format'}), 400

        # Validate date formats if provided
        if 'birth_date' in data and data['birth_date'] and not validate_date(data['birth_date']):
            return jsonify({'error': 'Invalid birth date format. Use YYYY-MM-DD'}), 400

        if 'last_contact_date' in data and data['last_contact_date'] and not validate_date(data['last_contact_date']):
            return jsonify({'error': 'Invalid last contact date format. Use YYYY-MM-DD'}), 400

        # Update fields if provided
        if 'first_name' in data:
            contact.first_name = data['first_name'].strip()
        if 'last_name' in data:
            contact.last_name = data['last_name'].strip()
        if 'email' in data:
            contact.email = data['email'].strip()
        if 'phone' in data:
            contact.phone = data['phone'].strip()
        if 'category' in data:
            contact.category = data['category'].strip()  # Fixed field assignment
        if 'birth_date' in data:
            contact.birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d').date() if data['birth_date'] else None
        if 'last_contact_date' in data:
            contact.last_contact_date = datetime.strptime(data['last_contact_date'], '%Y-%m-%d').date() if data['last_contact_date'] else None
        if 'last_contact_place' in data:
            contact.last_contact_place = data['last_contact_place'].strip()
        if 'address' in data:
            contact.address = data['address'].strip()
        if 'city' in data:
            contact.city = data['city'].strip()
        if 'country' in data:
            contact.country = data['country'].strip()  # Fixed field assignment
        if 'notes' in data:
            contact.notes = data['notes'].strip()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Contact updated successfully',
            'contact': contact.to_dict()
        }), 200
    
    except ValueError as e:
        return jsonify({'error': 'Invalid date format'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update contact'}), 500



# DELETE - Delete a contact
@contacts_bp.route('/<int:contact_id>', methods=['DELETE'])
@jwt_required()
def delete_contact(contact_id):
    try:
        user_id = get_jwt_identity()
        
        contact = Contact.query.filter_by(id=contact_id, user_id=user_id).first()
        
        if not contact:
            return jsonify({'error': 'Contact not found'}), 404
        
        db.session.delete(contact)
        db.session.commit()
        
        return jsonify({'message': 'Contact deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete contact'}), 500



# BULK DELETE - Delete multiple contacts
@contacts_bp.route('/bulk-delete', methods=['DELETE'])
@jwt_required()
def bulk_delete_contacts():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        contact_ids = data.get('contact_ids', [])
        
        if not contact_ids or not isinstance(contact_ids, list):
            return jsonify({'error': 'contact_ids array is required'}), 400
        
        # Find and delete contacts
        deleted_count = Contact.query.filter(
            Contact.id.in_(contact_ids),
            Contact.user_id == user_id
        ).delete(synchronize_session=False)
        
        db.session.commit()
        
        return jsonify({
            'message': f'{deleted_count} contacts deleted successfully',
            'deleted_count': deleted_count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete contacts'}), 500