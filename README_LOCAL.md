# OrgAttendance AI - Local Setup Instructions

## Prerequisites
1. **Node.js** (v16 or higher)
2. **MySQL** Server

## 1. Database Setup
1. Open your MySQL client (Workbench, phpMyAdmin, or CLI).
2. Create a database named `org_attendance_db` (or copy the SQL below).
3. Copy the content from `backend/database_schema.txt` and run it as a SQL query to create tables and seed data.

## 2. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the Database:
   - Open `backend/.env`
   - Update `DB_USER` and `DB_PASSWORD` to match your local MySQL credentials.
4. Start the Server:
   ```bash
   npm start
   ```
   *The server should run on http://localhost:5000*

## 3. Frontend Setup
1. Open a new terminal and navigate to the root folder (where `package.json` is).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React App:
   ```bash
   npm run dev
   ```
4. Open the browser at `http://localhost:3000`.

## 4. Default Login
- **Admin**: You may need to insert an admin user manually into the database or use the registration feature if enabled.
- **Demo Mode**: The login screen has a "Skip" or demo credential hint `admin@technova.com / 123456` if you seeded the user in the database.

To create an initial admin user manually in SQL:
```sql
INSERT INTO users (employee_id, name, email, password_hash, role, department) 
VALUES ('ADMIN-01', 'System Admin', 'admin@technova.com', '$2a$10$YourHashedPasswordHere', 'ADMIN', 'IT');
-- Note: You need to generate a real bcrypt hash for the password using an online generator or the app registration flow.
```
