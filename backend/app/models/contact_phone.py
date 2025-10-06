from app import db

class ContactPhone(db.Model):
    __tablename__ = 'contact_phones'

    id = db.Column(db.Integer, primary_key=True)
    contact_id = db.Column(db.Integer, db.ForeignKey('contacts.id', ondelete='CASCADE'), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    title = db.Column(db.String(100), nullable=False)

    # Constraints
    __table_args__ = (
        # Index for efficient queries
        db.Index('idx_contact_phones', 'contact_id'),
        # Ensure URL is not empty
        db.CheckConstraint('length(phone) > 0', name='check_phone_not_empty')
    )

    def to_dict(self):
        return {
            'id': self.id,
            'contact_id': self.contact_id,
            'phone': self.phone,
            'title': self.title,
        }

    def __repr__(self):
        return f'<ContactPhone {self.title}: {self.phone}>'

