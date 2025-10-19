from app import db

class ContactPhone(db.Model):
    __tablename__ = 'contact_phones'

    id = db.Column(db.Integer, primary_key=True)

    owner_type = db.Column(db.String(50), nullable=False)
    contact_id = db.Column(db.Integer, db.ForeignKey('contacts.id', ondelete='CASCADE'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True)

    phone = db.Column(db.String(20), nullable=False)
    title = db.Column(db.String(100), nullable=False)

    # Constraints
    __table_args__ = (
        db.Index('idx_contact_phones', 'contact_id'),
        db.Index('idx_user_phones', 'user_id'),
        db.CheckConstraint(
            '(owner_type = \'contact\' AND contact_id IS NOT NULL AND user_id IS NULL) OR '
            '(owner_type = \'user\' AND user_id IS NOT NULL AND contact_id IS NULL)',
            name='check_phone_owner'
        ),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'contact_id': self.contact_id,
            'user_id': self.user_id,
            'owner_type': self.owner_type,
            'phone': self.phone,
            'title': self.title
        }

    def __repr__(self):
        return f'<ContactPhone {self.title}: {self.phone}>'

