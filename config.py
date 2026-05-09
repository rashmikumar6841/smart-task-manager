"""
config.py - Application configuration module
Loads settings from environment variables using python-dotenv
"""

import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()


class Config:
    """Base configuration class."""

    # Flask secret key for session encryption
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")

    # PostgreSQL Database URI
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "postgresql://postgres:password@localhost:5432/smart_task_manager"
    )

    # Disable SQLAlchemy modification tracking (saves memory)
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Flask-SocketIO async mode
    SOCKETIO_ASYNC_MODE = os.environ.get("SOCKETIO_ASYNC_MODE", "threading")

    # JWT Secret Key (for bonus JWT auth)
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt-secret-key-change-in-production")

    # Pagination
    TASKS_PER_PAGE = int(os.environ.get("TASKS_PER_PAGE", 10))

    # Debug mode
    DEBUG = os.environ.get("FLASK_DEBUG", "False").lower() in ("true", "1", "yes")


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False


class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"


# Configuration dictionary
config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
    "default": DevelopmentConfig,
}
