from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import request, jsonify
from app.models.contact import Contact
from app.models.contact_links import ContactLinks
from app import db
import re
from datetime import datetime
import logging


contacts_bp = Blueprint('contacts', __name__)
logger = logging.getLogger(__name__)


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



# GET all links for a specific contact
@contacts_bp.route('/contacts/<int:contact_id>/links', methods=['GET'])
@jwt_required()
def get_contact_links(contact_id):

    try:
        current_user_id = get_jwt_identity()

        # Verify contact belongs to user
        contact = Contact.query.filter_by(
            id=contact_id,
            creator_id=current_user_id
        ).first()

        if not contact:
            return jsonify({'error': 'Contact not found'}), 404

        # Get all links for this contact
        links = ContactLinks.query.filter_by(contact_id=contact_id).all()

        return jsonify({
            'links': [link.to_dict() for link in links],
            'success': True,
            'total': len(links)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500



@contacts_bp.route('/contacts/<int:contact_id>/links', methods=['POST'])
@jwt_required()
def add_contact_link(contact_id):
    """Add a new link to a contact"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()

        # Verify contact belongs to user
        contact = Contact.query.filter_by(
            id=contact_id,
            creator_id=current_user_id
        ).first()

        if not contact:
            return jsonify({'error': 'Contact not found'}), 404

        # Validate required fields
        if not data.get('url'):
            return jsonify({'error': 'URL is required'}), 400

        url = data['url'].strip()

        # Add https:// if not present
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url

        # Validate URL format
        if not validate_url(url):
            return jsonify({'error': 'Invalid URL format'}), 400

        # Create new link
        new_link = ContactLinks(
            contact_id=contact_id,
            url=url,
            title=data.get('title', '').strip() or None,
            link_type=data.get('link_type', '').strip() or None
        )

        db.session.add(new_link)
        db.session.commit()

        return jsonify({
            'link': new_link.to_dict(),
            'success': True,
            'message': 'Link added successfully'
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@contacts_bp.route('/contacts/<int:contact_id>/links/<int:link_id>', methods=['PUT'])
@jwt_required()
def update_contact_link(contact_id, link_id):
    """Update a specific link"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()

        # Verify contact belongs to user
        contact = Contact.query.filter_by(
            id=contact_id,
            creator_id=current_user_id
        ).first()

        if not contact:
            return jsonify({'error': 'Contact not found'}), 404

        # Find the link
        link = ContactLinks.query.filter_by(
            id=link_id,
            contact_id=contact_id
        ).first()

        if not link:
            return jsonify({'error': 'Link not found'}), 404

        # Update fields if provided
        if 'url' in data:
            url = data['url'].strip()
            if not url.startswith(('http://', 'https://')):
                url = 'https://' + url

            if not validate_url(url):
                return jsonify({'error': 'Invalid URL format'}), 400

            link.url = url

        if 'title' in data:
            link.title = data['title'].strip() or None

        if 'link_type' in data:
            link.link_type = data['link_type'].strip() or None

        db.session.commit()

        return jsonify({
            'link': link.to_dict(),
            'success': True,
            'message': 'Link updated successfully'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@contacts_bp.route('/contacts/<int:contact_id>/links/<int:link_id>', methods=['DELETE'])
@jwt_required()
def delete_contact_link(contact_id, link_id):
    """Delete a specific link"""
    try:
        current_user_id = get_jwt_identity()

        # Verify contact belongs to user
        contact = Contact.query.filter_by(
            id=contact_id,
            creator_id=current_user_id
        ).first()

        if not contact:
            return jsonify({'error': 'Contact not found'}), 404

        # Find and delete the link
        link = ContactLinks.query.filter_by(
            id=link_id,
            contact_id=contact_id
        ).first()

        if not link:
            return jsonify({'error': 'Link not found'}), 404

        db.session.delete(link)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Link deleted successfully'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500