from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from config import DevelopmentConfig
# from app.services.redis_service import redis_service
from datetime import datetime, timezone
import os


#create global instances of
db = SQLAlchemy() #database operations
migrate = Migrate() #database documentation
jwt = JWTManager() #JSON Web Token authentication
bcrypt = Bcrypt() #password hashing


# initicatializes the APP
def create_app():
    app = Flask(__name__)
    
    # Load appropriate config based on environment
    env = os.getenv('FLASK_ENV', 'development')
    if env == 'production':
        app.config.from_object('config.ProductionConfig')
        print("Loading Production Configuration")
    else:
        app.config.from_object('config.DevelopmentConfig')
        print("Loading Development Configuration")
    

    # Debug: Print database info (don't log full URL for security)
    db_url = app.config.get('SQLALCHEMY_DATABASE_URI', '')
    if 'postgresql' in db_url:
        print("Using PostgreSQL database")
    elif 'sqlite' in db_url:
        print("Using SQLite database")


    # Enable CORS for all routes
    CORS(app, 
         origins=['http://localhost:3000', 'http://localhost:5173'], # http://127.0.0.1:3000
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization'],
         supports_credentials=True)
    

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db) #connects changes to database
    jwt.init_app(app)
    bcrypt.init_app(app)
    redis_service.init_app(app)  # Initialize Redis service


    # JWT Configuration
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        print(f"Token expired: {jwt_payload}")  # Debug
        return {'error': 'Token has expired'}, 401
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {'error': 'Token has expired'}, 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        print(f"Invalid token: {error}")  # Debug
        return {'error': 'Invalid token', 'details': str(error)}, 401
    

    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        print(f"Unauthorized: {error}")  # Debug
        return {'error': 'Authorization token required'}, 401
    
    """
    # TEMPORARILY COMMENT OUT - Redis token blacklisting 
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload['jti']
        is_blacklisted = redis_service.is_token_blacklisted(jti)
        if is_blacklisted:
            print(f"Token blacklisted: {jti}")  # Debug
        return is_blacklisted
    """


    # Import models (important for migrations)
    from app.models import user, contact, category

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
        return "Welcome to someContacts.!"
    

    # Useful for monitoring:
    @app.route('/health', methods=['GET'])
    def health_check():
        return {
            'status': 'healthy',
            'redis_available': False, #redis_service.is_available(),
            'timestamp': datetime.now(timezone.utc).isoformat()
    }

    # Error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return {'error': 'Bad request'}, 400
    
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found'}, 404
    
    @app.errorhandler(403)
    def forbidden(error):
        return {'error': 'Forbidden'}, 403

    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Internal server error'}, 500

    return app