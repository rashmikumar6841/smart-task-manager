"""
app/__init__.py - Application factory module
Creates and configures the Flask application with all extensions
"""

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_socketio import SocketIO

from config import config

# Initialize extensions (created here, bound to app in create_app)
db = SQLAlchemy()
login_manager = LoginManager()
socketio = SocketIO()

# Configure Flask-Login
login_manager.login_view = "auth.login"
login_manager.login_message = "Please log in to access this page."
login_manager.login_message_category = "warning"


def create_app(config_name="development"):
    """
    Application factory function.
    Creates and configures the Flask app with all extensions and blueprints.

    Args:
        config_name: Configuration environment ('development', 'production', 'testing')

    Returns:
        Configured Flask application instance
    """
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(config.get(config_name, config["default"]))

    # Initialize extensions with app
    db.init_app(app)
    login_manager.init_app(app)
    socketio.init_app(app, cors_allowed_origins="*", async_mode=app.config.get("SOCKETIO_ASYNC_MODE", "threading"))

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.main import main_bp
    from app.routes.tasks import tasks_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(tasks_bp, url_prefix="/api")

    # Register WebSocket events
    from app.sockets import events  # noqa: F401

    # Create database tables if they don't exist
    with app.app_context():
        from app.models import user, task  # noqa: F401
        db.create_all()

    return app
