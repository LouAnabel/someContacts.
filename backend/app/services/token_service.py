from flask_jwt_extended import decode_token
from flask import current_app
from datetime import datetime, timezone
from app.models.token_block_list import TokenBlockList
from app import db
from sqlalchemy.exc import NoResultFound
import logging

logger = logging.getLogger(__name__)


# Add token to blacklist when user logs out
def add_token_to_blacklist(encoded_token):
    try:
        decoded_token = decode_token(encoded_token)
        jti = decoded_token["jti"]
        token_type = decoded_token["type"]
        identity_claim = current_app.config["JWT_IDENTITY_CLAIM"]

        user_id = decoded_token.get(identity_claim)
        expires = datetime.fromtimestamp(decoded_token["exp"], tz=timezone.utc)

        # Check if already blacklisted
        existing = TokenBlockList.query.filter_by(jti=jti).first()
        if existing:
            # Already blacklisted, just update revoked_at if needed
            if existing.revoked_at is None:
                existing.revoked_at = datetime.now(timezone.utc)
                db.session.commit()
                logger.info(f"Updated revoked_at for token {jti}")
            return True

        # Add new entry to blacklist
        db_token = TokenBlockList(
            jti=jti,
            token_type=token_type,
            user_id=int(user_id),
            expires=expires,
            revoked_at=datetime.now(timezone.utc) # Mark as revoked immediatly
        )
        db.session.add(db_token)
        db.session.commit()
        logger.info(f"Token {jti} blacklisted for user {user_id}")
        return True

    except Exception as e:
        logger.error(f"Failed to blacklist token: {e}")
        db.session.rollback()
        return False
    

# Revoke a specific token by JTI
def revoke_token(token_jti, user_id):
    try:
        token = TokenBlockList.query.filter_by(jti=token_jti, user_id=user_id).first()
        if token:
            token.revoked_at = datetime.now(timezone.utc)
            db.session.commit()
            logger.info(f"Token {token_jti} revoked for user {user_id}")
            return True
        else:
            logger.warning(f"Token {token_jti} not found for user {user_id}")
            return False
        
    except Exception as e:
        logger.error(f"Error revoking token {token_jti}: {e}")
        db.session.rollback()
        return False

# Check if token is revoked, Returns True if revoked, False if valid
def is_token_revoked(jwt_payload):
    """Note: JWT library already handles expiration, so we only check blacklist"""
    try:
        jti = jwt_payload["jti"]
        user_id = jwt_payload[current_app.config["JWT_IDENTITY_CLAIM"]]
    
        token = TokenBlockList.query.filter_by(jti=jti, user_id=user_id).one()
        if not token:
            # Token not blacklisted = valid
            return False
        
        # Token is in blacklist - check if actually revoked
        if token.revoked_at is not None:
            # Check if the blacklist entry has expired (cleanup)
            if datetime.now(timezone.utc) > token.expires:
                try:
                    db.session.delete(token)
                    db.session.commit()
                    return False
                except Exception as cleanup_error:
                    logger.error(f"Failed to cleanup expired token: {cleanup_error}")
                    pass
            return True # Token is revoked and not expired
        return False # Token in database but not revoked
    

    except Exception as e:
        logger.error(f"Error checking token revocation: {e}")
        # Fail safe: if we can't check, assume token is valid (don't block users)
        return False
    
# Revoke all active tokens for a user (when logout all devices)
def revoke_all_user_tokens(user_id):
    try:
        # Find all non-revoked tokens for this user
        active_tokens = TokenBlockList.query.filter_by(
            user_id=user_id, 
            revoked_at=None
        ).all()
        
        revoked_count = 0
        for token in active_tokens:
            token.revoked_at = datetime.now(timezone.utc)
            revoked_count += 1
        
        db.session.commit()
        logger.info(f"Revoked {revoked_count} active tokens for user {user_id}")
        return revoked_count
        
    except Exception as e:
        logger.error(f"Error revoking all tokens for user {user_id}: {e}")
        db.session.rollback()
        return 0


def cleanup_expired_tokens():
    """Remove expired tokens from blacklist"""
    try:
        current_time = datetime.now(timezone.utc)
        expired_tokens = TokenBlockList.query.filter(
            TokenBlockList.expires < current_time
        ).all()
        
        count = len(expired_tokens)
        for token in expired_tokens:
            db.session.delete(token)
        
        db.session.commit()
        logger.info(f"Cleaned up {count} expired tokens from blacklist")
        return count
        
    except Exception as e:
        logger.error(f"Error cleaning up expired tokens: {e}")
        db.session.rollback()
        return 0