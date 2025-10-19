from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.contact import Contact
from app.models.category import Category
from app.models.contact_category import ContactCategory
from app.models.contact_email import ContactEmail
from app.models.contact_phone import ContactPhone
from app.models.contact_address import ContactAddress
from app.models.contact_link import ContactLink
import re
from datetime import datetime
import logging

contacts_bp = Blueprint('contacts', __name__)
logger = logging.getLogger(__name__)


# Validation helpers
def validate_email(email):
    if not email:
        return True
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_pattern, email) is not None


def validate_phone(phone):
    if not phone:
        return True
    clean_phone = re.sub(r'[^\d+]', '', phone)
    pattern = r'^\+?[\d]{7,15}$'
    return re.match(pattern, clean_phone) is not None


def validate_date(date_string, allow_future=False):
    """Validate date in DD.MM.YYYY format"""
    if not date_string:
        return True, None
    try:
        date_obj = datetime.strptime(date_string, '%d.%m.%Y').date()
        today = datetime.today().date()

        if not allow_future and date_obj > today:
            return False, f"Date cannot be in the future"
        if allow_future and date_obj <= today:
            return False, f"Date must be in the future"

        return True, date_obj
    except ValueError:
        return False, "Invalid date format. Use DD.MM.YYYY"


def validate_url(url):
    """Basic URL validation"""
    url_pattern = re.compile(
        r'^https?://'
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'
        r'localhost|'
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'
        r'(?::\d+)?'
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    return url_pattern.match(url) is not None


# CREATE - Add a new Contact
@contacts_bp.route('', methods=['POST'])
@jwt_required()
def create_contact():
    logger.info("Starting contact creation process...")
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)
        data = request.get_json()

        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        # Validate required fields
        if not data.get('first_name'):
            return jsonify({'success': False, 'message': 'First name is required'}), 400

        # Parse and validate dates
        birth_date = None
        if data.get('birth_date'):
            is_valid, date_obj = validate_date(data['birth_date'], allow_future=False)
            if not is_valid:
                return jsonify({'success': False, 'message': date_obj}), 400
            birth_date = date_obj

        next_contact_date = None
        if data.get('next_contact_date'):
            is_valid, date_obj = validate_date(data['next_contact_date'], allow_future=True)
            if not is_valid:
                return jsonify({'success': False, 'message': date_obj}), 400
            next_contact_date = date_obj

        # Validate categories
        category_ids = []
        if data.get('categories'):
            categories = data['categories'] if isinstance(data['categories'], list) else [data['categories']]
            for category_item in categories:
                category_id = category_item.get('id') if isinstance(category_item, dict) else int(category_item)

                category = Category.query.filter_by(id=category_id, creator_id=creator_id).first()
                if not category:
                    return jsonify({'success': False, 'message': f'Category {category_id} not found'}), 400
                category_ids.append(category_id)

        # Create contact with basic fields only
        contact = Contact(
            creator_id=creator_id,
            first_name=data['first_name'].strip(),
            last_name=data.get('last_name', '').strip() if data.get('last_name') else None,
            is_favorite=data.get('is_favorite', False),
            birth_date=birth_date,
            next_contact_date=next_contact_date,
            next_contact_place=data.get('next_contact_place', '').strip() if data.get('next_contact_place') else None,
            last_contact_date=data.get('last_contact_date', '').strip() if data.get('last_contact_date') else None,
            is_contacted=data.get('is_contacted', False),
            is_to_contact=data.get('is_to_contact', False),
            notes=data.get('notes', '').strip() if data.get('notes') else None
        )

        db.session.add(contact)
        db.session.flush()

        # Add categories
        for category_id in category_ids:
            contact_category = ContactCategory(contact_id=contact.id, category_id=category_id)
            db.session.add(contact_category)

        # Add emails
        if data.get('emails') and isinstance(data['emails'], list):
            for email_item in data['emails']:
                if isinstance(email_item, dict):
                    email = email_item.get('email', '').strip()
                    if email and validate_email(email):
                        contact_email = ContactEmail(
                            owner_type='contact',
                            contact_id=contact.id,
                            email=email,
                            title=email_item.get('title', '').strip()
                        )
                        db.session.add(contact_email)

        # Add phones
        if data.get('phones') and isinstance(data['phones'], list):
            for phone_item in data['phones']:
                if isinstance(phone_item, dict):
                    phone = phone_item.get('phone', '').strip()
                    if phone and validate_phone(phone):
                        contact_phone = ContactPhone(
                            owner_type='contact',
                            contact_id=contact.id,
                            phone=phone,
                            title=phone_item.get('title', '').strip()
                        )
                        db.session.add(contact_phone)

        # Add addresses
        if data.get('addresses') and isinstance(data['addresses'], list):
            for address_item in data['addresses']:
                if isinstance(address_item, dict):
                    if all(k in address_item for k in ['street_and_nr', 'postal_code', 'city', 'country', 'title']):
                        contact_address = ContactAddress(
                            owner_type='contact',
                            contact_id=contact.id,
                            street_and_nr=address_item['street_and_nr'].strip(),
                            additional_info=address_item.get('additional_info', '').strip() if address_item.get(
                                'additional_info') else None,
                            postal_code=address_item['postal_code'].strip(),
                            city=address_item['city'].strip(),
                            country=address_item['country'].strip(),
                            title=address_item['title'].strip()
                        )
                        db.session.add(contact_address)

        # Add links
        if data.get('links') and isinstance(data['links'], list):
            for link_item in data['links']:
                if isinstance(link_item, dict):
                    url = link_item.get('url', '').strip()
                    if url:
                        if not url.startswith(('http://', 'https://')):
                            url = 'https://' + url
                        if validate_url(url):
                            contact_link = ContactLink(
                                owner_type='contact',
                                contact_id=contact.id,
                                url=url,
                                title=link_item.get('title', '').strip()
                            )
                            db.session.add(contact_link)

        db.session.commit()
        logger.info(f"Contact created: {contact.first_name} {contact.last_name or ''} (ID: {contact.id})")

        return jsonify({
            'success': True,
            'message': 'Contact successfully created',
            'contact': contact.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error in create_contact: {e}", exc_info=True)
        return jsonify({'success': False, 'message': 'Failed to create contact', 'error': str(e)}), 500


# READ - Get contact by ID
@contacts_bp.route('/<int:contact_id>', methods=['GET'])
@jwt_required()
def get_contact_by_id(contact_id):
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)

        contact = Contact.query.filter_by(id=contact_id, creator_id=creator_id).first()

        if not contact:
            logger.warning(f"Contact {contact_id} not found for user {creator_id}")
            return jsonify({'success': False, 'message': 'Contact not found'}), 404

        return jsonify({'success': True, 'contact': contact.to_dict()}), 200

    except Exception as e:
        logger.error(f"Error in get_contact_by_id: {e}", exc_info=True)
        return jsonify({'success': False, 'message': 'Failed to retrieve contact', 'error': str(e)}), 500


# READ - Get contacts with filtering
@contacts_bp.route('', methods=['GET'])
@jwt_required()
def get_contacts():
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)

        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '', type=str).strip()
        favorites_only = request.args.get('favorites', '').lower() == 'true'
        category_id = request.args.get('category_id')

        per_page = min(per_page, 100)

        query = Contact.query.filter_by(creator_id=creator_id)
        applied_filters = []

        # Search by name, notes
        if search:
            logger.debug(f"Applying search filter: '{search}'")
            applied_filters.append(f"search term '{search}'")
            search_term = f"%{search}%"
            query = query.filter(
                db.or_(
                    Contact.first_name.ilike(search_term),
                    Contact.last_name.ilike(search_term),
                    Contact.next_contact_place.ilike(search_term),
                    Contact.notes.ilike(search_term)
                )
            )

        # Filter by favorites
        if favorites_only:
            logger.debug("Applying favorites filter")
            applied_filters.append("favorites only")
            query = query.filter_by(is_favorite=True)

        # Filter by category
        if category_id:
            if category_id == 'uncategorized':
                logger.debug("Filtering for uncategorized contacts")
                applied_filters.append("uncategorized contacts")
                query = query.outerjoin(ContactCategory).filter(ContactCategory.id.is_(None))
            else:
                try:
                    category_id = int(category_id)
                    logger.debug(f"Filtering for category_id: {category_id}")
                    applied_filters.append(f"category ID {category_id}")
                    query = query.join(ContactCategory).filter(ContactCategory.category_id == category_id)
                except ValueError:
                    return jsonify({'success': False, 'message': 'Invalid category ID'}), 400

        query = query.order_by(Contact.is_favorite.desc(), Contact.first_name.asc())

        contacts = query.paginate(page=page, per_page=per_page, error_out=False)

        if contacts.total == 0:
            if applied_filters:
                filter_description = ", ".join(applied_filters)
                return jsonify({
                    'success': False,
                    'message': f'No matching contacts found for {filter_description}',
                    'details': {
                        'total_results': 0,
                        'applied_filters': applied_filters
                    }
                }), 200
            else:
                return jsonify({
                    'success': True,
                    'contacts': [],
                    'pagination': {
                        'page': page,
                        'per_page': per_page,
                        'total': 0,
                        'pages': 0,
                        'has_next': False,
                        'has_prev': False
                    },
                    'message': 'No contacts found'
                }), 200

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

        if applied_filters:
            response_data['search_context'] = {
                'applied_filters': applied_filters,
                'total_matches': contacts.total
            }

        return jsonify(response_data), 200

    except Exception as e:
        logger.error(f"Error in get_contacts: {e}", exc_info=True)
        return jsonify({'success': False, 'message': 'Failed to retrieve contacts', 'error': str(e)}), 500


