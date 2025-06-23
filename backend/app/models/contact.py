from app import db
from datetime import datetime, timezone



class Contact(db.Model):
    __tablename__ = 'contacts'  # Changed to plural for consistency

    id = db.Column(db.Integer, primary_key=True)
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    # Basic Contact Information
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100))  # Optional
    email = db.Column(db.String(255), index=True)  # Optional and removed unique constraint
    phone = db.Column(db.String(20))
    is_favorite = db.Column(db.Boolean, default=False, nullable=False)
    
    # Additional fields that your to_dict() method expects
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=True)
    birth_date = db.Column(db.Date)
    last_contact_date = db.Column(db.Date)
    last_contact_place = db.Column(db.String(200))
    street_and_nr = db.Column(db.Text)
    postal_code = db.Column(db.Text)
    city = db.Column(db.String(100))
    country = db.Column(db.String(100))
    notes = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    category = db.relationship('Category', backref='contacts')

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
    
        if include_category and self.category:
            data['category'] = {
                'id': self.category.id,
                'name': self.category.name
            }

        return data


    def __repr__(self):
        return f'<Contact {self.first_name} {self.last_name}>'