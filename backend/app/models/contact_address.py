from app import db

class ContactAddress(db.Model):
    __tablename__ = 'contact_addresses'

    id = db.Column(db.Integer, primary_key=True)
    contact_id = db.Column(db.Integer, db.ForeignKey('contacts.id', ondelete='CASCADE'), nullable=False)
    street_and_nr = db.Column(db.String(200), nullable=False)
    additional_info = db.Column(db.String(200), nullable=True)
    postal_code = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    country = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(100), nullable=False)

    # Constraints
    __table_args__ = (
        # Index for efficient queries
        db.Index('idx_contact_addresses', 'contact_id'),
        # Ensure URL is not empty
        db.CheckConstraint('length(street_and_nr) > 0', name='check_street_not_empty'),
        #db.CheckConstraint("url LIKE 'http%'", name='check_url_format'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'contact_id': self.contact_id,
            'street_and_nr': self.street_and_nr,
            'additional_info': self.additional_info,
            'postal_code' : self.postal_code,
            'city': self.city,
            'country': self.country,
            'title': self.title
        }

    def __repr__(self):
        return f'<ContactAddress {self.title}: {self.street_and_nr}, {self.city}, {self.country}>'

