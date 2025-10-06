from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.contact import Contact
from app.models.category import Category
from app.models.contact_link import ContactLink
from app.models.contact_category import ContactCategory
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
        datetime.strptime(date_string, '%d.%m.%Y')  # ← Changed to dots
        logger.debug(f"Date validation for '{date_string}': valid")
        return True
    except ValueError:
        logger.debug(f"Date validation for '{date_string}': invalid format")
        return False

def validate_url(url):
    """Basic URL validation"""
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    return url_pattern.match(url) is not None


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
                birth_date = datetime.strptime(data['birth_date'], '%d.%m.%Y').date()  # ← Changed to dots
            except ValueError as e:
                return jsonify({'error': 'Invalid birth date format. Use DD.MM.YYYY (e.g., 21.05.2000)'}), 400

        categories = data.get('categories', [])
        category_ids = []

        for category_item in categories:
            # Handle different formats:
            if isinstance(category_item, dict):
                # Format: [{id: 1, name: "Friend"}, {id: 2, name: "Work"}]
                category_id = category_item.get('id')
            elif isinstance(category_item, (int, str)):
                # Format: [1, 2, 3] or ["1", "2", "3"]
                category_id = int(category_item)
            else:
                logger.warning(f"Invalid category format: {category_item}")
                continue

            if category_id:
                # Verify category exists and belongs to user
                category = Category.query.filter_by(
                    id=category_id,
                    creator_id=creator_id
                ).first()

                if not category:
                    logger.warning(f"Category {category_id} not found for user {creator_id}")
                    return jsonify({
                        'success': False,
                        'message': f'Invalid category with ID {category_id}'
                    }), 400
                else:
                    category_ids.append(category_id)
                    logger.info(f"Validated category: {category.name} (ID: {category_id})")


        # Create new contact with updated field names
        logger.debug("Creating new contact object")
        contact = Contact(
            creator_id=creator_id,
            first_name=data['first_name'].strip(),
            last_name=data.get('last_name', '').strip() if data.get('last_name') else None,
            email=data.get('email', '').strip() if data.get('email') else None,
            phone=data.get('phone', '').strip() if data.get('phone') else None,
            is_favorite=data.get('is_favorite', False),
            birth_date=birth_date,
            last_contact_date=data.get('last_contact_date', '').strip() if data.get('last_contact_date') else None,
            next_contact_date=data.get('next_contact_date', '').strip() if data.get('next_contact_date') else None,
            is_contacted=data.get('is_contacted', False),
            is_to_contact = data.get('is_to_contact', False),
            street_and_nr=data.get('street_and_nr', '').strip() if data.get('street_and_nr') else None,
            postal_code=data.get('postal_code', '').strip() if data.get('postal_code') else None,
            city=data.get('city', '').strip() if data.get('city') else None,
            country=data.get('country', '').strip() if data.get('country') else None,
            notes=data.get('notes', '').strip() if data.get('notes') else None
        )
        
        db.session.add(contact)
        db.session.flush()

        # Handle categories after contact is created
        for category_id in category_ids:
            logger.info(f"➕ Adding category {category_id} to contact {contact.id}")
            contact_category = ContactCategory(
                contact_id=contact.id,
                category_id=category_id
            )
            db.session.add(contact_category)

        # Handle links if provided
        links = data.get('links', [])
        for link_item in links:
            # Handle object format from frontend
            if isinstance(link_item, dict):
                link_url = link_item.get('url', '').strip()
                link_title = link_item.get('title', '').strip()
            elif isinstance(link_item, str):
                # Handle legacy string format
                link_url = link_item.strip()
                link_title = ''
            else:
                continue

            if link_url:  # Only process if URL exists
                # Add https:// if not present
                if not link_url.startswith(('http://', 'https://')):
                    link_url = 'https://' + link_url

                # Validate URL format
                if validate_url(link_url):
                    contact_link = ContactLinks(
                        contact_id=contact.id,
                        url=link_url,
                        title=link_title  # Make sure your ContactLinks model has this field
                    )
                    db.session.add(contact_link)


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
                    Contact.contact_place.ilike(search_term),
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
            }), 200

        # Check if no results found but no filters applied (user has no contacts at all)
        elif contacts.total == 0:
            return jsonify({
                'success': True,
                'contacts': [],  # Empty array instead of error
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': 0,
                    'pages': 0,
                    'has_next': False,
                    'has_prev': False
                },
                'message': 'No contacts found'  # Optional message
            }), 200

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
            return jsonify(
                {'error': 'Invalid birth date format. Use DD.MM.YYYY (e.g., 15.05.1990)'}), 400


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

        # Update extended fields
        if 'birth_date' in data:
            contact.birth_date = datetime.strptime(data['birth_date'], '%d.%m.%Y').date() if data['birth_date'] else None
        if 'last_contact_date' in data:
            contact.last_contact_date = data['last_contact_date'].strip() if data['last_contact_date'] else None
        if 'next_contact_date' in data:
            contact.next_contact_date = data['next_contact_date'].strip() if data['next_contact_date'] else None
        if 'is_contacted' in data:
            contact.is_contacted = bool(data['is_contacted'])
        if 'is_to_contact' in data:
            contact.is_to_contact = bool(data['is_to_contact'])
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

        # Check for both possible field names from frontend
        category_ids = data.get('categories') or data.get('category_ids')
        if category_ids is not None:

            # Step 1: Get all current category associations for this contact
            current_associations = ContactCategory.query.filter_by(contact_id=contact.id).all()
            current_category_ids = [assoc.category_id for assoc in current_associations]

            # Step 2: Remove associations that are no longer needed
            for assoc in current_associations:
                if assoc.category_id not in category_ids:
                    logger.info(f"🗑️ Removing category {assoc.category_id}")
                    db.session.delete(assoc)

            # Step 3: Add new associations
            for category_id in category_ids:
                if category_id not in current_category_ids:
                    # Verify category exists and belongs to the user
                    category = Category.query.filter_by(
                        id=category_id,
                        creator_id=creator_id
                    ).first()

                    if category:
                        logger.info(f"Adding category {category_id} ({category.name})")
                        new_association = ContactCategory(
                            contact_id=contact.id,
                            category_id=category_id
                        )
                        db.session.add(new_association)
                    else:
                        logger.warning(f"⚠Category {category_id} not found or doesn't belong to user")
                        return jsonify({'error': f'Category {category_id} not found'}), 400


        if 'links' in data:
            # Remove existing links
            ContactLinks.query.filter_by(contact_id=contact_id).delete()

            # Add new links
            links = data.get('links', [])
            for link_item in links:
                # Handle object format from frontend
                if isinstance(link_item, dict):
                    link_url = link_item.get('url', '').strip()
                    link_title = link_item.get('title', '').strip()
                elif isinstance(link_item, str):
                    # Handle legacy string format
                    link_url = link_item.strip()
                    link_title = ''
                else:
                    continue

                if link_url:  # Only process if URL exists
                    # Add https:// if not present
                    if not link_url.startswith(('http://', 'https://')):
                        link_url = 'https://' + link_url

                    # Validate URL format
                    if validate_url(link_url):
                        contact_link = ContactLinks(
                            contact_id=contact_id,
                            url=link_url,
                            title=link_title  # Make sure your ContactLinks model has this field
                        )
                        db.session.add(contact_link)

        # Update timestamp
        contact.updated_at = db.func.current_timestamp()

        db.session.commit()
        db.session.refresh(contact)
        response_data = contact.to_dict(include_categories=True, include_links=True)
        logger.info(f"Returning updated contact with categories: {response_data.get('categories')}")

        return jsonify({
            'success': True,
            'message': 'Contact updated successfully',
            'contact': contact.to_dict()
        }), 200

    except ValueError as e:
        logger.error(f"ValueError in update_contact: {e}")
        return jsonify({
            'success': False,
            'message': 'Invalid date format. Use DD.MM.YYYY'
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