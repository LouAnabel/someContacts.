from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.category import Category
from app.models.contact import Contact
from app.models.contact_category import ContactCategory
from app import db
import logging

contact_category_bp = Blueprint('contact_categories', __name__)
logger = logging.getLogger(__name__)


# POST / ADD CATEGORY TO CONTACT
@contact_category_bp.route('/contacts/<int:contact_id>/categories', methods=['POST'])  # POST /categories
@jwt_required()
def add_category_to_contact(contact_id):
    """Add one or more categories to a contact"""
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)
        data = request.get_json()

        if not data:
            logger.warning("Category creation failed: No data provided")
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400

        # Verify contact belongs to user
        contact = Contact.query.filter_by(id=contact_id, creator_id=creator_id).first()
        if not contact:
            return jsonify({
                'success': False,
                'message': 'Contact not found'
            }), 404

        # Handle both single category_id and multiple category_ids
        category_ids = data.get('category_ids', [])
        if 'category_id' in data:
            category_ids.append(data['category_id'])

        if not category_ids:
            return jsonify({
                'success': False,
                'message': 'category_id or category_ids required'
            }), 400

        added_categories = []
        already_exists = []
        invalid_categories = []

        for category_id in category_ids:
            # Verify category belongs to user
            category = Category.query.filter_by(id=category_id, creator_id=creator_id).first()
            if not category:
                invalid_categories.append(category_id)
                continue

            # Check if relationship already exists
            existing = ContactCategory.query.filter_by(
                contact_id=contact_id,
                category_id=category_id
            ).first()

            if existing:
                already_exists.append(category.name)
            else:
                contact_category = ContactCategory(
                    contact_id=contact_id,
                    category_id=category_id
                )
                db.session.add(contact_category)
                added_categories.append(category.name)

        db.session.commit()

        response_data = {
            'success': True,
            'message': 'Categories processed',
            'added_categories': added_categories,
            'contact': contact.to_dict(include_categories=True, include_links=False)
        }

        if already_exists:
            response_data['already_exists'] = already_exists
        if invalid_categories:
            response_data['invalid_categories'] = invalid_categories

        return jsonify(response_data), 200

    except Exception as e:
        logger.error(f"Error adding category to contact: {e}", exc_info=True)
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Failed to add category to contact',
            'error': str(e)
        }), 500


# DELETE category from contact
@contact_category_bp.route('/contacts/<int:contact_id>/categories/<int:category_id>', methods=['DELETE'])
@jwt_required()
def remove_category_from_contact(contact_id, category_id):
    """Remove a category from a contact"""
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)

        # Verify contact belongs to user
        contact = Contact.query.filter_by(id=contact_id, creator_id=creator_id).first()
        if not contact:
            return jsonify({
                'success': False,
                'message': 'Contact not found'
            }), 404

        # Verify category belongs to user
        category = Category.query.filter_by(id=category_id, creator_id=creator_id).first()
        if not category:
            return jsonify({
                'success': False,
                'message': 'Category not found'
            }), 404

        # Find and remove the relationship
        contact_category = ContactCategory.query.filter_by(
            contact_id=contact_id,
            category_id=category_id
        ).first()

        if not contact_category:
            return jsonify({
                'success': False,
                'message': 'Contact is not in this category'
            }), 404

        db.session.delete(contact_category)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': f'Removed contact from category "{category.name}"',
            'contact': contact.to_dict(include_categories=True, include_links=False)
        }), 200

    except Exception as e:
        logger.error(f"Error removing category from contact: {e}", exc_info=True)
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Failed to remove category from contact',
            'error': str(e)
        }), 500



# READ / GET all contacts in a category
@contact_category_bp.route('/categories/<int:category_id>/contacts', methods=['GET'])
@jwt_required()
def get_contacts_in_category(category_id):
    """Get all contacts in a specific category"""
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)

        # Verify category belongs to user
        category = Category.query.filter_by(id=category_id, creator_id=creator_id).first()
        if not category:
            return jsonify({
                'success': False,
                'message': 'Category not found'
            }), 404

        # Get contacts in this category
        contacts = Contact.query.join(ContactCategory).filter(
            ContactCategory.category_id == category_id,
            Contact.creator_id == creator_id
        ).order_by(Contact.first_name.asc(), Contact.last_name.asc()).all()

        contacts_data = [contact.to_dict(include_categories=False, include_links=False) for contact in contacts]

        return jsonify({
            'success': True,
            'category': category.to_dict(),
            'contacts': contacts_data,
            'total': len(contacts_data)
        }), 200

    except Exception as e:
        logger.error(f"Error getting contacts in category: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'message': 'Failed to get contacts in category',
            'error': str(e)
        }), 500


