import redis
import logging


logger = logging.getLogger(__name__)

class RedisService:
    def __init__(self, app=None):
        self.redis_client = None
        if app is not None:
            self.init_app(app)
    
    # initialize Redis with Flask App
    def init_app(self, app):
        try:
            redis_url = app.config.get('REDIS_URL', 'redis://localhost:6379/0')
            self.redis_client = redis.from_url(
                redis_url,
                decode_responses=True,  # Automatically decode responses to strings
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True
            )
            
            # Test connection
            self.redis_client.ping()
            logger.info(f"Redis connected successfully to {redis_url}")
            
        except redis.ConnectionError as e:
            logger.error(f"Redis connection failed: {e}")
            logger.warning("Falling back to in-memory token storage")
            self.redis_client = None
        except Exception as e:
            logger.error(f"Unexpected Redis error: {e}")
            self.redis_client = None
    

    # check if Redis is available
    def is_available(self):
        if not self.redis_client:
            return False
        try:
            self.redis_client.ping()
            return True
        except (redis.ConnectionError, redis.TimeoutError):
            return False
    

    #Add token to blacklist with expiration
    def blacklist_token(self, jti, expires_in_seconds):
        if not self.is_available():
            logger.warning("Redis not available, token blacklisting disabled")
            return False
        
        try:
            key = f"blacklisted_token:{jti}"
            self.redis_client.setex(key, expires_in_seconds, "blacklisted")
            logger.info(f"Token {jti} blacklisted for {expires_in_seconds} seconds")
            return True
        except Exception as e:
            logger.error(f"Failed to blacklist token {jti}: {e}")
            return False
    
    # Check if token is blacklisted
    def is_token_blacklisted(self, jti):
        if not self.is_available():
            # If Redis is down, allow all tokens (fail open)
            logger.warning("Redis not available, allowing all tokens")
            return False
        
        try:
            key = f"blacklisted_token:{jti}"
            result = self.redis_client.get(key)
            is_blacklisted = result is not None
            
            if is_blacklisted:
                logger.info(f"Token {jti} is blacklisted")
            
            return is_blacklisted
        except Exception as e:
            logger.error(f"Failed to check token blacklist status for {jti}: {e}")
            # Fail open - allow token if we can't check
            return False
    
    #Manual cleanup of expired tokens (Redis handles this automatically)
    def cleanup_expired_tokens(self):
        # This is primarily for monitoring/logging purposes
        if not self.is_available():
            return
        
        try:
            # Count blacklisted tokens
            pattern = "blacklisted_token:*"
            keys = list(self.redis_client.scan_iter(match=pattern))
            logger.info(f"Currently tracking {len(keys)} blacklisted tokens")
        except Exception as e:
            logger.error(f"Failed to cleanup expired tokens: {e}")

# Global instance
redis_service = RedisService()