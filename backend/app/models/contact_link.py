from app import db

class ContactLink(db.Model):
    __tablename__ = 'contact_links'

    id = db.Column(db.Integer, primary_key=True)
    contact_id = db.Column(db.Integer, db.ForeignKey('contacts.id', ondelete='CASCADE'), nullable=False)
    url = db.Column(db.String(500), nullable=False)
    title = db.Column(db.String(100), nullable=True)

    # Constraints
    __table_args__ = (
        # Index for efficient queries
        db.Index('idx_contact_links', 'contact_id'),
        # Ensure URL is not empty
        db.CheckConstraint('length(url) > 0', name='check_url_not_empty'),
        db.CheckConstraint("url LIKE 'http%'", name='check_url_format'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'contact_id': self.contact_id,
            'url': self.url,
            'title': self.title,
        }

    def __repr__(self):
        return f'<ContactLink {self.title}: {self.url}>'

