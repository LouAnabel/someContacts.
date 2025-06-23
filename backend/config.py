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
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1) #also possible 24h
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # Database configuration - PostgreSQL
    DATABASE_URL = os.getenv('DATABASE_URL')

    # Fix for newer SQLAlchemy versions (Render uses older postgres:// format)
    if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    
    SQLALCHEMY_DATABASE_URI = DATABASE_URL or \
        'sqlite:///' + os.path.join(basedir, 'someContacts.db')  # Fallback for local dev
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Redis Configuration
    REDIS_URL = os.environ.get('REDIS_URL') or 'redis://localhost:6379/0' # if redis is necessary
    
    # PostgreSQL optimizations
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,        # Verify connections before use
        'pool_recycle': 300,          # Recycle connections every 5 minutes
        'pool_timeout': 20,           # Timeout for getting connection from pool
        'max_overflow': 0             # Don't create extra connections beyond pool_size
    }

    # Redis Configuration
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')


class DevelopmentConfig(Config):
    DEBUG = True
    # Use SQLite for local development
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'someContacts.db')


class ProductionConfig(Config):
    DEBUG = False
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)  # Shorter for production
    
    # Additional production settings
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'pool_timeout': 20,
        'max_overflow': 0,
        'pool_size': 5                # Limit connection pool size
    }
    

    
    # CORS configuration
    CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']