# READ / GET all categories for a contact
@contact_category_bp.route('/contacts/<int:contact_id>/categories', methods=['GET'])
@jwt_required()
def get_contact_categories(contact_id):
    """Get all categories for a specific contact"""
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)

        # Verify contact belongs to user
        contact = Contact.query.filter_by(id=contact_id, creator_id=creator_id).first()
        if not contact:
            return jsonify({
                'success': False,
                'message': 'Contact not found'
            }), 404

        categories_data = [category.to_dict() for category in contact.categories]

        return jsonify({
            'success': True,
            'contact': contact.to_dict(include_categories=False, include_links=False),
            'categories': categories_data,
            'total': len(categories_data)
        }), 200

    except Exception as e:
        logger.error(f"Error getting contact categories: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'message': 'Failed to get contact categories',
            'error': str(e)
        }), 500


# UPDATE ALL categories of a contact (replace all categories)
@contact_category_bp.route('/contacts/<int:contact_id>/categories', methods=['PUT'])
@jwt_required()
def update_contact_categories(contact_id):
    """Replace all categories for a contact"""
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)
        data = request.get_json()

        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400

        # Verify contact belongs to user
        contact = Contact.query.filter_by(id=contact_id, creator_id=creator_id).first()
        if not contact:
            return jsonify({
                'success': False,
                'message': 'Contact not found'
            }), 404

        category_ids = data.get('category_ids', [])

        # Validate all category IDs belong to user
        if category_ids:
            valid_categories = Category.query.filter(
                Category.id.in_(category_ids),
                Category.creator_id == creator_id
            ).all()

            if len(valid_categories) != len(category_ids):
                return jsonify({
                    'success': False,
                    'message': 'One or more categories not found'
                }), 404

        # Remove all existing categories for this contact
        ContactCategory.query.filter_by(contact_id=contact_id).delete()

        # Add new categories
        for category_id in category_ids:
            contact_category = ContactCategory(
                contact_id=contact_id,
                category_id=category_id
            )
            db.session.add(contact_category)

        db.session.commit()

        # Refresh contact to get updated categories
        db.session.refresh(contact)

        return jsonify({
            'success': True,
            'message': 'Contact categories updated successfully',
            'contact': contact.to_dict(include_categories=True, include_links=False)
        }), 200

    except Exception as e:
        logger.error(f"Error updating contact categories: {e}", exc_info=True)
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Failed to update contact categories',
            'error': str(e)
        }), 500


# POST MANY / Bulk operations - Add multiple contacts to a category
@contact_category_bp.route('/categories/<int:category_id>/contacts', methods=['POST'])
@jwt_required()
def add_contacts_to_category(category_id):
    """Add multiple contacts to a category"""
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)
        data = request.get_json()

        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400

        # Verify category belongs to user
        category = Category.query.filter_by(id=category_id, creator_id=creator_id).first()
        if not category:
            return jsonify({
                'success': False,
                'message': 'Category not found'
            }), 404

        contact_ids = data.get('contact_ids', [])
        if not contact_ids:
            return jsonify({
                'success': False,
                'message': 'contact_ids required'
            }), 400

        # Verify all contacts belong to user
        valid_contacts = Contact.query.filter(
            Contact.id.in_(contact_ids),
            Contact.creator_id == creator_id
        ).all()

        if len(valid_contacts) != len(contact_ids):
            return jsonify({
                'success': False,
                'message': 'One or more contacts not found'
            }), 404

        added_contacts = []
        already_exists = []

        for contact in valid_contacts:
            # Check if relationship already exists
            existing = ContactCategory.query.filter_by(
                contact_id=contact.id,
                category_id=category_id
            ).first()

            if existing:
                already_exists.append(f"{contact.first_name} {contact.last_name}")
            else:
                contact_category = ContactCategory(
                    contact_id=contact.id,
                    category_id=category_id
                )
                db.session.add(contact_category)
                added_contacts.append(f"{contact.first_name} {contact.last_name}")

        db.session.commit()

        response_data = {
            'success': True,
            'message': f'Contacts processed for category "{category.name}"',
            'added_contacts': added_contacts
        }

        if already_exists:
            response_data['already_exists'] = already_exists

        return jsonify(response_data), 200

    except Exception as e:
        logger.error(f"Error adding contacts to category: {e}", exc_info=True)
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Failed to add contacts to category',
            'error': str(e)
        }), 500