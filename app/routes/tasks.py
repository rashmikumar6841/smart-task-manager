from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db, socketio
from app.models.task import Task

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/tasks', methods=['GET'])
@login_required
def get_tasks():
    """Get all tasks for the current user."""
    # Optional filtering
    status_filter = request.args.get('status')
    priority_filter = request.args.get('priority')
    
    query = Task.query.filter_by(user_id=current_user.id)
    
    if status_filter:
        query = query.filter_by(status=status_filter)
    if priority_filter:
        query = query.filter_by(priority=priority_filter)
        
    # Ordering by creation date descending
    tasks = query.order_by(Task.created_at.desc()).all()
    
    return jsonify({'tasks': [task.to_dict() for task in tasks]})

@tasks_bp.route('/tasks', methods=['POST'])
@login_required
def create_task():
    """Create a new task."""
    data = request.get_json() or {}
    
    if 'title' not in data:
        return jsonify({'error': 'Title is required'}), 400
        
    task = Task(user_id=current_user.id)
    task.from_dict(data)
    
    db.session.add(task)
    db.session.commit()
    
    task_dict = task.to_dict()
    
    # Emit real-time update
    socketio.emit('task_added', task_dict, room=f'user_{current_user.id}')
    
    return jsonify(task_dict), 201

@tasks_bp.route('/tasks/<int:task_id>', methods=['GET'])
@login_required
def get_task(task_id):
    """Get a specific task."""
    task = Task.query.filter_by(id=task_id, user_id=current_user.id).first_or_404()
    return jsonify(task.to_dict())

@tasks_bp.route('/tasks/<int:task_id>', methods=['PUT'])
@login_required
def update_task(task_id):
    """Update a task."""
    task = Task.query.filter_by(id=task_id, user_id=current_user.id).first_or_404()
    data = request.get_json() or {}
    
    # Store old status to check if it changed
    old_status = task.status
    
    task.from_dict(data)
    db.session.commit()
    
    task_dict = task.to_dict()
    
    # Emit real-time update
    socketio.emit('task_updated', task_dict, room=f'user_{current_user.id}')
    
    # Special notification if status changed to completed
    if old_status != 'Completed' and task.status == 'Completed':
        socketio.emit('notification', 
                     {'message': f"Task '{task.title}' completed!", 'type': 'success'}, 
                     room=f'user_{current_user.id}')
                     
    return jsonify(task_dict)

@tasks_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
@login_required
def delete_task(task_id):
    """Delete a task."""
    task = Task.query.filter_by(id=task_id, user_id=current_user.id).first_or_404()
    task_id = task.id
    
    db.session.delete(task)
    db.session.commit()
    
    # Emit real-time update
    socketio.emit('task_deleted', {'id': task_id}, room=f'user_{current_user.id}')
    
    return jsonify({'message': 'Task deleted successfully'})
