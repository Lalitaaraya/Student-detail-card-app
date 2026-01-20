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
                        <label for="company">Company *</label>
                        <input type="text" id="company" name="company" placeholder="Enter company name">
                    </div>

                    <div class="form-group">
                        <label for="phone1">Phone 1 *</label>
                        <input type="tel" id="phone1" name="phone1" placeholder="Enter phone number" required>
                        <div class="error-message" id="phone1-error"></div>
                    </div>

                    <div class="form-group">
                        <label for="phone2">Phone 2 *</label>
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

    clearFormErrors();

    const form = document.getElementById('registrationForm');
    const formData = new FormData(form);

    const name = formData.get('name').trim();
    const company = formData.get('company').trim();
    const phone1 = formData.get('phone1').trim();
    const phone2 = formData.get('phone2').trim();
    const email = formData.get('email').trim();
    const photo = formData.get('photo');

    let hasError = false;

    // Name validation: letters only, 2-100 chars
    // Name validation: letters & spaces only, 2–100 chars
    if (!name) {
     alert('Full Name is required');
     showError('name', 'Full Name is required');
     hasError = true;
    } 
    else if (/\d/.test(name)) {
     alert('Name cannot contain numbers');
     showError('name', 'Name must contain only letters and spaces');
     hasError = true;
    } 
    else if (!/^[A-Za-z\s]+$/.test(name)) {
     alert('Name can contain only letters and spaces');
     showError('name', 'Invalid characters in name');
     hasError = true;
   } 
    else if (name.length < 2 || name.length > 100) {
     alert('Name must be between 2 and 100 characters');
     showError('name', 'Name must be between 2 and 100 characters');
     hasError = true;
}


    // Company validation: mandatory
    if (!company) {
        showError('company', 'Company is required');
        alert('Company is required');
        hasError = true;
    }

    // Phone 1 validation
    if (!phone1) {
        showError('phone1', 'Primary Phone is required');
        alert('Primary phone number must be exactly 10 digits');
        hasError = true;
    } else if (!/^\d{10}$/.test(phone1.replace(/\D/g, ''))) {
        showError('phone1', 'Phone must be exactly 10 digits');
         alert('Secondary phone number must be exactly 10 digits also it should not match with primary phone number');
        hasError = true;
    }

    // Phone 2 validation (optional)
    if (phone2 && !/^\d{10}$/.test(phone2.replace(/\D/g, ''))) {
        showError('phone2', 'Phone 2 must be exactly 10 digits');
        hasError = true;
    }
    // Phone numbers must be different
    if (phone1 && phone2) {
     const cleanPhone1 = phone1.replace(/\D/g, '');
     const cleanPhone2 = phone2.replace(/\D/g, '');

    if (cleanPhone1 === cleanPhone2) {
        alert('Primary phone number and alternate phone number must be different');
        showError('phone2', 'Alternate phone number must be different');
        hasError = true;
    }
}


    // Email validation
    if (!email) {
        showError('email', 'Email is required');
        hasError = true;
    } else if (!isValidEmail(email)) {
        showError('email', 'Enter a valid email (e.g., user@example.com)');
        hasError = true;
    }

    // Photo validation
    if (!photo || photo.size === 0) {
        showError('photo', 'Student photo is required');
        hasError = true;
    } else {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!validTypes.includes(photo.type)) {
            showError('photo', 'Only PNG, JPG, GIF files are allowed');
            hasError = true;
        }
        if (photo.size > 5 * 1024 * 1024) {
            showError('photo', 'Photo must not exceed 5MB');
            hasError = true;
        }
    }
    
    if (hasError) return;

    // Submit form
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
        return await response.json();
    } catch (err) {
        console.error('Error loading student card:', err);
        goToPage('studentList');
        return null;
    }
}
function formatPhone(number) {
  if (!number) return '';
  const digits = number.replace(/\D/g, '');
  return digits.replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3');
}


async function renderStudentCard() {
    const app = document.getElementById('app');
    const student = await loadStudentCard();

    if (!student) return;

    /* AVATAR LOGIC
       1) If uploaded photo exists → show it
       2) Else fallback to DiceBear using name
    */
    const avatarUrl = student.photo
        ? `${API_BASE}/uploads/${student.photo}`
        : `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(student.name)}`;

app.innerHTML = `
  <div class="page-student-card">

    <div class="card-wrapper">

      <!-- HORIZONTAL CARD -->
      <div class="student-card-horizontal">

        <!-- LEFT: AVATAR + BADGES -->
        <div class="avatar-column">
          <img
            src="${avatarUrl}"
            alt="${escapeHtml(student.name)}"
            class="card-avatar"
          />

          <div class="badges">
            <i class="fa-solid fa-medal badge gray"></i>
            <i class="fa-solid fa-medal badge green"></i>
            <i class="fa-solid fa-medal badge gray"></i>
          </div>
        </div>

        <!-- RIGHT: INFO -->
        <div class="info-column">

          <div class="card-name">${escapeHtml(student.name)}</div>

          ${student.company ? `
            <div class="card-company">
              <i class="fa-solid fa-building"></i>
              ${escapeHtml(student.company)}
            </div>
          ` : ''}

          <!-- PHONE + LANDLINE (ONE LINE) -->
          <div class="card-info-row">
            <i class="fa-solid fa-phone"></i>
            <span>${formatPhone(student.phone1)}</span>

            ${student.phone2 ? `
              <i class="icon">☎</i>
              <span>${formatPhone(student.phone2)}</span>
            ` : ''}
          </div>

          <!-- EMAIL -->
          ${student.email ? `
            <div class="card-info-row">
              <i class="fa-solid fa-envelope"></i>
              <span>${escapeHtml(student.email)}</span>
            </div>
          ` : ''}

        </div>
      </div>

    </div>

    <!-- BUTTONS BELOW CARD -->
    <div class="card-actions">
      <button class="primary-btn" onclick="goToPage('studentList')">← Back</button>
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
