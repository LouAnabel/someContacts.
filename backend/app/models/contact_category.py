from app import db



class ContactCategory(db.Model):
    __tablename__ = 'contact_categories'

    id = db.Column(db.Integer, primary_key=True)
    contact_id = db.Column(db.Integer, db.ForeignKey('contacts.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)

    # Relationship
    contact = db.relationship('Contact', back_populates='contact_categories')
    category = db.relationship('Category', back_populates='contact_categories')

    # Unique constraint: contact can't have duplicate category id
    __table_args__ = (
        db.UniqueConstraint('contact_id', 'category_id', name='unique_category_per_contact'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'contact_id': self.contact_id,
            'category_id': self.category_id,
            'contact': self.contact.to_dict(include_categories=False, include_links=False) if self.contact else None,
            'category': self.category.to_dict() if self.category else None
        }

    def __repr__(self):
        return f'<ContactCategory {self.id}: Contact {self.contact_id} -> Category {self.category_id}>'
