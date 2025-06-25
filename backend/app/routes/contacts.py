from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.contact import Contact
from app.models.category import Category
import re
from datetime import datetime
import logging

contacts_bp = Blueprint('contacts', __name__)
logger = logging.getLogger(__name__)


# Email validation
def validate_email(email):
    if not email:  # Email is optional for contacts
        return True
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    result = re.match(email_pattern, email) is not None
    logger.debug(f"Email validation for '{email}': {result}")
    return result


# Phone validation 
def validate_phone(phone):
    if not phone:  # Phone is optional
        return True
    # Remove spaces, dashes, parentheses for validation
    clean_phone = re.sub(r'[^\d+]', '', phone)
    # Check if it contains only digits and + (for international)
    pattern = r'^\+?[\d]{7,15}$'
    result = re.match(pattern, clean_phone) is not None
    logger.debug(f"Phone validation for '{phone}' (cleaned: '{clean_phone}'): {result}")
    return result


# Date validation helper
def validate_date(date_string):
    if not date_string:
        return True
    try:
        datetime.strptime(date_string, '%d-%m-%Y')
        logger.debug(f"Date validation for '{date_string}': valid")
        return True
    except ValueError:
        logger.debug(f"Date validation for '{date_string}': invalid format")
        return False




# CREATE - add a new Contact
@contacts_bp.route('', methods=['POST'])
@jwt_required()
def create_contact():
    logger.info("Starting contact creation process...")
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)
        data = request.get_json()

        # Validate required fields
        if not data.get('first_name'):
            return jsonify({'error': 'First name is required'}), 400
        
        # Validate email format if provided
        if data.get('email') and not validate_email(data['email']):
            logger.warning(f"Contact creation failed: invalid email format '{data.get('email')}'")
            return jsonify({'error': 'Invalid email format'}), 400
            
        # Validate phone format if provided
        if data.get('phone') and not validate_phone(data['phone']):
            logger.warning(f"Contact creation failed: invalid phone format '{data.get('phone')}'")
            return jsonify({'error': 'Invalid phone number format'}), 400


        # Handle date parsing with DD-MM-YYYY format
        birth_date = None
        if data.get('birth_date'):
            try:
                birth_date = datetime.strptime(data['birth_date'], '%d-%m-%Y').date()
            except ValueError as e:
                return jsonify({'error': 'Invalid birth date format. Use DD-MM-YYYY (e.g., 15-05-1990)'}), 400


        last_contact_date = None
        if data.get('last_contact_date'):
            try:
                last_contact_date = datetime.strptime(data['last_contact_date'], '%d-%m-%Y').date()
            except ValueError as e:
                return jsonify({'error': 'Invalid last contact date format. Use DD-MM-YYYY (e.g., 03-05-2025)'}), 400


        # Validate category if provided
        category_id = data.get('category_id')
        if category_id:
            logger.debug(f"Validating category_id: {category_id}")
            category = Category.query.filter_by(
                id=category_id, 
                creator_id=creator_id
            ).first()
            if not category:
                logger.warning(f"Invalid category_id {category_id} for user {creator_id}")
                return jsonify({
                    'success': False,
                    'message': 'Invalid category'
                }), 400
            logger.debug(f"Category validation successful: {category.name}")


        # Create new contact with updated field names
        logger.debug("Creating new contact object")
        contact = Contact(
            creator_id=creator_id,
            first_name=data['first_name'].strip(),
            last_name=data.get('last_name', '').strip() if data.get('last_name') else None,
            email=data.get('email', '').strip() if data.get('email') else None,
            phone=data.get('phone', '').strip() if data.get('phone') else None,
            is_favorite=data.get('is_favorite', False),
            category_id=category_id,
            birth_date=birth_date,
            last_contact_date=last_contact_date,
            last_contact_place=data.get('last_contact_place', '').strip() if data.get('last_contact_place') else None,
            street_and_nr=data.get('street_and_nr', '').strip() if data.get('street_and_nr') else None,
            postal_code=data.get('postal_code', '').strip() if data.get('postal_code') else None,
            city=data.get('city', '').strip() if data.get('city') else None,
            country=data.get('country', '').strip() if data.get('country') else None,
            notes=data.get('notes', '').strip() if data.get('notes') else None
        )
        
        db.session.add(contact)
        db.session.commit()
        logger.info(f"Contact created successfully: {contact.first_name} {contact.last_name or ''} (ID: {contact.id})")

        return jsonify({
            'success': True,
            'message': 'Contact successfully created',
            'contact': contact.to_dict()
        }), 201
    
    except ValueError as e:
        logger.error(f"ValueError in create_contact: {e}")
        return jsonify({
            'success': False,
            'message': 'Invalid date format'
        }), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Unexpected error in create_contact: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'message': 'Failed to create contact'
        }), 500
    

