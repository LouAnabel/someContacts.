from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from app.services.redis_service import redis_service


#create global instances of
db = SQLAlchemy() #database operations
migrate = Migrate() #database documentation
jwt = JWTManager() #JSON Web Token authentication
bcrypt = Bcrypt() #password hashing


# initicatializes the APP
def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')

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
        return {'success': False, 'message': 'Token has expired'}, 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {'success': False, 'message': 'Invalid token'}, 401
    
    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        return {'success': False, 'message': 'Authorization token required'}, 401
    
    # Token blacklist checker using Redis
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload['jti']
        return redis_service.is_token_blacklisted(jti)
    


    # Import models (important for migrations)
    from app.models import user, contact

    # Register blueprints - Import INSIDE the function to avoid circular imports
    from app.routes.auth import auth_bp
    from app.routes.contacts import contacts_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(contacts_bp, url_prefix='/contacts')


    # Home page
    @app.route('/', methods=['GET', 'HEAD'])
    def home():
        return "Welcome to someContacts.!"
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found'}, 404
    
    @app.errorhandler(403)
    def forbidden(error):
        return {'error': 'Forbidden'}, 403

    return app