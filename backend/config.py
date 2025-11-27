import os
from datetime import timedelta
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__)) # to find the .env file no matter from where
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    # Flask configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'my_super_secret_flask_key')

    # JWT configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'my_super_secret_jwt_key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)  # Longer for development convenience
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(hours=24)

    instance_dir = os.path.join(basedir, 'instance')
    if not os.path.exists(instance_dir):
        os.makedirs(instance_dir, exist_ok=True)

    DATABASE_URL = os.getenv('DATABASE_URL', os.path.join(instance_dir, 'someContacts.db'))
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{DATABASE_URL}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # SQLite optimizations
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'connect_args': {
            'check_same_thread': False,  # Allow SQLite to work with multiple threads
            'timeout': 20
        }
    }


class TestingConfig(Config):
    TESTING = True
    DEBUG = True
    
    # Use in-memory SQLite for testing
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    
    # Very short tokens for testing
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(hours=24)


class DevelopmentConfig(Config):
    DEBUG = True

    # Development-specific settings
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)  # Longer for development convenience
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(hours=2)

    instance_dir = os.path.join(basedir, 'instance')
    if not os.path.exists(instance_dir):
        os.makedirs(instance_dir, exist_ok=True)

    # Development SQLite path
    DATABASE_URL = os.path.join(instance_dir, 'someContacts_dev.db')
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{DATABASE_URL}'


class ProductionConfig(Config):
    DEBUG = False
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=2)  # Shorter for security reasons
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=1)

    # For local production: use instance/ folder
    # For Render: set DATABASE_PATH to persistent disk location
    instance_dir = os.path.join(basedir, 'instance')
    default_db_path = os.path.join(instance_dir, 'someContacts.db')
    
    # For Render deployment with persistent disk
    DATABASE_PATH = os.getenv('DATABASE_PATH', default_db_path)
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{DATABASE_PATH}'
    
    # Ensure directory exists for local production
    if not DATABASE_PATH.startswith('/opt/render'):  # Not on Render
        db_dir = os.path.dirname(DATABASE_PATH)
        if not os.path.exists(db_dir):
            os.makedirs(db_dir, exist_ok=True)

        
    # Production-specific optimizations
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'connect_args': {
            'check_same_thread': False,
            'timeout': 30  # Longer timeout for production
        }
    }
    
    # CORS configuration for production
    CORS_ORIGINS = [
        'http://localhost:3000', 
        'http://127.0.0.1:3000',
        # 'https://your-frontend-domain.com',  # Add your actual frontend domain
        # 'https://your-frontend.vercel.app'   # Add your actual frontend domain
    ]
    
# Necessary?
# CORS configuration
# CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']



    """If working with Postgres
    DATABASE_URL = os.getenv('DATABASE_URL')
    # Fix for newer SQLAlchemy versions (Render uses older postgres:// format)
    if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    
    # PostgreSQL optimizations
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,        # Verify connections before use
        'pool_recycle': 300,          # Recycle connections every 5 minutes
        'pool_timeout': 20,           # Timeout for getting connection from pool
        'max_overflow': 0             # Don't create extra connections beyond pool_size
    }
    """ 