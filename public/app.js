// Application State
const appState = {
    currentPage: 'studentList',
    students: [],
    selectedStudentId: null
};

// API Base URL
const API_BASE = 'http://localhost:3000/api';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadAndRenderPage();
});

// Route to different pages
async function goToPage(page, studentId = null) {
    appState.currentPage = page;
    appState.selectedStudentId = studentId;
    loadAndRenderPage();
}

// Load and Render Current Page
async function loadAndRenderPage() {
    const app = document.getElementById('app');
    
    switch (appState.currentPage) {
        case 'studentList':
            await loadStudentList();
            renderStudentList();
            break;
        case 'registration':
            renderRegistrationForm();
            break;
        case 'studentCard':
            await loadStudentCard();
            renderStudentCard();
            break;
        default:
            await loadStudentList();
            renderStudentList();
    }
}

// ===== PAGE 1: STUDENT LIST =====

async function loadStudentList() {
    try {
        const response = await fetch(`${API_BASE}/students`);
        if (!response.ok) throw new Error('Failed to fetch students');
        appState.students = await response.json();
    } catch (err) {
        console.error('Error loading students:', err);
        appState.students = [];
    }
}

function renderStudentList() {
    const app = document.getElementById('app');
    const studentsHtml = appState.students.map(student => `
        <tr>
            <td class="student-name">${escapeHtml(student.name)}</td>
            <td>${student.company ? escapeHtml(student.company) : '-'}</td>
            <td>${student.phone1 || '-'}</td>
            <td>${student.phone2 || '-'}</td>
            <td>${student.email || '-'}</td>
            <td>
                <button class="btn-view-card" onclick="goToPage('studentCard', ${student.id})">
                    View Card
                </button>
            </td>
        </tr>
    `).join('');

    const emptyStateHtml = appState.students.length === 0 ? `
        <div class="empty-state">
            <h2>No Students Yet</h2>
            <p>Click "New Registration" to add your first student</p>
        </div>
    ` : '';

    const tableHtml = appState.students.length > 0 ? `
        <div class="students-table-container">
            <table class="students-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Company</th>
                        <th>Phone 1</th>
                        <th>Phone 2</th>
                        <th>Email</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${studentsHtml}
                </tbody>
            </table>
        </div>
    ` : '';

    app.innerHTML = `
        <div class="page-student-list">
            <div class="list-header">
                <div class="header-left">
                    <h1>📚 Student List</h1>
                    <div class="student-count">Total Registered: <span class="count-badge">${appState.students.length}</span></div>
                </div>
                <button class="btn-new-registration" onclick="goToPage('registration')">
                    ➕ New Registration
                </button>
            </div>
            ${tableHtml}
            ${emptyStateHtml}
        </div>
    `;
}

// ===== PAGE 2: REGISTRATION FORM =====

function renderRegistrationForm() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="page-registration">
            <div class="form-container">
                <h1>📝 Student Registration</h1>
                <form id="registrationForm" onsubmit="handleRegistrationSubmit(event)">
                    
                    <div class="form-group">
                        <label for="name">Full Name *</label>
                        <input type="text" id="name" name="name" placeholder="Enter student name" required>
                        <div class="error-message" id="name-error"></div>
                    </div>

                    <div class="form-group">
                        <label for="company">Company</label>
                        <input type="text" id="company" name="company" placeholder="Enter company name">
                    </div>

                    <div class="form-group">
                        <label for="phone1">Phone 1 *</label>
                        <input type="tel" id="phone1" name="phone1" placeholder="Enter phone number" required>
                        <div class="error-message" id="phone1-error"></div>
                    </div>

                    <div class="form-group">
                        <label for="phone2">Phone 2</label>
                        <input type="tel" id="phone2" name="phone2" placeholder="Enter second phone number (optional)">
                    </div>

                    <div class="form-group">
                        <label for="email">Email *</label>
                        <input type="email" id="email" name="email" placeholder="Enter email address" required>
                        <div class="error-message" id="email-error"></div>
                    </div>

                    <div class="photo-upload-container">
                        <label class="photo-upload-label">Student Photo *</label>
                        <div class="photo-input-wrapper">
                            <input type="file" id="photo" name="photo" accept="image/*" required>
                            <label for="photo" class="photo-upload-button">
                                📸 Click to upload or drag & drop
                                <br><small>PNG, JPG, GIF (Max 5MB)</small>
                            </label>
                        </div>
                        <div class="photo-preview-container" id="photoPreviewContainer"></div>
                        <div class="error-message" id="photo-error"></div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn-submit">✓ Submit</button>
                        <button type="button" class="btn-cancel" onclick="goToPage('studentList')">← Back</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Setup photo upload preview
    const photoInput = document.getElementById('photo');
    const photoPreviewContainer = document.getElementById('photoPreviewContainer');

    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                photoPreviewContainer.innerHTML = `
                    <img src="${event.target.result}" alt="Preview" class="photo-preview">
                    <p style="margin-top: 10px; color: #667eea; font-weight: 600;">✓ Photo selected</p>
                `;
            };
            reader.readAsDataURL(file);
        }
    });

    // Setup drag & drop
    const photoLabel = document.querySelector('.photo-upload-button');
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        photoLabel.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        photoLabel.addEventListener(eventName, () => {
            photoLabel.style.borderColor = '#764ba2';
            photoLabel.style.background = '#f0f2ff';
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        photoLabel.addEventListener(eventName, () => {
            photoLabel.style.borderColor = '#667eea';
            photoLabel.style.background = '#f8f9ff';
        });
    });

    photoLabel.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        photoInput.files = files;
        
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        photoInput.dispatchEvent(event);
    });
}

