"""
run.py - Application entry point
Start the Flask development server with SocketIO support
"""

import os
from app import create_app, socketio

# Load environment-based configuration
config_name = os.environ.get("FLASK_ENV", "development")
app = create_app(config_name)

if __name__ == "__main__":
    # Run with Flask-SocketIO to support WebSocket connections
    socketio.run(
        app,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=app.config["DEBUG"],
        allow_unsafe_werkzeug=True  # Required for development mode
    )