# READ contact by ID
@contacts_bp.route('<int:contact_id>', methods=['GET'])
@jwt_required()
def get_contact_by_id(contact_id):
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)
        logger.info(f"Updating contact {contact_id} for user ID: {creator_id}")
        
        
        # Find the contact
        contact = Contact.query.filter_by(id=contact_id, creator_id=creator_id).first()

        if not contact:
            logger.warning(f"Contact {contact_id} not found for user {creator_id}")
            return jsonify({
                'success': False,
                'message': 'Contact not found'
            }), 404
        
        logger.debug(f"Found contact: {contact.first_name} {contact.last_name or ''}")

        # Return the contact data
        return jsonify({
            'success': True,
            'contact': contact.to_dict()
        }), 200
        
    except ValueError as e:
        logger.error(f"ValueError in get_contact_by_id: {e}")
        return jsonify({
            'success': False,
            'message': 'Invalid contact ID format'
        }), 400
    
    except Exception as e:
        logger.error(f"Unexpected error in get_contact_by_id: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'message': 'Failed to retrieve contact',
            'error': str(e)
        }), 500


#READ contacts by filter
@contacts_bp.route('', methods=['GET'])
@jwt_required()
def get_contacts():
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)
        logger.info(f"Fetching contacts for user ID: {creator_id}")

        # Get query parameters for pagination and search
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '', type=str).strip()
        
        # Optional query parameters
        favorites_only = request.args.get('favorites', '').lower() == 'true'
        category_id = request.args.get('category_id')

        per_page = min(per_page, 100)
        
        # Base query
        query = Contact.query.filter_by(creator_id=creator_id)

        # Track what filters are applied for better error messages
        applied_filters = []

        # Search by name, email, last contact place, city, country if provided
        if search:
            logger.debug(f"Applying search filter: '{search}'")
            applied_filters.append(f"search term '{search}'")
            search_term = f"%{search}%"
            query = query.filter(
                db.or_(
                    Contact.first_name.ilike(search_term),
                    Contact.last_name.ilike(search_term),
                    Contact.email.ilike(search_term),
                    Contact.last_contact_place.ilike(search_term),
                    Contact.city.ilike(search_term),
                    Contact.country.ilike(search_term),
                    Contact.notes.ilike(search_term)
                )
            )

        # Filter by favorites if requested
        if favorites_only:
            logger.debug("Applying favorites filter")
            applied_filters.append("favorites only")
            query = query.filter_by(is_favorite=True)

        # Filter by category if provided
        if category_id:
            if category_id == 'uncategorized':
                logger.debug("Filtering for uncategorized contacts")
                applied_filters.append("uncategorized contacts")
                query = query.filter(Contact.category_id.is_(None))
            else:
                try:
                    category_id = int(category_id)
                    logger.debug(f"Filtering for category_id: {category_id}")
                    applied_filters.append(f"category ID {category_id}")
                    query = query.filter_by(category_id=category_id)
                except ValueError:
                    logger.warning(f"Invalid category_id format: {category_id}")
                    return jsonify({
                        'success': False,
                        'message': 'Invalid category ID'
                    }), 400

        # Order by favorites first, then by name
        query = query.order_by(Contact.is_favorite.desc(), Contact.first_name.asc())

        # Apply pagination
        contacts = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        # Check if no results found and filters were applied
        if contacts.total == 0 and applied_filters:
            # Create a descriptive error message based on applied filters
            filter_description = ", ".join(applied_filters)
            
            return jsonify({
                'success': False,
                'message': f'No matching contacts found for {filter_description}',
                'details': {
                    'total_results': 0,
                    'applied_filters': applied_filters,
                    'suggestions': [
                        'Try a different search term',
                        'Check spelling',
                        'Remove some filters to broaden your search'
                    ]
                }
            }), 404

        # Check if no results found but no filters applied (user has no contacts at all)
        elif contacts.total == 0:
            return jsonify({
                'success': False,
                'message': 'You have no contacts yet',
                'details': {
                    'total_results': 0,
                    'suggestion': 'Create your first contact to get started'
                }
            }), 404

        # Success - return results
        logger.debug(f"Found {contacts.total} contacts matching criteria")
        
        response_data = {
            'success': True,
            'contacts': [contact.to_dict() for contact in contacts.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': contacts.total,
                'pages': contacts.pages,
                'has_next': contacts.has_next,
                'has_prev': contacts.has_prev
            }
        }
        
        # Add search context if filters were applied
        if applied_filters:
            response_data['search_context'] = {
                'applied_filters': applied_filters,
                'total_matches': contacts.total
            }

        return jsonify(response_data), 200
    
    except Exception as e:
        logger.error(f"Error in get_contacts: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'message': 'Failed to retrieve contacts',
            'error': str(e)
        }), 500
    
    """
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)
        logger.info(f"Fetching contacts for user ID: {creator_id}")

        # Get query parameters for pagination and search
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '', type=str).strip()
        
        # Optional query parameters
        favorites_only = request.args.get('favorites', '').lower() == 'true'
        category_id = request.args.get('category_id')

        per_page = min(per_page, 100)
        
        # Base query
        query = Contact.query.filter_by(creator_id=creator_id)

        # Search by name, email, last contact place, city, country if provided
        if search:
            logger.debug(f"Applying search filter: '{search}'")
            search_term = f"%{search}%"
            query = query.filter(
                db.or_(
                    Contact.first_name.ilike(search_term),
                    Contact.last_name.ilike(search_term),
                    Contact.email.ilike(search_term),
                    Contact.last_contact_place.ilike(search_term),
                    Contact.city.ilike(search_term),
                    Contact.country.ilike(search_term)
                )
            )

        # Filter by favorites if requested
        if favorites_only:
            query = query.filter_by(is_favorite=True)

        # Filter by category if provided
        if category_id:
            if category_id == 'uncategorized':
                query = query.filter(Contact.category_id.is_(None))
            else:
                try:
                    category_id = int(category_id)
                    query = query.filter_by(category_id=category_id)
                    logger.debug(f"Filtering for category_id: {category_id}")
                except ValueError:
                    logger.warning(f"Invalid category_id format: {category_id}")
                    return jsonify({
                        'success': False,
                        'message': 'Invalid category ID'
                    }), 400

        # Order by favorites first, then by name
        query = query.order_by(Contact.is_favorite.desc(), Contact.first_name.asc())

        # Apply pagination (FIXED: removed duplicate query execution)
        contacts = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        return jsonify({
            'success': True,
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
        logger.error(f"Error in get_contacts: {e}", exc_info=True)
        return jsonify({'error': 'Failed to retrieve contacts'}), 500"""