# UPDATE - Update contact
@contacts_bp.route('/<int:contact_id>', methods=['PUT'])
@jwt_required()
def update_contact(contact_id):
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)

        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        contact = Contact.query.filter_by(id=contact_id, creator_id=creator_id).first()

        if not contact:
            logger.warning(f"Contact {contact_id} not found for user {creator_id}")
            return jsonify({'success': False, 'message': 'Contact not found'}), 404

        # Update basic fields
        if 'first_name' in data and data['first_name'].strip():
            contact.first_name = data['first_name'].strip()
        if 'last_name' in data:
            contact.last_name = data['last_name'].strip() if data['last_name'] else None
        if 'is_favorite' in data:
            contact.is_favorite = bool(data['is_favorite'])
        if 'is_contacted' in data:
            contact.is_contacted = bool(data['is_contacted'])
        if 'is_to_contact' in data:
            contact.is_to_contact = bool(data['is_to_contact'])
        if 'next_contact_place' in data:
            contact.next_contact_place = data['next_contact_place'].strip() if data['next_contact_place'] else None
        if 'last_contact_date' in data:
            contact.last_contact_date = data['last_contact_date'].strip() if data['last_contact_date'] else None
        if 'notes' in data:
            contact.notes = data['notes'].strip() if data['notes'] else None

        # Update birth_date
        if 'birth_date' in data:
            if data['birth_date']:
                is_valid, date_obj = validate_date(data['birth_date'], allow_future=False)
                if not is_valid:
                    return jsonify({'success': False, 'message': date_obj}), 400
                contact.birth_date = date_obj
            else:
                contact.birth_date = None

        # Update next_contact_date
        if 'next_contact_date' in data:
            if data['next_contact_date']:
                is_valid, date_obj = validate_date(data['next_contact_date'], allow_future=True)
                if not is_valid:
                    return jsonify({'success': False, 'message': date_obj}), 400
                contact.next_contact_date = date_obj
            else:
                contact.next_contact_date = None

        # Update emails
        if 'emails' in data and isinstance(data['emails'], list):
            ContactEmail.query.filter_by(contact_id=contact_id, owner_type='contact').delete()
            for email_item in data['emails']:
                if isinstance(email_item, dict):
                    email = email_item.get('email', '').strip()
                    if email and validate_email(email):
                        contact_email = ContactEmail(
                            owner_type='contact',
                            contact_id=contact_id,
                            email=email,
                            title=email_item.get('title', '').strip()
                        )
                        db.session.add(contact_email)

        # Update phones
        if 'phones' in data and isinstance(data['phones'], list):
            ContactPhone.query.filter_by(contact_id=contact_id, owner_type='contact').delete()
            for phone_item in data['phones']:
                if isinstance(phone_item, dict):
                    phone = phone_item.get('phone', '').strip()
                    if phone and validate_phone(phone):
                        contact_phone = ContactPhone(
                            owner_type='contact',
                            contact_id=contact_id,
                            phone=phone,
                            title=phone_item.get('title', '').strip()
                        )
                        db.session.add(contact_phone)

        # Update addresses
        if 'addresses' in data and isinstance(data['addresses'], list):
            ContactAddress.query.filter_by(contact_id=contact_id, owner_type='contact').delete()
            for address_item in data['addresses']:
                if isinstance(address_item, dict):
                    if all(k in address_item for k in ['street_and_nr', 'postal_code', 'city', 'country', 'title']):
                        contact_address = ContactAddress(
                            owner_type='contact',
                            contact_id=contact_id,
                            street_and_nr=address_item['street_and_nr'].strip(),
                            additional_info=address_item.get('additional_info', '').strip() if address_item.get(
                                'additional_info') else None,
                            postal_code=address_item['postal_code'].strip(),
                            city=address_item['city'].strip(),
                            country=address_item['country'].strip(),
                            title=address_item['title'].strip()
                        )
                        db.session.add(contact_address)

        # Update links
        if 'links' in data and isinstance(data['links'], list):
            ContactLink.query.filter_by(contact_id=contact_id, owner_type='contact').delete()
            for link_item in data['links']:
                if isinstance(link_item, dict):
                    url = link_item.get('url', '').strip()
                    if url:
                        if not url.startswith(('http://', 'https://')):
                            url = 'https://' + url
                        if validate_url(url):
                            contact_link = ContactLink(
                                owner_type='contact',
                                contact_id=contact_id,
                                url=url,
                                title=link_item.get('title', '').strip()
                            )
                            db.session.add(contact_link)

        # Update categories
        if 'categories' in data:
            category_ids = data['categories'] if isinstance(data['categories'], list) else []

            # Validate all category IDs
            if category_ids:
                valid_categories = Category.query.filter(
                    Category.id.in_(category_ids),
                    Category.creator_id == creator_id
                ).all()
                if len(valid_categories) != len(category_ids):
                    return jsonify({'success': False, 'message': 'One or more categories not found'}), 404

            # Remove existing categories
            ContactCategory.query.filter_by(contact_id=contact_id).delete()

            # Add new categories
            for category_id in category_ids:
                contact_category = ContactCategory(contact_id=contact_id, category_id=category_id)
                db.session.add(contact_category)

        contact.updated_at = db.func.current_timestamp()
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Contact updated successfully',
            'contact': contact.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error in update_contact: {e}", exc_info=True)
        return jsonify({'success': False, 'message': 'Failed to update contact', 'error': str(e)}), 500


