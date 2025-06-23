from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.category import Category
from app.models.contact import Contact
from app.models.user import User
from app import db
import logging

categories_bp = Blueprint('categories', __name__)
logger = logging.getLogger(__name__)


#create a new category
@categories_bp.route('', methods=['POST'])  # POST /categories
@jwt_required()
def create_category():
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str) #current user
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


# GET /categories
@categories_bp.route('', methods=['GET'])  
@jwt_required()
def get_categories():
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str) #current user
        logger.info(f"Fetching categories for user ID: {creator_id}")

        categories = Category.query.filter_by(creator_id=creator_id)\
                                 .order_by(Category.name.asc()).all()
        
        logger.debug(f"Found {len(categories)} categories")

        categories_data = []
        for category in categories:
            category_dict = category.to_dict()
            # Add contact count for this category
            category_dict['contact_count'] = Contact.query.filter_by(
                creator_id=creator_id, 
                category_id=category.id
            ).count()
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



@categories_bp.route('/<int:category_id>', methods=['GET'])  # GET /categories/1
@jwt_required()
def get_category_by_id(category_id):
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str) #current user
        logger.info(f"Fetching category {category_id} for user ID: {creator_id}")

        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
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
        
        # Get all contacts in this category
        contacts = Contact.query.filter_by(
            user_id=creator_id, 
            category_id=category_id
        ).order_by(Contact.name.asc()).all()
        
        category_data = category.to_dict()
        category_data['contacts'] = [contact.to_dict(include_category=False) for contact in contacts]
        
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


# UPDATE Category
@categories_bp.route('/<int:category_id>', methods=['PUT'])  # PUT /categories/1
@jwt_required()
def update_category(category_id):
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str) #current user
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
        
        category.updated_at = db.func.current_timestamp()
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
        creator_id = int(creator_id_str) #current user
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

        # Check if category has contacts
        contact_count = Contact.query.filter_by(
            creator_id=creator_id,
            category_id=category_id
        ).count()
        
        if contact_count > 0:
            logger.warning(f"Cannot delete category '{category_name}': contains {contact_count} contacts")
            return jsonify({
                'success': False,
                'message': f'Cannot delete category. It contains {contact_count} contacts. Remove contacts from category first.',
                'contact_count': contact_count
            }), 400
        
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
            'message': f'Failed to delete category {category_name}',
            'error': str(e)
        }), 500



@categories_bp.route('/<int:category_id>/contacts', methods=['GET'])  # GET /categories/1/contacts
@jwt_required()
def get_category_contacts(category_id):
    """Get all contacts in a specific category"""
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str) #current user
        
        # Verify category belongs to user
        category = Category.query.filter_by(id=category_id, creator_id=creator_id).first()
        if not category:
            return jsonify({
                'success': False,
                'message': 'Category not found'
            }), 404
        
        contacts = Contact.query.filter_by(
            user_id=creator_id, 
            category_id=category_id
        ).order_by(Contact.is_favorite.desc(), Contact.name.asc()).all()
        
        contacts_data = [contact.to_dict(include_category=False) for contact in contacts]
        
        return jsonify({
            'success': True,
            'category': category.to_dict(),
            'contacts': contacts_data,
            'total': len(contacts_data)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Failed to fetch category contacts',
            'error': str(e)
        }), 500
    
"""
#GET all contacts in one selected Category
@categories_bp.route('/<int:category_id>/contacts', methods=['GET'])  # GET /categories/1/contacts
@jwt_required()
def get_category_contacts(category_id):
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str)
        logger.info(f"Fetching contacts for category {category_id}, user ID: {creator_id}")
        
        # Verify category belongs to user
        category = Category.query.filter_by(id=category_id, creator_id=creator_id).first()
        if not category:
            logger.warning(f"Category {category_id} not found for user {creator_id}")
            return jsonify({
                'success': False,
                'message': 'Category not found'
            }), 404
        
        logger.debug(f"Found category: {category.name}")
        

        contacts = Contact.query.filter_by(
            creator_id=creator_id, 
            category_id=category_id
        ).order_by(Contact.first_name.asc()).all()
        
        contacts_data = [contact.to_dict(include_category=False) for contact in contacts]
        
        logger.info(f"Found {len(contacts_data)} contacts in category '{category.name}'")
        
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
"""