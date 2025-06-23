from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.category import Category
from app.models.contact import Contact
from app.models.user import User
from app import db

categories_bp = Blueprint('categories', __name__)


@categories_bp.route('', methods=['GET'])  # GET /categories
@jwt_required()
def get_categories():
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str) #current user
        
        categories = Category.query.filter_by(creator_id=creator_id)\
                                 .order_by(Category.name.asc()).all()
        
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
        return jsonify({
            'success': False,
            'message': 'Failed to fetch categories',
            'error': str(e)
        }), 500


#create a new category
@categories_bp.route('', methods=['POST'])  # POST /categories
@jwt_required()
def create_category():
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str) #current user
        data = request.get_json()
        
        if not data:
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
        
        
        return jsonify({
            'success': True,
            'message': 'Category created successfully',
            'category': category.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Failed to create category',
            'error': str(e)
        }), 500



@categories_bp.route('/<int:category_id>', methods=['GET'])  # GET /categories/1
@jwt_required()
def get_category(category_id):
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str) #current user
        data = request.get_json()
        
        if not data:
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
        
        # Get contacts in this category
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
        return jsonify({
            'success': False,
            'message': 'Failed to fetch category',
            'error': str(e)
        }), 500



@categories_bp.route('/<int:category_id>', methods=['PUT'])  # PUT /categories/1
@jwt_required()
def update_category(category_id):
    try:
        creator_id_str = get_jwt_identity()
        creator_id = int(creator_id_str) #current user
        data = request.get_json()
        
        if not data:
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
        
        
        # Update fields if provided
        if 'name' in data:
            new_name = data['name'].strip()
            if not new_name:
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
        
        category = Category.query.filter_by(id=category_id, creator_id=creator_id).first()
        
        if not category:
            return jsonify({
                'success': False,
                'message': 'Category not found'
            }), 404

        
        # Check if category has contacts
        contact_count = Contact.query.filter_by(category_id=category_id).count()
        
        if contact_count > 0:
            return jsonify({
                'success': False,
                'message': f'Cannot delete category. It contains {contact_count} contacts. Remove contacts from category first.',
                'contact_count': contact_count
            }), 400
        
        category_name = category.name
        db.session.delete(category)
        db.session.commit()
        
        
        return jsonify({
            'success': True,
            'message': 'Category deleted successfully'
        }), 200
        
    except Exception as e:
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