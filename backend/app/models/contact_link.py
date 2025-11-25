from app import db

class ContactLink(db.Model):
    __tablename__ = 'contact_links'

    id = db.Column(db.Integer, primary_key=True)

    owner_type = db.Column(db.String(50), nullable=False)
    contact_id = db.Column(db.Integer, db.ForeignKey('contacts.id', ondelete='CASCADE'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True)

    url = db.Column(db.String(500), nullable=False)
    title = db.Column(db.String(100), nullable=True)

    # Constraints
    __table_args__ = (
        db.Index('idx_contact_links', 'contact_id'),
        db.Index('idx_user_links', 'user_id'),
        db.CheckConstraint('length(url) > 0', name='check_url_not_empty'),
        db.CheckConstraint("url LIKE 'http%'", name='check_url_format'),
        db.CheckConstraint(
            '(owner_type = \'contact\' AND contact_id IS NOT NULL AND user_id IS NULL) OR '
            '(owner_type = \'user\' AND user_id IS NOT NULL AND contact_id IS NULL)',
            name='check_link_owner'
        ),
    )


    def to_dict(self):
        return {
            'id': self.id,
            'contact_id': self.contact_id,
            'user_id': self.user_id,
            'owner_type': self.owner_type,
            'url': self.url,
            'title': self.title,
        }

    def __repr__(self):
        return f'<ContactLink {self.title}: {self.url}>'

