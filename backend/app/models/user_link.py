from app import db

class UserLink(db.Model):
    __tablename__ = 'user_links'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    url = db.Column(db.String(500), nullable=False)
    title = db.Column(db.String(100), nullable=True)

    # Constraints
    __table_args__ = (
        # Index for efficient queries
        db.Index('idx_user_links', 'user_id'),
        # Ensure URL is not empty
        db.CheckConstraint('length(url) > 0', name='check_url_not_empty'),
        db.CheckConstraint("url LIKE 'http%'", name='check_url_format'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'url': self.url,
            'title': self.title,
        }

    def __repr__(self):
        return f'<UserLink {self.title}: {self.url}>'

