from app import db
from datetime import datetime, timezone

class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Relationship with user
    creator = db.relationship('User', backref='categories')
    contacts = db.relationship('Contact', backref='category', lazy='dynamic')

    # Unique constraint: user can't have duplicate category names
    __table_args__ = (db.UniqueConstraint('name', 'creator_id', name='unique_category_per_creator'),)


    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'creator_id': self.creator_id,
            'contact_count': self.contacts.count()
        }
    
    def __repr__(self):
        return f'<Category {self.name}>'