from app import db

class UserPhone(db.Model):
    __tablename__ = 'user_phones'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    title = db.Column(db.String(100), nullable=False)

    # Constraints
    __table_args__ = (
        # Index for efficient queries
        db.Index('idx_user_phones', 'user_id'),
        # Ensure phone is not empty
        db.CheckConstraint('length(phone) > 0', name='check_phone_not_empty')
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'phone': self.phone,
            'title': self.title,
        }

    def __repr__(self):
        return f'<UserPhone {self.title}: {self.phone}>'

