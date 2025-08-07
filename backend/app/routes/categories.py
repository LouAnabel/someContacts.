from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.category import Category
from app.models.contact import Contact
from app.models.contact_category import ContactCategory
from app import db
import logging

categories_bp = Blueprint('categories', __name__)
logger = logging.getLogger(__name__)


# CREATE a new category
@categories_bp.route('', methods=['POST'])  # POST /categories
@jwt_required()
def create_category():
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)  # current user
        data = request.get_json()

        if not data:
            logger.warning("Category creation failed: No data provided")
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400

        name = data.get('name', '').strip()
        if not name:
            return jsonify({
                'success': False,
                'message': 'Category name is required'
            }), 400

        # Check if category with this name already exists for this user
        existing_category = Category.query.filter_by(
            name=name,
            creator_id=creator_id
        ).first()

        if existing_category:
            logger.warning(f"Category creation failed: Name '{name}' already exists for user {creator_id}")
            return jsonify({
                'success': False,
                'message': 'Category with this name already exists'
            }), 409

        category = Category(
            name=name,
            creator_id=creator_id
        )

        db.session.add(category)
        db.session.commit()

        logger.info(f"Category created successfully: '{name}' (ID: {category.id})")

        return jsonify({
            'success': True,
            'message': 'Category created successfully',
            'category': category.to_dict()
        }), 201

    except Exception as e:
        logger.error(f"Error in create_category: {e}", exc_info=True)
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Failed to create category',
            'error': str(e)
        }), 500



# GET CATEGORY BY ID --> /categories/id
@categories_bp.route('/<int:category_id>', methods=['GET'])
@jwt_required()
def get_category_by_id(category_id):
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)  # current user

        category = Category.query.filter_by(
            id=category_id,
            creator_id=creator_id).first()

        if not category:
            logger.warning(f"Category {category_id} not found for user {creator_id}")
            return jsonify({
                'success': False,
                'message': 'Category not found'
            }), 404

        logger.debug(f"Found category: {category.name}")

        # Get all contacts in this category using the many-to-many relationship
        contacts = Contact.query.join(ContactCategory).filter(
            ContactCategory.category_id == category_id,
            Contact.creator_id == creator_id
        ).order_by(Contact.first_name.asc(), Contact.last_name.asc()).all()

        category_data = category.to_dict()
        category_data['contacts'] = [contact.to_dict(include_categories=False) for contact in contacts]

        return jsonify({
            'success': True,
            'category': category_data
        }), 200

    except Exception as e:
        logger.error(f"Error in get_category: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'message': 'Failed to fetch category',
            'error': str(e)
        }), 500


# GET ALL CATEGORIES
@categories_bp.route('', methods=['GET'])
@jwt_required()
def get_categories():
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)  # current user

        categories = Category.query.filter_by(creator_id=creator_id) \
            .order_by(Category.name.asc()).all()

        logger.debug(f"Found {len(categories)} categories")

        categories_data = []
        for category in categories:
            category_dict = category.to_dict()
            # Contact count is already included in the to_dict method via the relationship
            categories_data.append(category_dict)

        return jsonify({
            'success': True,
            'categories': categories_data,
            'total': len(categories_data)
        }), 200

    except Exception as e:
        logger.error(f"Error in get_categories: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'message': 'Failed to fetch categories',
            'error': str(e)
        }), 500


# GET ALL CONTACTS IN ONE SPECIFIC CATEGORY
@categories_bp.route('/<int:category_id>/contacts', methods=['GET'])  # GET /categories/1/contacts
@jwt_required()
def get_category_contacts(category_id):
    """Get all contacts in a specific category"""
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)  # current user

        # Verify category belongs to user
        category = Category.query.filter_by(id=category_id, creator_id=creator_id).first()
        if not category:
            return jsonify({
                'success': False,
                'message': 'Category not found'
            }), 404

        # Get contacts using the many-to-many relationship
        contacts = Contact.query.join(ContactCategory).filter(
            ContactCategory.category_id == category_id,
            Contact.creator_id == creator_id
        ).order_by(Contact.first_name.asc(), Contact.last_name.asc()).all()

        contacts_data = [contact.to_dict(include_categories=False) for contact in contacts]

        return jsonify({
            'success': True,
            'category': category.to_dict(),
            'contacts': contacts_data,
            'total': len(contacts_data)
        }), 200

    except Exception as e:
        logger.error(f"Error in get_category_contacts: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'message': 'Failed to fetch category contacts',
            'error': str(e)
        }), 500


