from app import db
from datetime import datetime, timezone

class Contact(db.Model):
    __tablename__ = 'contacts'  # Changed to plural for consistency

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Basic Contact Information
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100))  # Optional
    email = db.Column(db.String(255), index=True)  # Optional and removed unique constraint
    phone = db.Column(db.String(20))
    
    # Additional fields that your to_dict() method expects
    category = db.Column(db.String(50))  # Will upgrade to foreign key later
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

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'category': self.category,
            'birth_date': self.birth_date.strftime('%d-%m-%Y') if self.birth_date else None,
            'last_contact_date': self.last_contact_date.strftime('%d-%m-%Y') if self.last_contact_date else None,
            'last_contact_place': self.last_contact_place,
            'street_and_nr': self.street_and_nr,
            'postal_code': self.postal_code,
            'city': self.city,
            'country': self.country,
            'notes': self.notes,
            'created_at': self.created_at.strftime('%d-%m-%Y %H:%M:%S'),
            'updated_at': self.updated_at.strftime('%d-%m-%Y %H:%M:%S')
        }
    
    def __repr__(self):
        return f'<Contact {self.first_name} {self.last_name}>'