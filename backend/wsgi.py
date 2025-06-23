import os
from app import create_app, db
from app.models.user import User
from app.models.contact import Contact
from app.models.category import Category

# Set environment for production
os.environ.setdefault('FLASK_ENV', 'production')

app = create_app()

# Initialize database on startup
with app.app_context():
    try:
        db.create_all()
        print("Database tables created successfully")
        
        # Optional: Create default data
        user_count = User.query.count()
        print(f"Current users in database: {user_count}")
        
    except Exception as e:
        print(f"Database initialization failed: {e}")
        # Don't raise - let the app start anyway
        pass

if __name__ == "__main__":
    app.run()