import os
from datetime import timedelta
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__)) # to find the .env file no matter from where
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    # Flask configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'secret_flask_key')

    # JWT configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'secret_jwt_key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1) #also possible 24h
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'someContacts.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Redis Configuration
    REDIS_URL = os.environ.get('REDIS_URL') or 'redis://localhost:6379/0' # if redis is necessary
    

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)  # Shorter for production
    
    
    
    # CORS configuration
    CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']