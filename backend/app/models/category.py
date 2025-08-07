from app import db

class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Relationship with user
    creator = db.relationship('User', backref='categories')

    # Many-to-many relationship with contacts through ContactCategory
    contact_categories = db.relationship('ContactCategory', back_populates='category', cascade='all, delete-orphan')
    contacts = db.relationship('Contact', secondary='contact_categories', back_populates='categories', viewonly=True)

    # Unique constraint: user can't have duplicate category names
    __table_args__ = (db.UniqueConstraint('name', 'creator_id', name='unique_category_per_creator'),)

    def to_dict(self, include_contacts=False):
        data = {
            'id': self.id,
            'name': self.name,
            'creator_id': self.creator_id,
            'contact_count': len(self.contacts)
        }

        if include_contacts:
            data['contacts'] = [contact.to_dict(include_categories=False) for contact in self.contacts]

        return data

    def __repr__(self):
        return f'<Category {self.name}>'