import os
from datetime import timedelta

class Config:
    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///contacts.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'secret_jwt_key')
    JWT_IDENTITY_CLAIM = 'sub'
    JWT_JSON_ENCODER = None
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # Flask configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'secret_flask_key')
    
    # CORS configuration
    CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']