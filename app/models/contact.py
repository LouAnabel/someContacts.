from app.init import db, bcrypt
from datetime import datetime, timezone

class Contact(db.Model):
    __tablename__ = 'contact'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Coloumn(db.Integer, db.ForeignKey('users.id'), nullable=False)

    #Basic Contact Information after Registration
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    phone = db.Column(db.String(20))
    
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
            'category': self.category, # (foreign key to categories table)
            'birth_date': self.birth_date,
            'last_contact_date': self.last_contact_date,
            'last_contact_place': self.last_contact_place,
            'address': self.address,
            'city': self.city,
            'country': self.country,
            'notes': self.notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    

    def __repr__(self):
        return f'<Contact {self.first_name} {self.last_name}>'