async function handleRegistrationSubmit(event) {
    event.preventDefault();
    
    // Clear previous errors
    clearFormErrors();

    // Get form data
    const form = document.getElementById('registrationForm');
    const formData = new FormData(form);

    // Strict Validation
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const phone1 = formData.get('phone1').trim();
    const phone2 = formData.get('phone2').trim();
    const company = formData.get('company').trim();
    const photo = formData.get('photo');

    let hasError = false;

    // Name validation
    if (!name || name.length < 2) {
        showError('name', 'Name is required and must be at least 2 characters');
        hasError = true;
    } else if (name.length > 100) {
        showError('name', 'Name must not exceed 100 characters');
        hasError = true;
    }

    // Email validation
    if (!email) {
        showError('email', 'Email is required');
        hasError = true;
    } else if (!isValidEmail(email)) {
        showError('email', 'Please enter a valid email address (e.g., user@example.com)');
        hasError = true;
    }

    // Phone 1 validation
    if (!phone1) {
        showError('phone1', 'Primary phone number is required');
        hasError = true;
    } else if (!isValidPhone(phone1)) {
        showError('phone1', 'Please enter a valid phone number (10+ digits)');
        hasError = true;
    }

    // Phone 2 validation (if provided)
    if (phone2 && !isValidPhone(phone2)) {
        showError('phone2', 'Please enter a valid phone number (10+ digits)');
        hasError = true;
    }

    // Photo validation
    if (!photo) {
        showError('photo', 'Student photo is required');
        hasError = true;
    } else {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!validTypes.includes(photo.type)) {
            showError('photo', 'Only PNG, JPG, GIF files are allowed');
            hasError = true;
        }
        // Validate file size (5MB max)
        if (photo.size > 5 * 1024 * 1024) {
            showError('photo', 'Photo size must not exceed 5MB');
            hasError = true;
        }
    }

    if (hasError) return;

    // Submit
    try {
        const button = event.target.querySelector('.btn-submit');
        button.disabled = true;
        button.textContent = '⏳ Submitting...';

        const response = await fetch(`${API_BASE}/students`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create student');
        }

        await response.json();
        goToPage('studentList');
    } catch (err) {
        alert('Error: ' + err.message);
        const button = event.target.querySelector('.btn-submit');
        button.disabled = false;
        button.textContent = '✓ Submit';
    }
}

function showError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    const inputElement = document.getElementById(fieldName);
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    if (inputElement) {
        inputElement.classList.add('error');
    }
}

function clearFormErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.classList.remove('show');
        el.textContent = '';
    });
    document.querySelectorAll('input, textarea').forEach(el => {
        el.classList.remove('error');
    });
}

// ===== PAGE 3: STUDENT CARD =====

async function loadStudentCard() {
    try {
        const response = await fetch(`${API_BASE}/students/${appState.selectedStudentId}`);
        if (!response.ok) throw new Error('Student not found');
        const student = await response.json();
        appState.selectedStudentId = student.id;
        return student;
    } catch (err) {
        console.error('Error loading student card:', err);
        goToPage('studentList');
        return null;
    }
}

async function renderStudentCard() {
    const app = document.getElementById('app');
    const student = await loadStudentCard();

    if (!student) return;

    // Generate DiceBear avatar URL from seed
    const avatarUrl = student.avatar 
        ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(student.avatar)}&scale=100`
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=default`;

    app.innerHTML = `
        <!-- This is what your app.js should create/insert when showing page 3 -->
        <div class="page-student-card">
          <div class="card-wrapper">
            <div class="student-card">
             <img 
                src="path/to/student-photo.jpg" 
                alt="Student Name" 
               class="card-avatar"
          >

             <div class="card-name">Aron Giles</div>
      
               <div class="card-company">Birdhouse Construction pty ltd</div>

                 <div class="card-contact-row">
                   <div class="card-contact-item">
                     <span class="card-contact-icon">📞</span>
                     <span class="card-contact-text">430-203-203</span>
                    </div>
                <div class="card-contact-item">
                  <span class="card-contact-icon">☎</span>
                  <span class="card-contact-text">410-201-201</span>
               </div>
            </div>

            <div class="card-rating">★★★</div>

             <a href="mailto:aron.smith@gmail.com" class="card-email">
             aron.smith@gmail.com
             </a>
            </div>
        </div>
    </div>
    `;
}

// ===== VALIDATION UTILITIES =====

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

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