# UPDATE Category
@categories_bp.route('/<int:category_id>', methods=['PUT'])  # PUT /categories/1
@jwt_required()
def update_category(category_id):
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)  # current user
        logger.info(f"Updating category {category_id} for user ID: {creator_id}")

        data = request.get_json()
        if not data:
            logger.warning("Category update failed: No data provided")
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400

        category = Category.query.filter_by(id=category_id, creator_id=creator_id).first()

        if not category:
            return jsonify({
                'success': False,
                'message': 'Category not found'
            }), 404

        logger.debug(f"Found category to update: {category.name}")

        # Update fields if provided
        if 'name' in data:
            new_name = data['name'].strip()
            if not new_name:
                logger.warning("Category update failed: Name cannot be empty")
                return jsonify({
                    'success': False,
                    'message': 'Category name cannot be empty'
                }), 400

            # Check for duplicate name (excluding current category)
            existing = Category.query.filter(
                Category.name == new_name,
                Category.creator_id == creator_id,
                Category.id != category_id
            ).first()

            if existing:
                logger.warning(f"Category update failed: Name '{new_name}' already exists")
                return jsonify({
                    'success': False,
                    'message': 'Category with this name already exists'
                }), 409

            category.name = new_name

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Category updated successfully',
            'category': category.to_dict()
        }), 200

    except Exception as e:
        logger.error(f"Error in update_category: {e}", exc_info=True)
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Failed to update category',
            'error': str(e)
        }), 500


@categories_bp.route('/<int:category_id>', methods=['DELETE'])  # DELETE /categories/1
@jwt_required()
def delete_category(category_id):
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)  # current user
        logger.info(f"Starting delete_category for category ID: {category_id}")

        category = Category.query.filter_by(id=category_id, creator_id=creator_id).first()

        if not category:
            logger.warning(f"Category {category_id} not found for user {creator_id}")
            return jsonify({
                'success': False,
                'message': 'Category not found'
            }), 404

        category_name = category.name
        logger.debug(f"Found category to delete: {category_name}")

        # Check if category has contacts (using the many-to-many relationship)
        contact_count = ContactCategory.query.filter_by(category_id=category_id).count()

        if contact_count > 0:
            logger.warning(f"Cannot delete category '{category_name}': contains {contact_count} contacts")
            return jsonify({
                'success': False,
                'message': f'Cannot delete category. It contains {contact_count} contacts. Remove contacts from category first.',
                'contact_count': contact_count
            }), 400

        # Delete the category (ContactCategory entries will be cascade deleted)
        db.session.delete(category)
        db.session.commit()

        logger.info(f"Category '{category_name}' deleted successfully")
        return jsonify({
            'success': True,
            'message': 'Category deleted successfully'
        }), 200

    except Exception as e:
        logger.error(f"Error in delete_category: {e}", exc_info=True)
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Failed to delete category',
            'error': str(e)
        }), 500


# Bulk operation - Get category statistics
@categories_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_category_stats():
    """Get statistics about categories and their contact counts"""
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)

        # Get category stats using a join query for efficiency
        category_stats = db.session.query(
            Category.id,
            Category.name,
            db.func.count(ContactCategory.id).label('contact_count')
        ).outerjoin(ContactCategory).filter(
            Category.creator_id == creator_id
        ).group_by(Category.id, Category.name).all()

        stats_data = []
        total_categories = 0
        total_relationships = 0

        for stat in category_stats:
            stats_data.append({
                'id': stat.id,
                'name': stat.name,
                'contact_count': stat.contact_count
            })
            total_categories += 1
            total_relationships += stat.contact_count

        # Get uncategorized contacts count
        uncategorized_count = Contact.query.outerjoin(ContactCategory).filter(
            Contact.creator_id == creator_id,
            ContactCategory.id.is_(None)
        ).count()

        return jsonify({
            'success': True,
            'stats': {
                'total_categories': total_categories,
                'total_relationships': total_relationships,
                'uncategorized_contacts': uncategorized_count,
                'categories': stats_data
            }
        }), 200

    except Exception as e:
        logger.error(f"Error in get_category_stats: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'message': 'Failed to fetch category statistics',
            'error': str(e)
        }), 500