import os
from app import create_app, db
from app.models.user import User
from app.models.contact import Contact
from app.models.category import Category

# Set environment for production
os.environ.setdefault('FLASK_ENV', 'production')

# Create the Flask app
app = create_app()

# Initialize database on startup
with app.app_context():
    try:
        # Ensure database directory exists
        db_path = app.config.get('DATABASE_PATH')
        if db_path:
            db_dir = os.path.dirname(db_path)
            if db_dir and not os.path.exists(db_dir):
                os.makedirs(db_dir, exist_ok=True)
                print(f"Created database directory: {db_dir}")
        
        # Create tables
        db.create_all()
        print("Database initialized successfully")
        
        #optional
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        print(f"Tables in database: {', '.join(tables)}")
        
        # Optional: Create default data
        user_count = User.query.count()
        print(f"Current users in database: {user_count}")
        
        
    except Exception as e:
        print(f"Database initialization failed: {e}")
        # Don't raise - let the app start anyway
        pass


# This is what gunicorn will use
if __name__ == "__main__":
    # This won't run in production, but good for testing
    app.run(debug=False)