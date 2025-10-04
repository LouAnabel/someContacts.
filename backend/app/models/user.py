from app import db, bcrypt
from datetime import datetime, timezone

class User(db.Model):
    __tablename__ = 'users'

    # registration data
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(120), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # user profile data
    
    # categories relationship is defined in Category model via backref
    # Relationship with contacts
    contacts = db.relationship(
            'Contact', 
            backref='creator',  # Changed from 'user' to 'creator'
            lazy=True, 
            cascade='all, delete-orphan',
            foreign_keys='Contact.creator_id'  # Explicitly specify the foreign key
        )
    


    # Hash and set the user's password
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    #Check if the provided password matches the hashed password
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<User {self.first_name} {self.last_name}>'