# UPDATE - Update Contact by ID
@contacts_bp.route('/<int:contact_id>', methods=['PUT'])
@jwt_required()
def update_contact(contact_id):
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)
        logger.info(f"Updating contact {contact_id} for user ID: {creator_id}")
        
        data = request.get_json()
        if not data:
            logger.warning("Update failed: No data provided")
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        # Find the contact
        contact = Contact.query.filter_by(id=contact_id, creator_id=creator_id).first()

        if not contact:
            logger.warning(f"Contact {contact_id} not found for user {creator_id}")
            return jsonify({
                'success': False,
                'message': 'Contact not found'
            }), 404
        
        logger.debug(f"Found contact: {contact.first_name} {contact.last_name or ''}")

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
            return jsonify({'error': 'Invalid birth date format. Use DD-MM-YYYY (e.g., 15-05-1990)'}), 400

        if 'last_contact_date' in data and data['last_contact_date'] and not validate_date(data['last_contact_date']):
            return jsonify({'error': 'Invalid last contact date format. Use DD-MM-YYYY (e.g., 03-05-2025)'}), 400

        # Validate category if provided
        if 'category_id' in data:
            category_id = data['category_id']
            if category_id is not None:
                # Verify category belongs to user
                category = Category.query.filter_by(
                    id=category_id, 
                    creator_id=creator_id
                ).first()
                if not category:
                    return jsonify({
                        'success': False,
                        'message': 'Invalid category'
                    }), 400
                logger.debug(f"Category validation successful: {category.name}")


        # Update basic fields
        if 'first_name' in data:
            contact.first_name = data['first_name'].strip()
        if 'last_name' in data:
            contact.last_name = data['last_name'].strip() if data['last_name'] else None
        if 'email' in data:
            contact.email = data['email'].strip() if data['email'] else None
        if 'phone' in data:
            contact.phone = data['phone'].strip() if data['phone'] else None
        if 'is_favorite' in data:
            contact.is_favorite = bool(data['is_favorite'])
        
        # Update category
        if 'category_id' in data:
            contact.category_id = data['category_id']
        
        # Update extended fields (if your Contact model has them)
        if 'birth_date' in data:
            contact.birth_date = datetime.strptime(data['birth_date'], '%d-%m-%Y').date() if data['birth_date'] else None
        if 'last_contact_date' in data:
            contact.last_contact_date = datetime.strptime(data['last_contact_date'], '%d-%m-%Y').date() if data['last_contact_date'] else None
        if 'last_contact_place' in data:
            contact.last_contact_place = data['last_contact_place'].strip() if data['last_contact_place'] else None
        if 'street_and_nr' in data:
            contact.street_and_nr = data['street_and_nr'].strip() if data['street_and_nr'] else None
        if 'postal_code' in data:
            contact.postal_code = data['postal_code'].strip() if data['postal_code'] else None
        if 'city' in data:
            contact.city = data['city'].strip() if data['city'] else None
        if 'country' in data:
            contact.country = data['country'].strip() if data['country'] else None
        if 'notes' in data:
            contact.notes = data['notes'].strip() if data['notes'] else None
        
        # Update timestamp
        contact.updated_at = db.func.current_timestamp()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Contact updated successfully',
            'contact': contact.to_dict()
        }), 200
    
    except ValueError as e:
        logger.error(f"ValueError in update_contact: {e}")
        return jsonify({
            'success': False,
            'message': 'Invalid date format. Use DD-MM-YYYY'
        }), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Unexpected error in update_contact: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'message': 'Failed to update contact',
            'error': str(e)
        }), 500



