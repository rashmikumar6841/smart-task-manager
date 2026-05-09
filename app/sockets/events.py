from flask import request
from flask_login import current_user
from flask_socketio import join_room, leave_room, emit
from app import socketio

@socketio.on('connect')
def handle_connect():
    """Handle client connection and join user-specific room if authenticated."""
    if current_user.is_authenticated:
        # Join a room specific to the user for targeted updates
        room_name = f"user_{current_user.id}"
        join_room(room_name)
        emit('connection_established', {'message': 'Connected to real-time updates.'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection."""
    if current_user.is_authenticated:
        room_name = f"user_{current_user.id}"
        leave_room(room_name)

@socketio.on('join')
def on_join(data):
    """Explicitly join a room (used for testing or additional rooms)."""
    room = data['room']
    join_room(room)
    
@socketio.on('leave')
def on_leave(data):
    """Explicitly leave a room."""
    room = data['room']
    leave_room(room)
