from app import db, bcrypt
from typing import Dict, Any, List
from datetime import datetime, timezone

class User(db.Model):
    __tablename__ = 'users'

    # register infos
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(120), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # user card infos
    # Additional fields that your to_dict() method expects
    birth_date = db.Column(db.Date, nullable=True)


    # Relationships - filtering by owner_type
    emails = db.relationship(
        'ContactEmail',
        primaryjoin='and_(foreign(ContactEmail.user_id)==User.id, ContactEmail.owner_type=="user")',
        lazy='dynamic',
        cascade='all, delete-orphan',
        viewonly=False
    )
    phones = db.relationship(
        'ContactPhone',
        primaryjoin='and_(foreign(ContactPhone.user_id)==User.id, ContactPhone.owner_type=="user")',
        lazy='dynamic',
        cascade='all, delete-orphan',
        viewonly=False
    )
    addresses = db.relationship(
        'ContactAddress',
        primaryjoin='and_(foreign(ContactAddress.user_id)==User.id, ContactAddress.owner_type=="user")',
        lazy='dynamic',
        cascade='all, delete-orphan',
        viewonly=False
    )
    links = db.relationship(
        'ContactLink',
        primaryjoin='and_(foreign(ContactLink.user_id)==User.id, ContactLink.owner_type=="user")',
        lazy='dynamic',
        cascade='all, delete-orphan',
        viewonly=False
    )

    # categories relationship is defined in Category model via backref
    # Relationship with contacts
    contacts = db.relationship(
            'Contact', 
            backref='creator',  # Changed from 'user' to 'creator'
            lazy=True, 
            cascade='all, delete-orphan',
            foreign_keys='Contact.creator_id'  # Explicitly specify the foreign key
        )

    # Constraints for data integrity
    __table_args__ = (
        db.CheckConstraint('length(first_name) > 0', name='check_user_first_name_not_empty'),
        db.CheckConstraint('birth_date <= CURRENT_DATE', name='check_user_birth_date_not_future'),
    )


    # Hash and set the user's password
    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    #Check if the provided password matches the hashed password
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self, include_phones=True, include_emails=True, include_addresses=True):
        data = {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'birth_date': self.birth_date.strftime('%d.%m.%Y') if self.birth_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

        if include_phones:
            data['phones'] = [phone.to_dict() for phone in self.phones.all()]
        if include_emails:
            data['emails'] = [email.to_dict() for email in self.emails.all()]
        if include_addresses:
            data['addresses'] = [address.to_dict() for address in self.addresses.all()]

        data['links'] = [link.to_dict() for link in self.links.all()]

        return data


    def __repr__(self):
        return f'<User {self.first_name} {self.last_name}>'