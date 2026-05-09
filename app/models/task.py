from datetime import datetime
from app import db

class Task(db.Model):
    """Task model representing a user's to-do item."""
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    priority = db.Column(db.String(20), nullable=False, default='Medium') # Low, Medium, High
    status = db.Column(db.String(20), nullable=False, default='Pending') # Pending, In Progress, Completed
    due_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign key to user
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def to_dict(self):
        """Return a dictionary representation of the task."""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'priority': self.priority,
            'status': self.status,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'user_id': self.user_id
        }

    def from_dict(self, data):
        """Update task attributes from a dictionary."""
        for field in ['title', 'description', 'priority', 'status', 'due_date']:
            if field in data:
                val = data[field]
                if field == 'due_date' and val:
                    try:
                        val = datetime.fromisoformat(val.replace('Z', '+00:00'))
                    except:
                        continue
                setattr(self, field, val)

    def __repr__(self):
        return f'<Task {self.title}>'