# DELETE - Delete contact
@contacts_bp.route('/<int:contact_id>', methods=['DELETE'])
@jwt_required()
def delete_contact(contact_id):
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)

        contact = Contact.query.filter_by(id=contact_id, creator_id=creator_id).first()

        if not contact:
            logger.warning(f"Contact {contact_id} not found for user {creator_id}")
            return jsonify({'success': False, 'message': 'Contact not found'}), 404

        db.session.delete(contact)
        db.session.commit()
        logger.info(f"Contact {contact_id} deleted: {contact.first_name} {contact.last_name}")

        return jsonify({'success': True, 'message': 'Contact deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error in delete_contact: {e}", exc_info=True)
        return jsonify({'success': False, 'message': 'Failed to delete contact'}), 500


# BULK DELETE - Delete multiple contacts
@contacts_bp.route('/bulk-delete', methods=['DELETE'])
@jwt_required()
def bulk_delete_contacts():
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)

        data = request.get_json()
        contact_ids = data.get('contact_ids', []) if data else []

        if not contact_ids or not isinstance(contact_ids, list):
            return jsonify({'success': False, 'message': 'contact_ids array is required'}), 400

        deleted_count = Contact.query.filter(
            Contact.id.in_(contact_ids),
            Contact.creator_id == creator_id
        ).delete(synchronize_session=False)

        db.session.commit()
        logger.info(f"Bulk deleted {deleted_count} contacts")

        return jsonify({
            'success': True,
            'message': f'{deleted_count} contacts deleted successfully',
            'deleted_count': deleted_count
        }), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error in bulk_delete_contacts: {e}", exc_info=True)
        return jsonify({'success': False, 'message': 'Failed to delete contacts'}), 500


# GET favorites
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
        return jsonify({'success': False, 'message': 'Failed to fetch favorites'}), 500


# Toggle favorite status
@contacts_bp.route('/<int:contact_id>/favorite', methods=['POST'])
@jwt_required()
def toggle_favorite(contact_id):
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)

        contact = Contact.query.filter_by(id=contact_id, creator_id=creator_id).first()

        if not contact:
            return jsonify({'success': False, 'message': 'Contact not found'}), 404

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
        return jsonify({'success': False, 'message': 'Failed to update favorite status'}), 500