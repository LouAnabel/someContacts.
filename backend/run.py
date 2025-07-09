from app import create_app, db
from flask_cors import CORS
from app.models.user import User  # Import User Model
from app.models.contact import Contact  # Import contact model
from app.models.category import Category
from sqlalchemy import text
from dotenv import load_dotenv
import os

# Load environment variables first
load_dotenv()

# Set development environment
os.environ.setdefault('FLASK_ENV', 'development')

# Create the Flask app
app = create_app()
CORS(app)

# Initialize database for development
# Create database tables
with app.app_context():
    try:
        # Test database connection
        db.session.execute(text('SELECT 1'))

        #create all tables
        db.create_all()
        print("Database connected and Database tables successcully created!")
        

        # Optional: Print table info
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        print(f"Tables in database: {', '.join(tables)}")
        
    except Exception as e:
        print(f"Failed to create database tables: {e}")
        exit(1)


if __name__ == '__main__':
    #development settings
    # Get debug mode from environment variable, default to True for development
    debug_mode = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    # Get port from environment variable, default to 5000
    port = int(os.getenv('FLASK_PORT', 5000))
    
    # Get host from environment variable, default to localhost
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    
    print(f"Starting Flask app on {host}:{port} (Debug: {debug_mode})")
    app.run(host=host, port=port, debug=debug_mode)