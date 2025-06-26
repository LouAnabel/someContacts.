
from app import db
from datetime import datetime, timezone

class TokenBlockList(db.Model):
    __tablename__ = "token_blocklist"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    jti = db.Column(db.String(36), nullable=False, unique=True, index=True)
    token_type = db.Column(db.String(10), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    expires = db.Column(db.DateTime(timezone=True), nullable=False)
    is_active=db.Column(db.Boolean, default=True, nullable=False, index=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    revoked_at = db.Column(db.DateTime(timezone=True), nullable=True)
    

    user = db.relationship("User", backref='tokens')

    def __repr__(self):
        return f'<TokenBlockList {self.jti}: {self.token_type} for user {self.user_id}>'
    
    def revoke(self):
        """Mark token as revoked"""
        self.is_active = False
        self.revoked_at = datetime.now(timezone.utc)
    
    def is_expired(self):
        """Check if token is expired"""
        return datetime.now(timezone.utc) > self.expires
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            'id': self.id,
            'jti': self.jti,
            'token_type': self.token_type,
            'user_id': self.user_id,
            'expires': self.expires.isoformat(),
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'revoked_at': self.revoked_at.isoformat() if self.revoked_at else None
        }
    
    