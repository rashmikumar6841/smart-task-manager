import os
from app import create_app, db

def reset_database():
    """Drops all tables and recreates them with the new schema."""
    config_name = os.environ.get("FLASK_ENV", "development")
    app = create_app(config_name)
    
    with app.app_context():
        print("Dropping all tables...")
        db.drop_all()
        print("Recreating all tables with new schema...")
        db.create_all()
        print("Database reset successfully! You can now run the app.")

if __name__ == "__main__":
    reset_database()
