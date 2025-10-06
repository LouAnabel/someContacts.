from typing import Dict, Any, List
from app import db
from datetime import datetime, timezone
from app.models.contact_category import ContactCategory


class Contact(db.Model):
    __tablename__ = 'contacts'

    id = db.Column(db.Integer, primary_key=True)
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Basic Contact Information
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=True)  # Optional
    is_favorite = db.Column(db.Boolean, default=False, nullable=True)

    # Additional fields that your to_dict() method expects
    birth_date = db.Column(db.Date, nullable=True)
    is_to_contact = db.Column(db.Boolean, default=False, nullable=True)
    is_contacted = db.Column(db.Boolean, default=False, nullable=True)
    next_contact_date = db.Date(db.Date, nullable=True)
    next_contact_place = db.Column(db.String(200), nullable=True)
    last_contact_date= db.String(db.String(200), nullable=True)

    emails = db.relationship('ContactEmail', backref='contact', lazy='dynamic', cascade='all, delete-orphan')
    phones = db.relationship('ContactPhone', backref='contact', lazy='dynamic', cascade='all, delete-orphan')
    addresses = db.relationship('ContactAddress', backref='contact', lazy='dynamic', cascade='all, delete-orphan')

    notes = db.Column(db.String(2000))

    links = db.relationship('ContactLink', backref='contact', lazy='dynamic', cascade='all, delete-orphan')
    # Many-to-many Relationships
    contact_categories = db.relationship('ContactCategory', back_populates='contact', cascade='all, delete-orphan')
    categories = db.relationship('Category', secondary='contact_categories', back_populates='contacts', viewonly=True)


    # Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), 
                          onupdate=lambda: datetime.now(timezone.utc))


    # Constraints for data integrity
    __table_args__ = (
        # Index for creator_id and email queries (allows duplicates)
        db.Index('idx_creator_email', 'creator_id', 'email', unique=False,
                 postgresql_where=db.text('email IS NOT NULL')),
        db.Index('idx_creator_favorite', 'creator_id', 'is_favorite'),
        # Check constraints
        db.CheckConstraint('length(first_name) > 0', name='check_first_name_not_empty'),
        db.CheckConstraint('birth_date <= CURRENT_DATE', name='check_birth_date_not_future'),
    )

    def to_dict(self, include_phones=True, include_emails=True, include_addresses=True, include_categories=True, include_links=True):
        data: dict[str | Any, None | dict[str, Any] | list[Any] | Any] = {
            'id': self.id,
            'creator_id': self.creator_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'is_favorite': self.is_favorite,
            'birth_date': self.birth_date.strftime('%d.%m.%Y') if self.birth_date else None,
            'is_contacted':self.is_contacted,
            'is_to_contact' : self.is_to_contact,
            'last_contact_date': self.last_contact_date,
            'next_contact_date': self.next_contact_date,
            'next_contact_place': self.next_contact_place,
            'notes': self.notes,
            'created_at': self.created_at.strftime('%d.%m.%Y %H:%M:%S') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%d.%m.%Y %H:%M:%S') if self.updated_at else None,
        }

        if include_phones:
            data['phones'] = [phone.to_dict() for phone in self.phones.all()]
        if include_emails:
            data['emails'] = [email.to_dict() for email in self.emails.all()]
        if include_addresses:
            data['addresses'] = [address.to_dict() for address in self.addresses.all()]

        if include_links:
            data['links'] = [link.to_dict() for link in self.links.all()]

        if include_categories:
            data['categories'] = [category.to_dict() for category in self.categories]

        return data

    def add_category(self, category_id):
        """Add a category to this contact"""
        if not any(cc.category_id == category_id for cc in self.contact_categories):
            contact_category = ContactCategory(contact_id=self.id, category_id=category_id)
            db.session.add(contact_category)
            return contact_category
        return None

    def remove_category(self, category_id):
        """Remove a category from this contact"""
        contact_category = ContactCategory.query.filter_by(
            contact_id=self.id,
            category_id=category_id
        ).first()
        if contact_category:
            db.session.delete(contact_category)
            return True
        return False

    def __repr__(self):
        return f'<Contact {self.first_name} {self.last_name}>'