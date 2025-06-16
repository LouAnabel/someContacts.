from app.init import create_app, db
from app.models.user import User  # Import User Model
from app.models.contact import Contact  # Import contact model
from dotenv import load_dotenv
import os

# Load environment variables first
load_dotenv()

# Create the Flask app
app = create_app()

# Create database tables
with app.app_context():
    db.create_all()
    print("Database tables created successfully!")

if __name__ == '__main__':
    # Get debug mode from environment variable, default to True for development
    debug_mode = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    # Get port from environment variable, default to 5000
    port = int(os.getenv('FLASK_PORT', 5000))
    
    # Get host from environment variable, default to localhost
    host = os.getenv('FLASK_HOST', '127.0.0.1')
    
    print(f"Starting Flask app on {host}:{port} (Debug: {debug_mode})")
    app.run(host=host, port=port, debug=debug_mode)