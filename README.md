# Smart Task Management System

A full-stack, real-time task management web application built with Python Flask, PostgreSQL, WebSockets, Pandas, and Bootstrap.

## Features

- **Authentication System**: Secure user registration, login, and session management using Flask-Login and Werkzeug password hashing.
- **Task Management API**: Full CRUD REST APIs to manage tasks.
- **Real-time Updates**: Instant UI updates across sessions using WebSockets (Flask-SocketIO).
- **Data Analytics**: Task progress and statistics computed via Pandas and NumPy.
- **Modern UI**: Responsive dashboard with Dark/Light mode, built with HTML5, CSS3, and Bootstrap 5.
- **Database**: PostgreSQL integration with SQLAlchemy ORM.
- **Bonus Features**: Task filtering, real-time search, interactive charts (via progress bars), and Toast notifications.

## Project Structure

```text
smart-task-manager/
├── app/
│   ├── models/           # Database models (User, Task)
│   ├── routes/           # Blueprints for routing (Auth, Main, Tasks API)
│   ├── templates/        # HTML Templates (Jinja2)
│   ├── static/           # CSS and JS files
│   ├── sockets/          # WebSocket event handlers
│   └── __init__.py       # App factory setup
├── config.py             # Application configuration
├── .env                  # Environment variables
├── requirements.txt      # Python dependencies
├── run.py                # App entry point
└── schema.sql            # Database schema reference
```

## Setup Instructions

Follow these steps to run the project locally.

### 1. Prerequisites
- Python 3.8+
- PostgreSQL server running locally.

### 2. Database Setup
Create a PostgreSQL database for the application.
```bash
# In psql or pgAdmin:
CREATE DATABASE smart_task_manager;
```

### 3. Clone / Navigate to Project Directory
```bash
cd smart-task-manager
```

### 4. Create and Activate Virtual Environment
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate
```

### 5. Install Dependencies
```bash
pip install -r requirements.txt
```

### 6. Configure Environment Variables
A `.env` file has been created. Ensure the `DATABASE_URL` matches your PostgreSQL credentials:
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/smart_task_manager
```
*(Replace `postgres` and `yourpassword` with your actual db user and password).*

### 7. Run the Application
The application uses SQLAlchemy to automatically create tables on first run. Start the server using:
```bash
python run.py
```

### 8. Access the App
Open your browser and navigate to:
`http://localhost:5000`

Register a new account, create some tasks, and enjoy the real-time analytics!
