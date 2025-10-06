from app import db

class UserEmail(db.Model):
    __tablename__ = 'user_emails'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    email = db.Column(db.String(500), nullable=False)
    title = db.Column(db.String(100), nullable=False)

    # Constraints
    __table_args__ = (
        # Index for efficient queries
        db.Index('idx_user_emails', 'user_id'),
        # Ensure URL is not empty
        db.CheckConstraint('length(email) > 0', name='check_email_not_empty'),
        db.CheckConstraint("url LIKE 'http%'", name='check_email_format'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'email': self.email,
            'title': self.title,
        }

    def __repr__(self):
        return f'<UserEmail {self.title}: {self.email}>'

