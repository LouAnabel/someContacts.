from app import db
from datetime import datetime, timezone

class ContactLinks(db.Model):
    __tablename__ = 'contact_links'

    id = db.Column(db.Integer, primary_key=True)
    contact_id = db.Column(db.Integer, db.ForeignKey('contacts.id', ondelete='CASCADE'), nullable=False)
    url = db.Column(db.String(500), nullable=False)
    title = db.Column(db.String(100), nullable=True)
    link_type = db.Column(db.String(50), nullable=True)

    #Timestamps
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc),
                           onupdate=lambda: datetime.now(timezone.utc))

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
            'link_type': self.link_type,
            'created_at': self.created_at.strftime('%d-%m-%Y %H:%M:%S') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%d-%m-%Y %H:%M:%S') if self.updated_at else None,
        }

    def __repr__(self):
        return f'<ContactLink {self.title}: {self.url}>'

