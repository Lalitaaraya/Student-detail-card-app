const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// MySQL Connection Pool (for normal operations)

let pool;

// -----------------------
// Database Initialization
// -----------------------
async function initializeDatabase() {
  try {
    // 1️⃣ Connect without specifying database
    const setupPool = mysql.createPool({
      host: 'localhost',
      user: 'root',

      password: 'Got@123#',
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0
    });

    const connection = await setupPool.getConnection();

    // 2️⃣ Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS db_schema CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    connection.release();
    await setupPool.end();

    // 3️⃣ Create main pool with database specified
    pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'Got@123#',
      database: 'student_card_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const mainConnection = await pool.getConnection();

    // Add this after your pool creation to test the connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully!');
    
    // Test if we can query the database
    const [result] = await connection.query('SELECT DATABASE() as db_name');
    console.log('Current database:', result[0].db_name);
    
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Available tables:', tables);
    
    connection.release();
  } catch (err) {
    console.error('Connection test failed:', err);
  }
}

app.get('/api/db-info', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        DATABASE() AS database_name,
        @@hostname AS host,
        @@port AS port,
        USER() AS user
    `);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// Call it after initialization
initializeDatabase().then(() => {
  testConnection();  // Add this line
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

    // 4️⃣ Drop old table and create fresh one
    //await mainConnection.query(`DROP TABLE IF EXISTS students`);
    await mainConnection.query(`
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
      )
    `);

    mainConnection.release();
    console.log('Database and table initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', err);
    process.exit(1);
  }
}

// -----------------------
// DiceBear Avatar Seed
// -----------------------
async function generateDiceBearSeed(imageBuffer, name) {
  try {
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(imageBuffer).digest('hex');
    return `${name}-${hash}`;
  } catch (err) {
    console.error('Avatar seed generation error:', err);
    throw err;
  }
}

// -----------------------
// Routes
// -----------------------

// Get all students
app.get('/api/students', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [students] = await connection.query(
      'SELECT id, name, company, phone1, phone2, email, CASE WHEN avatar IS NOT NULL THEN 1 ELSE 0 END as hasAvatar, created_at FROM students ORDER BY created_at DESC'
    );
    connection.release();
    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get single student
app.get('/api/students/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [students] = await connection.query(
      'SELECT * FROM students WHERE id = ?',
      [req.params.id]
    );
    connection.release();

    if (students.length === 0) return res.status(404).json({ error: 'Student not found' });

    const student = students[0];
    if (student.avatar) student.avatar = Buffer.from(student.avatar).toString('base64');

    res.json(student);
  } catch (err) {
    console.error('Error fetching student:', err);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// Create new student
app.post('/api/students', upload.single('photo'), async (req, res) => {
  try {
    const { name, company, phone1, phone2, email } = req.body;

    if (!name || !name.trim() || name.trim().length < 2)
      return res.status(400).json({ error: 'Name is required and must be at least 2 characters' });
    if (name.trim().length > 100)
      return res.status(400).json({ error: 'Name must not exceed 100 characters' });
    if (!email || !isValidEmail(email))
      return res.status(400).json({ error: 'Valid email address is required' });
    if (!phone1 || !isValidPhone(phone1))
      return res.status(400).json({ error: 'Valid phone number 1 is required (10+ digits)' });
    if (!req.file) return res.status(400).json({ error: 'Student photo is required' });
    if (phone2 && !isValidPhone(phone2))
      return res.status(400).json({ error: 'Phone 2 must be a valid phone number' });

    //let avatarBlob = await generateDiceBearSeed(req.file.buffer, name);
    const avatarBlob = req.file.buffer;
    console.log({ name, company, phone1, phone2, email, avatarBlobLength: avatarBlob.length });





    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO students (name, company, phone1, phone2, email, avatar) VALUES (?, ?, ?, ?, ?, ?)',
      [name.trim(), company ? company.trim() : null, phone1.trim(), phone2 ? phone2.trim() : null, email.trim(), avatarBlob]
    );
    connection.release();

    res.status(201).json({
      id: result.insertId,
      name: name.trim(),
      company: company ? company.trim() : null,
      phone1: phone1.trim(),
      phone2: phone2 ? phone2.trim() : null,
      email: email.trim(),
      message: 'Student created successfully'
    });
  } catch (err) {
    console.error('Error creating student:', err);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// Update student
app.put('/api/students/:id', upload.single('photo'), async (req, res) => {
  try {
    const { name, company, phone1, phone2, email } = req.body;
    const studentId = req.params.id;

    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    if (!email || !isValidEmail(email)) return res.status(400).json({ error: 'Valid email is required' });
    if (!phone1 || !isValidPhone(phone1)) return res.status(400).json({ error: 'Valid phone number 1 is required' });

    const connection = await pool.getConnection();

    let updateQuery = 'UPDATE students SET name = ?, company = ?, phone1 = ?, phone2 = ?, email = ?';
    let params = [name, company || null, phone1, phone2 || null, email];

    if (req.file) {
      const avatarBlob = await generateDiceBearSeed(req.file.buffer, name);
      updateQuery += ', avatar = ?';
      params.push(avatarBlob);
    }

    updateQuery += ' WHERE id = ?';
    params.push(studentId);

    await connection.query(updateQuery, params);
    connection.release();

    res.json({ message: 'Student updated successfully' });
  } catch (err) {
    console.error('Error updating student:', err);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// Delete student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    connection.release();

    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// -----------------------
// Validation functions
// -----------------------
function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

function isValidPhone(phone) {
  const phoneRegex = /^[\d\-\s\+\(\)]{10,}$/;
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10 && phoneRegex.test(phone);
}

// -----------------------
// Error handling middleware
// -----------------------
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});


// -----------------------
// Start server
// -----------------------
const PORT = process.env.PORT || 3000;

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
