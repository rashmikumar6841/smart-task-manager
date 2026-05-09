# GitHub Submission Guide

This guide will help you push your "Smart Task Management System" to GitHub for your internship submission.

## Step 1: Initialize Git and Commit Your Code

1.  Open your terminal in the project folder (`c:\Users\Admin\OneDrive\Documents\python_development\smart-task-manager`).
2.  Initialize a new Git repository:
    ```bash
    git init
    ```
3.  Add all files to the repository (the `.gitignore` file I created will automatically exclude the `venv` and `.env` files):
    ```bash
    git add .
    ```
4.  Commit your changes:
    ```bash
    git commit -m "Initial commit: Smart Task Management System"
    ```

## Step 2: Create a New Repository on GitHub

1.  Log in to your [GitHub account](https://github.com/).
2.  Click the **+** icon in the top-right corner and select **New repository**.
3.  Name your repository (e.g., `smart-task-manager`).
4.  (Optional) Add a description.
5.  Keep the repository **Public** (so your internship evaluators can see it).
6.  **Do NOT** initialize the repository with a README, .gitignore, or license (since we already have them locally).
7.  Click **Create repository**.

## Step 3: Push Your Code to GitHub

After creating the repository, GitHub will show you some commands. Run these in your terminal:

1.  Add the remote repository URL (replace `YOUR_USERNAME` with your actual GitHub username):
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/smart-task-manager.git
    ```
2.  Rename the default branch to `main`:
    ```bash
    git branch -M main
    ```
3.  Push your code to the `main` branch:
    ```bash
    git push -u origin main
    ```

## Step 4: Verify Your Submission

1.  Go to your GitHub repository page.
2.  Verify that all your files (except `venv` and `.env`) are listed there.
3.  Ensure your `README.md` looks good—it contains the setup instructions.
4.  You can now share the repository URL with your internship coordinator!

---

### Important Note about Security
I have excluded your `.env` file from the repository to protect your database credentials. When someone else clones your project, they will need to create their own `.env` file based on the template in your `README.md`.
