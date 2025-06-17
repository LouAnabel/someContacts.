from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS

#create global instances of
db = SQLAlchemy() #database operations
jwt = JWTManager() #JSON Web Token authentication
bcrypt = Bcrypt() #password hashing

# implements the "application factory" pattern.
def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000'])

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