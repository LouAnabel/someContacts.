from app.init import create_app, db
from dotenv import load_dotenv

# Make sure this line is present and comes first
load_dotenv()

app = create_app()

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)