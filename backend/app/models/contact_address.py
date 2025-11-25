from app import db

class ContactAddress(db.Model):
    __tablename__ = 'contact_addresses'

    id = db.Column(db.Integer, primary_key=True)

    #polymorphic columns
    owner_type = db.Column(db.String(50), nullable=False) # 'contact' or 'user'
    contact_id = db.Column(db.Integer, db.ForeignKey('contacts.id', ondelete='CASCADE'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True)

    street_and_nr = db.Column(db.String(200), nullable=False)
    additional_info = db.Column(db.String(200), nullable=True)
    postal_code = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(100), nullable=False)

    # Constraints
    __table_args__ = (
        db.Index('idx_contact_addresses', 'contact_id'),
        db.Index('idx_user_addresses', 'user_id'),
        db.Index('idx_address_owner', 'owner_type', 'contact_id', 'user_id'),
        db.CheckConstraint('length(street_and_nr) > 0', name='check_street_not_empty'),
        # Ensure exactly one owner is set
        db.CheckConstraint(
            '(owner_type = \'contact\' AND contact_id IS NOT NULL AND user_id IS NULL) OR '
            '(owner_type = \'user\' AND user_id IS NOT NULL AND contact_id IS NULL)',
            name='check_exactly_one_owner'
        ),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'contact_id': self.contact_id,
            'user_id': self.user_id,
            'owner_type': self.owner_type,
            'street_and_nr': self.street_and_nr,
            'additional_info': self.additional_info,
            'postal_code' : self.postal_code,
            'city': self.city,
            'country': self.country,
            'title': self.title
        }

    def __repr__(self):
        return f'<ContactAddress {self.title}: {self.street_and_nr}, {self.city}, {self.country}>'

