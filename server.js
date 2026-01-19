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

// Initialize Database
async function initializeDatabase() {
  try {
    // First, create a connection without specifying database
    const setupPool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'Got@123#',
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0
    });

    const connection = await setupPool.getConnection();
    
    // Create database if not exists
    await connection.query(
      'CREATE DATABASE IF NOT EXISTS db_schema'
    );
    
    connection.release();
    await setupPool.end();

    // Now create the main pool with database specified
    pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'Got@123#',
      database: 'db_schema',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const mainConnection = await pool.getConnection();
    
    // Create students table
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
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', err);
    console.error('Please verify your MySQL credentials:');
    console.error('- Host: localhost');
    console.error('- User: root');
    console.error('- Password: Got@123#');
    process.exit(1);
  }
}

// Generate DiceBear Avatar Seed from uploaded image
async function generateDiceBearSeed(imageBuffer, name) {
  try {
    // Create a hash from the image to use as DiceBear seed
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(imageBuffer).digest('hex');
    
    // DiceBear seed: use name + hash for uniqueness
    const seed = `${name}-${hash}`;
    return seed;
  } catch (err) {
    console.error('Avatar seed generation error:', err);
    throw err;
  }
}

// Routes

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
    
    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const student = students[0];
    
    // Convert BLOB to base64 for sending to frontend
    if (student.avatar) {
      student.avatar = Buffer.from(student.avatar).toString('base64');
    }
    
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
    
    // Strict Validation
    if (!name || !name.trim() || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name is required and must be at least 2 characters' });
    }
    if (name.trim().length > 100) {
      return res.status(400).json({ error: 'Name must not exceed 100 characters' });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }
    if (!phone1 || !isValidPhone(phone1)) {
      return res.status(400).json({ error: 'Valid phone number 1 is required (10+ digits)' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Student photo is required' });
    }
    if (phone2 && !isValidPhone(phone2)) {
      return res.status(400).json({ error: 'Phone 2 must be a valid phone number' });
    }
    
    let avatarBlob = null;
    
    // Process uploaded image and generate DiceBear seed
    if (req.file) {
      try {
        avatarBlob = await generateDiceBearSeed(req.file.buffer, name);
      } catch (err) {
        return res.status(400).json({ error: 'Failed to process image' });
      }
    } else {
      return res.status(400).json({ error: 'Student photo is required' });
    }
    
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
    
    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!phone1 || !isValidPhone(phone1)) {
      return res.status(400).json({ error: 'Valid phone number 1 is required' });
    }
    
    const connection = await pool.getConnection();
    
    let updateQuery = 'UPDATE students SET name = ?, company = ?, phone1 = ?, phone2 = ?, email = ?';
    let params = [name, company || null, phone1, phone2 || null, email];
    
    // Update avatar if new image is provided
    if (req.file) {
      const avatarBlob = await generateDiceBearAvatar(req.file.buffer);
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

// Validation functions
function isValidEmail(email) {
  // Strict email validation
  const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

function isValidPhone(phone) {
  // Strict phone validation: 10+ digits, allows common separators
  const phoneRegex = /^[\d\-\s\+\(\)]{10,}$/;
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10 && phoneRegex.test(phone);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
