# Database Setup Instructions

## Automatic Setup (Recommended)

The application will automatically create the database and tables when you start the server for the first time. Just ensure MySQL is running.

## Manual Setup (Optional)

If you prefer to set up manually:

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS student_card_db;
USE student_card_db;

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    phone1 VARCHAR(20),
    phone2 VARCHAR(20),
    email VARCHAR(255),
    avatar LONGBLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## MySQL Configuration

The default credentials are:
- **Host**: localhost
- **User**: root
- **Password**: Got@123#
- **Database**: db_schema

## Connection Test

To verify the connection works:
1. Start the server: `npm start`
2. You should see: "Database initialized successfully"
3. Open http://localhost:3000 in your browser

## Troubleshooting

### Connection Error
If you get a connection error:
1. Verify MySQL is running
2. Check credentials in server.js
3. Ensure the user has permissions to create databases

### Table Already Exists
The app uses "CREATE TABLE IF NOT EXISTS" so it's safe to run multiple times

### Data Persistence
All data is stored in MySQL database automatically
