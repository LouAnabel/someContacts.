from app import db
from sqlalchemy import text
from datetime import datetime, timezone



class Contact(db.Model):
    __tablename__ = 'contacts'  # Changed to plural for consistency

    id = db.Column(db.Integer, primary_key=True)
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Basic Contact Information
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=True)  # Optional
    email = db.Column(db.String(255), nullable=True)  # Optional and removed unique constraint
    phone = db.Column(db.String(20), nullable=True)
    is_favorite = db.Column(db.Boolean, default=False, nullable=False)
    
    # Additional fields that your to_dict() method expects
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    birth_date = db.Column(db.Date,nullable=True)
    last_contact_date = db.Column(db.Date, nullable=True)
    last_contact_place = db.Column(db.String(200), nullable=True)
    street_and_nr = db.Column(db.String(200), nullable=True)
    postal_code = db.Column(db.String(100), nullable=True)
    city = db.Column(db.String(100), nullable=True)
    country = db.Column(db.String(100), nullable=True)
    notes = db.Column(db.String(2000))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), 
                          onupdate=lambda: datetime.now(timezone.utc))


    # Constraints for data integrity
    __table_args__ = (
        # Ensure email uniqueness per user (if provided)
        db.Index('idx_creator_email', 'creator_id', 'email', unique=True, 
                postgresql_where=db.text('email IS NOT NULL')),
        # Index for common queries
        db.Index('idx_creator_category', 'creator_id', 'category_id'),
        db.Index('idx_creator_favorite', 'creator_id', 'is_favorite'),
        # Check constraints
        db.CheckConstraint('length(first_name) > 0', name='check_first_name_not_empty'),
        db.CheckConstraint('birth_date <= CURRENT_DATE', name='check_birth_date_not_future'),
    )

    def to_dict(self, include_category=True):
        data = {
            'id': self.id,
            'creator_id': self.creator_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'is_favorite': self.is_favorite,
            'category_id': self.category_id,
            'birth_date': self.birth_date.strftime('%d-%m-%Y') if self.birth_date else None,
            'last_contact_date': self.last_contact_date.strftime('%d-%m-%Y') if self.last_contact_date else None,
            'last_contact_place': self.last_contact_place,
            'street_and_nr': self.street_and_nr,
            'postal_code': self.postal_code,
            'city': self.city,
            'country': self.country,
            'notes': self.notes,
            'created_at': self.created_at.strftime('%d-%m-%Y %H:%M:%S') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%d-%m-%Y %H:%M:%S') if self.updated_at else None,
        }
    
        if include_category and hasattr(self, 'category') and self.category:
            data['category'] = {
                'id': self.category.id,
                'name': self.category.name
            }

        return data


    def __repr__(self):
        return f'<Contact {self.first_name} {self.last_name}>'