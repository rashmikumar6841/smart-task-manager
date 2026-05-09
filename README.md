# 🚀 Smart Task Management System

A professional, full-stack, real-time task management platform built for modern workflows. This project showcases advanced integration of Python Flask, PostgreSQL, and real-time WebSockets.

## ✨ Project Highlights 

- **📈 Advanced Data Analytics**: Utilizes **Pandas & NumPy** to compute task completion trends and priority distributions.
- **📊 Interactive Visualizations**: Beautiful dashboard charts powered by **Chart.js** for at-a-glance productivity tracking.
- **⚡ Real-time Synchronization**: Seamless UI updates and notifications across all connected clients using **Flask-SocketIO**.
- **📅 Smart Deadlines**: Integrated **Due Date** management with automatic overdue highlighting to help users prioritize.
- **📄 Data Portability**: One-click **CSV Export** feature (powered by Pandas) to download your task history for offline use.
- **🔒 Secure Authentication**: Robust registration and login system with **Werkzeug** password hashing and **Flask-Login** session management.
- **🎨 Premium UI**: Modern Dark/Light mode interface built with **Bootstrap 5**, featuring responsive layouts and toast notifications.

## 🛠 Tech Stack
- **Backend**: Python, Flask, SQLAlchemy ORM
- **Database**: PostgreSQL
- **Data Analysis**: Pandas, NumPy
- **Real-time**: WebSockets (Flask-SocketIO)
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Chart.js, Bootstrap 5

---

## ⚙️ Installation & Setup Guide

Follow these steps to set up the project on your local machine.

### 1. Prerequisites
- **Python 3.12+**
- **PostgreSQL** server installed and running.

### 2. Database Creation
Create a new database in PostgreSQL named `smart_task_manager`:
```sql
-- In psql or pgAdmin
CREATE DATABASE smart_task_manager;
```

### 3. Environment Configuration
Create a `.env` file in the root directory (or update the existing one) with your credentials:
```env
FLASK_APP=run.py
FLASK_DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/smart_task_manager
```
*Note: Replace `YOUR_PASSWORD` with your actual PostgreSQL password.*

### 4. Setup Virtual Environment & Install Dependencies
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

pip install -r requirements.txt
```

### 5. Initialize & Run
On the first run, the system will automatically create all necessary tables.
```bash
python run.py
```
Visit **http://localhost:5000** to start managing your tasks!

---

## 📂 Project Structure
```text
smart-task-manager/
├── app/
│   ├── models/           # Data definitions (SQLAlchemy)
│   ├── routes/           # REST API & Web Routes
│   ├── sockets/          # WebSocket Event Handlers
│   ├── static/           # CSS, JS, and Images
│   └── templates/        # Jinja2 HTML Templates
├── config.py             # App Configuration
├── requirements.txt      # Dependency List
└── run.py                # Entry Point
```
