from flask_jwt_extended import decode_token
from flask import current_app
from datetime import datetime, timezone
from app.models.token_block_list import TokenBlockList
from app import db
from sqlalchemy.exc import NoResultFound
import logging

logger = logging.getLogger(__name__)


# store the created pair of access and refresh token when user logs in
def store_token_pair(access_token, refresh_token, user_id):
    try:
        decoded_access = decode_token(access_token)
        decoded_refresh = decode_token(refresh_token)

        access_token_record = TokenBlockList(
            jti=decoded_access["jti"],
            token_type="access",
            user_id=int(user_id),
            expires=datetime.fromtimestamp(decoded_access["exp"], tz=timezone.utc),
            is_active=True, #Token is active when created
            created_at=datetime.now(timezone.utc)
        )

        refresh_token_record = TokenBlockList(
            jti=decoded_refresh["jti"],
            token_type="refresh",
            user_id=int(user_id),
            expires=datetime.fromtimestamp(decoded_refresh["exp"], tz=timezone.utc),
            is_active=True, #Token is active when created
            created_at=datetime.now(timezone.utc)
        )

        db.session.add(access_token_record)
        db.session.add(refresh_token_record)
        db.session.commit()

        logger.info(f"Stored token pair for user {user_id}")
        return True
    
    except Exception as e:
        logger.error(f"Failed to store token pair: {e}")
        db.session.rollback()
        return False
    
# Store a single token like refresh token
def store_single_token(encoded_token, user_id):

    try:
        decoded_token = decode_token(encoded_token)
        jti = decode_token["jti"]
        token_type = decoded_token["type"]
        expires = datetime.fromtimestamp(decoded_token["exp"], tz=timezone.utc)

        existing = TokenBlockList.query.filter_by(jti=jti).first()
        if existing:
            logger.warning(f"Token {jti} already exists in database")
            return True

        db_token = TokenBlockList(
            jti=jti,
            token_type=token_type,
            user_id=int(user_id),
            expires=expires,
            is_active=True,
            created_at=datetime.now(timezone.utc)
        )

        db.session.add(db_token)
        db.session.commit()
        logger.info(f"Stored {token_type} token {jti} for user {user_id}")
        return True
    
    except Exception as e:
        logger.error(f"Failed to store token: {e}")
        db.session.rollback()
        return False
    

# Revoke a specific token by JTI
def revoke_token(token_jti, user_id):
    try:
        token = TokenBlockList.query.filter_by(jti=token_jti, user_id=user_id).first()
        if token:
            token.is_active= False
            token.revoked_at = datetime.now(timezone.utc)
            db.session.commit()
            logger.info(f"Token {token_jti} revoked for user {user_id or 'any'}")
            return True
        else:
            logger.warning(f"Token {token_jti} not found for user {user_id or 'any'}")
            return False
        
    except Exception as e:
        logger.error(f"Error revoking token {token_jti}: {e}")
        db.session.rollback()
        return False


# Revoke the current token based on JWT payload.
def revoke_current_token(jwt_payload):
    try:
        jti = jwt_payload["jti"]
        identity_claim = current_app.config["JWT_IDENTITY_CLAIM"]
        user_id = jwt_payload[identity_claim]
        
        return revoke_token(jti, user_id)
        
    except Exception as e:
        logger.error(f"Error revoking current token: {e}")
        return False
    

# Check if token is revoked, Returns True if revoked, False if valid
def is_token_revoked(jwt_payload):
    """Note: JWT library already handles expiration, so we only check blacklist"""
    try:
        jti = jwt_payload["jti"]
        identity_claim = current_app.config["JWT_IDENTITY_CLAIM"]
        user_id = jwt_payload[identity_claim]
    
        token = TokenBlockList.query.filter_by(jti=jti, user_id=user_id).one()
        if not token:
            # token nit in database = unknown token = revoked
            return False
        
        
        # Check if the blacklist entry has expired (cleanup)
        if datetime.now(timezone.utc) > token.expires:
            try:
                db.session.delete(token)
                db.session.commit()
                logger.info(f"Cleaned up expired token {jti}")
                return True  # Expired token is effectively revoked
            
            except Exception as cleanup_error:
                logger.error(f"Failed to cleanup expired token: {cleanup_error}")
                return True
        return not token.is_active

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
            is_active=True
        ).all()
        
        revoked_count = 0
        current_time=datetime.now(timezone.utc)
        for token in active_tokens:
            token.is_active = False
            token.revoked_at = current_time
            revoked_count += 1
        
        db.session.commit()
        logger.info(f"Revoked {revoked_count} active tokens for user {user_id}")
        return revoked_count
        
    except Exception as e:
        logger.error(f"Error revoking all tokens for user {user_id}: {e}")
        db.session.rollback()
        return 0
    
    
""" ---- Add token to blacklist when user logs in
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
    """
    

# Get all active sessions (token pairs) for a user
def get_user_active_sessions(user_id):
    try:
        active_tokens = TokenBlockList.query.filter_by(
            user_id=user_id,
            is_active=True
        ).all()
        
        sessions = []
        for token in active_tokens:
            sessions.append({
                'jti': token.jti,
                'token_type': token.token_type,
                'created_at': token.created_at,
                'expires': token.expires
            })
        
        return sessions
        
    except Exception as e:
        logger.error(f"Error getting active sessions for user {user_id}: {e}")
        return []

# Remove expired tokens from blacklist
def cleanup_expired_tokens():
    try:
        current_time = datetime.now(timezone.utc)
        expired_tokens = TokenBlockList.query.filter(
            TokenBlockList.expires < current_time
        ).all()
        
        count = len(expired_tokens)
        for token in expired_tokens:
            db.session.delete(token)
        
        db.session.commit()
        logger.info(f"Cleaned up {count} expired tokens")
        return count
        
    except Exception as e:
        logger.error(f"Error cleaning up expired tokens: {e}")
        db.session.rollback()
        return 0