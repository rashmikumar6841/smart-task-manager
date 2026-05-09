# Database Setup & Application Run Instructions

It looks like you haven't created the PostgreSQL database yet! Don't worry, here is a step-by-step guide to get your database created, configure the app, and run it successfully.

## Step 1: Create the PostgreSQL Database

You need to create an empty database named `smart_task_manager`. You can do this in two ways:

### Option A: Using pgAdmin (Recommended if you have a visual interface)
1. Open **pgAdmin** and log in with your master password.
2. In the left sidebar, expand **Servers** -> **PostgreSQL**.
3. Right-click on **Databases** and select **Create** -> **Database...**
4. In the "Database" field, type exactly: `smart_task_manager`
5. Click **Save**.

### Option B: Using Command Line (psql)
1. Open your terminal or command prompt.
2. Type `psql -U postgres` and press Enter. (It will ask for your postgres password).
3. Once logged in, type: `CREATE DATABASE smart_task_manager;` and press Enter.
4. Type `\q` and press Enter to exit.

---

## Step 2: Update Your `.env` Password

The application uses the `.env` file to know how to log into your database. By default, it's using the password `password`, which is probably incorrect.

1. Open the `.env` file located here: `c:\Users\Admin\OneDrive\Documents\python_development\smart-task-manager\.env`
2. Find the line that looks like this:
   ```text
   DATABASE_URL=postgresql://postgres:password@localhost:5432/smart_task_manager
   ```
3. Change the word `password` to your actual PostgreSQL password. 
   *(For example, if your password is `admin123`, it should look like: `postgresql://postgres:admin123@localhost:5432/smart_task_manager`)*
4. **Save** the `.env` file.

---

## Step 3: Run the Application

Now that the database is created and the app has the right password, you can run the app!

1. Open a new terminal in your project folder (`c:\Users\Admin\OneDrive\Documents\python_development\smart-task-manager`).
2. Run the application with this command:
   ```bash
   venv\Scripts\python.exe run.py
   ```
3. You should see text indicating the server is running.
4. Open your web browser and go to: [http://localhost:5000](http://localhost:5000)

*(Note: The database tables will be created automatically by the code the very first time you run this command, so you don't need to create the tables manually!)*
