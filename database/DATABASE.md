# Database Schema

## Database Name
`db_schema`

## Tables

### students
This table stores all student information including contact details and profile photos.

#### Columns:
- **id** (INT, PRIMARY KEY, AUTO_INCREMENT)
  - Student unique identifier
  
- **name** (VARCHAR(255), NOT NULL)
  - Student full name
  - Required field
  - Max 100 characters enforced at application level
  
- **company** (VARCHAR(255), NULL)
  - Company name or organization
  - Optional field
  
- **phone1** (VARCHAR(20), NULL)
  - Primary phone number
  - Supports international formats with separators
  - Required field
  - Min 10 digits enforced at application level
  
- **phone2** (VARCHAR(20), NULL)
  - Secondary phone number
  - Optional field
  - Min 10 digits enforced at application level
  
- **email** (VARCHAR(255), NULL)
  - Student email address
  - Required field
  - Validated with strict regex pattern
  
- **photo** (LONGBLOB, NULL)
  - Student profile photo stored as base64 encoded JPEG
  - Max file size: 5MB
  - Supported formats: JPEG, JPG, PNG, GIF
  - Automatically resized to 400x400px and compressed
  
- **created_at** (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
  - Record creation timestamp
  - Automatically set to current time
  
- **updated_at** (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP, ON UPDATE CURRENT_TIMESTAMP)
  - Record update timestamp
  - Automatically updated on any change

## Creation Query
```sql
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  phone1 VARCHAR(20),
  phone2 VARCHAR(20),
  email VARCHAR(255),
  photo LONGBLOB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

## Notes
- The database is automatically created and initialized when the server starts
- The photo column uses LONGBLOB to store base64 encoded images
- All timestamps use the server timezone (UTC by default)
- The table is optimized for quick lookups and includes automatic timestamps
