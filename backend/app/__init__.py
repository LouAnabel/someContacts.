from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from config import DevelopmentConfig
from datetime import datetime, timezone
import logging
import os


#create global instances of
db = SQLAlchemy() #database operations
migrate = Migrate() #database documentation
jwt = JWTManager() #JSON Web Token authentication
bcrypt = Bcrypt() #password hashing
logger = logging.getLogger(__name__) 

# initializes the APP
def create_app():
    app = Flask(__name__)
    
    # Load appropriate config based on environment
    env = os.getenv('FLASK_ENV', 'development')
    if env == 'production':
        app.config.from_object('config.ProductionConfig')
        print("*****\nLoading Production Configuration")
    else:
        app.config.from_object('config.DevelopmentConfig')
        print("****\nLoading Development Configuration")
    

    # Debug: Print database info (don't log full URL for security)
    db_url = app.config.get('SQLALCHEMY_DATABASE_URI', '')
    if 'postgresql' in db_url:
        print("Using PostgreSQL database")
    elif 'sqlite' in db_url:
        print("Using SQLite database")

    # For SQLite: Ensure database directory exists
    db_path = db_url.replace('sqlite:///', '')
    db_dir = os.path.dirname(db_path)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)
        print(f"Created database directory: {db_dir}")


    # Enable CORS for all routes
    CORS(app, 
         origins=['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization'],
         supports_credentials=True)
    

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db) #connects changes to database
    jwt.init_app(app)
    bcrypt.init_app(app)

    # This function is called AUTOMATICALLY on every @jwt_required() request.
    # It checks if the token is in the blocklist and if it's still active.
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload['jti']
        
        try:
            from app.models.token_block_list import TokenBlockList
            
            # Look up token in database
            token = TokenBlockList.query.filter_by(jti=jti).first()
            
            if not token:
                # Token not found = unknown token = block it
                logger.warning(f"Unknown token: {jti}")
                return True  # Block
            
            # Simple check: is the token revoked?
            is_revoked = not token.is_active
            
            if is_revoked:
                logger.info(f"Revoked token blocked: {jti}")
            else:
                logger.debug(f"Active token allowed: {jti}")
            
            return is_revoked  # True = block, False = allow
            
        except Exception as e:
            logger.error(f"Token check error: {e}")
            return True  # Block if we can't check


    # JWT Configuration
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        print(f"Token expired: {jwt_payload.get('jti', 'unknown')}")  # Debug
        return {'error': 'Token has expired'}, 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        print(f"Invalid token: {error}")  # Debug
        return {'error': 'Invalid token', 'details': str(error)}, 401

    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        print(f"Unauthorized: {error}")  # Debug
        return {'error': 'Authorization token required'}, 401
    

    # Import models (important for migrations)
    from app.models import user, contact, category
    from app.models.token_block_list import TokenBlockList

    # Register blueprints - Import INSIDE the function to avoid circular imports
    from app.routes.auth import auth_bp
    from app.routes.contacts import contacts_bp
    from app.routes.categories import categories_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(contacts_bp, url_prefix='/contacts')
    app.register_blueprint(categories_bp, url_prefix='/categories')

    # Home page
    @app.route('/', methods=['GET', 'HEAD'])
    def home():
        return {
            'message': 'Welcome to someContacts API!',
            'version': '1.0',
            'status': 'running'
        }
    

    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        try:
            # Test database connection
            db.session.execute(db.text('SELECT 1'))
            db_status = 'connected'
        except Exception as e:
            print(f"Database health check failed: {e}")
            db_status = 'disconnected'
        
        return {
            'status': 'healthy',
            'database': db_status,
            'environment': env,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }


    # Error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return {'error': 'Bad request', 'message': 'The request was malformed'}, 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return {'error': 'Unauthorized', 'message': 'Authentication required'}, 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return {'error': 'Forbidden', 'message': 'Access denied'}, 403
    
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found', 'message': 'The requested resource was not found'}, 404

    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Internal server error', 'message': 'Something went wrong on our end'}, 500

    return app