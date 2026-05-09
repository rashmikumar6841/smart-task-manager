from flask import Blueprint, render_template, jsonify, send_file
from flask_login import login_required, current_user
import pandas as pd
import numpy as np
import io
from datetime import datetime

from app.models.task import Task

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    if current_user.is_authenticated:
        return render_template('main/dashboard.html', title='Dashboard')
    return render_template('main/index.html', title='Welcome to Smart Task Manager')

@main_bp.route('/dashboard')
@login_required
def dashboard():
    return render_template('main/dashboard.html', title='Dashboard')

@main_bp.route('/api/analytics')
@login_required
def analytics():
    """Returns analytics data using Pandas and NumPy."""
    tasks = Task.query.filter_by(user_id=current_user.id).all()
    
    if not tasks:
        return jsonify({
            'total_tasks': 0,
            'completed_tasks': 0,
            'pending_tasks': 0,
            'in_progress_tasks': 0,
            'completion_percentage': 0,
            'priority_distribution': {'High': 0, 'Medium': 0, 'Low': 0}
        })
        
    # Convert SQLAlchemy objects to dicts for Pandas
    tasks_data = [
        {
            'status': task.status,
            'priority': task.priority,
            'created_at': task.created_at
        } for task in tasks
    ]
    
    # Create DataFrame
    df = pd.DataFrame(tasks_data)
    
    # Calculate analytics using pandas and numpy
    total_tasks = len(df)
    
    # Handle potentially missing status categories gracefully
    status_counts = df['status'].value_counts()
    completed = int(status_counts.get('Completed', 0))
    pending = int(status_counts.get('Pending', 0))
    in_progress = int(status_counts.get('In Progress', 0))
    
    priority_counts = df['priority'].value_counts().to_dict()
    # Ensure all priorities are in the dict
    for p in ['High', 'Medium', 'Low']:
        if p not in priority_counts:
            priority_counts[p] = 0
            
    # Calculate completion percentage using numpy
    completion_percentage = np.round((completed / total_tasks) * 100, 1) if total_tasks > 0 else 0.0
    
    # Trend data (tasks created per day for the last 7 days)
    df['date'] = pd.to_datetime(df['created_at']).dt.date
    date_counts = df['date'].value_counts().sort_index().tail(7)
    trend_data = {
        'labels': [d.strftime('%b %d') for d in date_counts.index],
        'values': [int(v) for v in date_counts.values]
    }
    
    return jsonify({
        'total_tasks': total_tasks,
        'completed_tasks': completed,
        'pending_tasks': pending,
        'in_progress_tasks': in_progress,
        'completion_percentage': float(completion_percentage),
        'priority_distribution': {k: int(v) for k, v in priority_counts.items()},
        'trend_data': trend_data
    })

@main_bp.route('/export/tasks')
@login_required
def export_tasks():
    """Exports user tasks to a CSV file using Pandas."""
    tasks = Task.query.filter_by(user_id=current_user.id).all()
    
    if not tasks:
        # Create an empty DataFrame with headers
        df = pd.DataFrame(columns=['Title', 'Description', 'Priority', 'Status', 'Due Date', 'Created At'])
    else:
        tasks_data = [
            {
                'Title': task.title,
                'Description': task.description,
                'Priority': task.priority,
                'Status': task.status,
                'Due Date': task.due_date.strftime('%Y-%m-%d') if task.due_date else 'N/A',
                'Created At': task.created_at.strftime('%Y-%m-%d %H:%M')
            } for task in tasks
        ]
        df = pd.DataFrame(tasks_data)
    
    # Save to a string buffer
    output = io.BytesIO()
    df.to_csv(output, index=False)
    output.seek(0)
    
    return send_file(
        output,
        mimetype='text/csv',
        as_attachment=True,
        download_name=f'tasks_export_{datetime.now().strftime("%Y%m%d")}.csv'
    )
