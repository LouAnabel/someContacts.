from app import db


class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
   
    
    # Relationship with user
    creator = db.relationship('User', backref='categories')
    
    # Unique constraint: user can't have duplicate category names
    __table_args__ = (db.UniqueConstraint('name', 'creator_id', name='unique_category_per_user'),)


    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'creator_id': self.creator_id,
            'contact_count': len(self.contacts) if hasattr(self, 'contacts') else 0
        }
    
    def __repr__(self):
        return f'<Category {self.name}>'