# DELETE - Delete a contact
@contacts_bp.route('/<int:contact_id>', methods=['DELETE'])
@jwt_required()
def delete_contact(contact_id):
    try:
        creator_id_str = get_jwt_identity()  # Get as string
        creator_id = int(creator_id_str)        # Convert to int
        logger.info(f"Deleting contact {contact_id} for user ID: {creator_id}")

        contact = Contact.query.filter_by(id=contact_id, creator_id=creator_id).first()
        
        if not contact:
            logger.warning(f"Contact {contact_id} not found for user {creator_id}")
            return jsonify({
                'success': False,
                'message': 'Contact not found'
            }), 404
        
        
        db.session.delete(contact)
        db.session.commit()
        logger.info(f"Contact {contact_id} deleted successfully: {contact.first_name} {contact.last_name}")
        return jsonify({
            'success': True,
            'message': 'Contact deleted successfully'
        }), 200
       

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error in delete_contact: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'message': 'Failed to delete contact'
        }), 500


# BULK DELETE - Delete multiple contacts
@contacts_bp.route('/bulk-delete', methods=['DELETE'])
@jwt_required()
def bulk_delete_contacts():
    try:
        creator_id_str = get_jwt_identity()  # Get as string
        creator_id = int(creator_id_str)        # Convert to int
        
        data = request.get_json()
        logger.debug(f"Received bulk delete data: {data}")

        contact_ids = data.get('contact_ids', [])
        
        if not contact_ids or not isinstance(contact_ids, list):
            logger.warning("Bulk delete failed: contact_ids array is required")
            return jsonify({'error': 'contact_ids array is required'}), 400
        
        logger.info(f"Attempting to delete {len(contact_ids)} contacts: {contact_ids}")
        
        # Find and delete contacts
        deleted_count = Contact.query.filter(
            Contact.id.in_(contact_ids),
            Contact.creator_id == creator_id
        ).delete(synchronize_session=False)
        
        db.session.commit()
        
        logger.info(f"Bulk delete completed: {deleted_count} contacts deleted")
        return jsonify({
            'message': f'{deleted_count} contacts deleted successfully',
            'deleted_count': deleted_count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error in bulk_delete_contacts: {e}", exc_info=True)
        return jsonify({'error': 'Failed to delete contacts'}), 500
    
    

# FAVORITES
## Get only favorite contacts
@contacts_bp.route('/favorites', methods=['GET'])
@jwt_required()

def get_favorites():
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)
        
        favorites = Contact.query.filter_by(
            creator_id=creator_id, 
            is_favorite=True
        ).order_by(Contact.first_name.asc()).all()
        
        logger.info(f"Found {len(favorites)} favorite contacts")
        
        return jsonify({
            'success': True,
            'favorites': [contact.to_dict() for contact in favorites],
            'total': len(favorites)
        }), 200
        
    except Exception as e:
        logger.error(f"Error in get_favorites: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'message': 'Failed to fetch favorites'
        }), 500


# Toggle Route for is_Favorite Status
@contacts_bp.route('/<int:contact_id>/favorite', methods=['POST'])
@jwt_required()

def toggle_favorite(contact_id):
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)
        logger.info(f"Toggling favorite for contact {contact_id}, user ID: {creator_id}")
        
        contact = Contact.query.filter_by(id=contact_id, creator_id=creator_id).first()
        
        if not contact:
            logger.warning(f"Contact {contact_id} not found for user {creator_id}")
            return jsonify({
                'success': False,
                'message': 'Contact not found'
            }), 404
        
        # Toggle favorite status
        contact.is_favorite = not contact.is_favorite
        contact.updated_at = db.func.current_timestamp()
        db.session.commit()
        action = "added to" if contact.is_favorite else "removed from"
    
        
        return jsonify({
            'success': True,
            'message': f'Contact {action} favorites',
            'contact': contact.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error in toggle_favorite: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'message': 'Failed to update favorite status'
        }), 500