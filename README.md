# Student Card App - Professional Edition

A modern, professional student card management application with a clean UI built with Express.js, MySQL, and vanilla JavaScript.

## Project Structure

```
Student card app/
├── frontend/                 # Frontend files (HTML, CSS, JavaScript)
│   ├── index.html           # Main HTML file
│   ├── app.js               # Application logic and routing
│   └── styles.css           # Professional styling
│
├── backend/                 # Backend server files
│   └── server.js            # Express server and API endpoints
│
├── database/                # Database documentation
│   └── DATABASE.md          # Database schema documentation
│
├── package.json             # Project dependencies and scripts
└── README.md               # This file
```

## Features

### Student Management
- ✅ **View Student List** - Display all registered students in a professional table format
- ✅ **View Student Card** - Professional student card with profile photo and contact details
- ✅ **Register New Student** - Add new students with photo upload and validation
- ✅ **Photo Upload** - Drag & drop or click to upload student photos (max 5MB)
- ✅ **Data Validation** - Strict validation for all fields on client and server

### Professional Design
- Clean, modern UI with gradient backgrounds
- Responsive design for all screen sizes
- Professional student card layout with:
  - Profile photo (rounded rectangle with shadow)
  - Student name (large, bold typography)
  - Company information
  - **Two phone numbers displayed side-by-side** (left and right)
  - Email contact with clickable mailto link
- Smooth animations and transitions
- Easy-to-use action buttons outside the card (Back to List, New Registration)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- npm or yarn

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure MySQL
Update your MySQL credentials in `backend/server.js`:
```javascript
host: 'localhost',
user: 'root',
password: 'Got@123#',  // Change to your password
```

### Step 3: Start the Server
```bash
npm start
```

The application will:
1. Automatically create the `db_schema` database
2. Create the `students` table with proper schema
3. Start the server on `http://localhost:3000`

## Usage

### Home - Student List
- View all registered students in a table
- Click "View Card" to see individual student's professional card
- Click "+ New Registration" to add a new student

### Student Card (Professional View)
- **Layout**: Profile photo on left, information on right
- **Phone Numbers**: Displayed side-by-side (left and right) in one line
- **Navigation Buttons**: "← Back to List" and "+ New Registration" appear OUTSIDE the card
- **Professional Design**: Clean white card with top gradient accent, shadow effects
- **Contact**: Clickable email address

### Registration Form
- Fill in student details:
  - **Full Name** (required, 2-100 characters)
  - **Company** (required)
  - **Phone 1** (required, 10+ digits)
  - **Phone 2** (optional, 10+ digits)
  - **Email** (required, valid format)
  - **Photo** (required, max 5MB)
- Drag & drop or click to upload photo
- Form validation with error messages
- Submit to create student record

## API Endpoints

### GET `/api/students`
Get all students
- **Response**: Array of student objects

### GET `/api/students/:id`
Get specific student
- **Parameters**: `id` - Student ID
- **Response**: Student object with base64 encoded photo

### POST `/api/students`
Create new student
- **Body**: FormData with student info and photo file
- **Response**: Created student object

### PUT `/api/students/:id`
Update student information
- **Parameters**: `id` - Student ID
- **Body**: FormData with updated info and optional new photo
- **Response**: Success message

### DELETE `/api/students/:id`
Delete student
- **Parameters**: `id` - Student ID
- **Response**: Success message

## Database Schema

See [database/DATABASE.md](database/DATABASE.md) for detailed schema documentation.

### Students Table
- `id` - Auto-increment primary key
- `name` - Student name (required)
- `company` - Company/Organization
- `phone1` - Primary phone (required)
- `phone2` - Secondary phone
- `email` - Email address (required)
- `photo` - Base64 encoded JPEG image
- `created_at` - Record creation timestamp
- `updated_at` - Record update timestamp

## Data Validation

### Client-Side (Frontend)
- Name: 2-100 characters
- Email: Valid email format (strict regex)
- Phone: 10+ digits with optional separators
- Photo: PNG, JPG, GIF only, max 5MB

### Server-Side (Backend)
- All validations repeated for security
- File type and size verification
- Database constraints

## Technologies Used

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients and animations
- **Vanilla JavaScript** - No frameworks, pure JS for quick performance
- **Responsive Design** - Mobile-first approach

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL2** - Database driver with promise support
- **Multer** - File upload handling
- **Sharp** - Image processing and optimization
- **CORS** - Cross-Origin Resource Sharing

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### "Failed to fetch students" Error
- Ensure MySQL server is running
- Check credentials in `backend/server.js`
- Verify database `db_schema` exists

### Photo Upload Issues
- Check file size (max 5MB)
- Verify file format (PNG, JPG, GIF)
- Ensure server has write permissions

### Server Won't Start
```bash
# Kill existing process on port 3000
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Then restart:
npm start
```

## Development

### To add new features:
1. Update database schema in `backend/server.js` if needed
2. Add API endpoint in `backend/server.js`
3. Update frontend UI in `frontend/app.js` and `frontend/styles.css`
4. Test thoroughly before deploying

## Future Enhancements

- [ ] Edit student information
- [ ] Delete student functionality
- [ ] Search and filter students
- [ ] Export to PDF/CSV
- [ ] Student rating/review system
- [ ] Admin dashboard
- [ ] Authentication and authorization


---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Author**: Student Card App Team
- Real-time error display
- Color-coded field states
- Clear error messages
- Photo preview before submission

## Notes

- Avatar is generated from uploaded student photo using Sharp
- All avatars are stored in database as BLOB (binary data)
- Maximum file size for upload: 5MB
- Email and phone validation ensures data quality

<img width="1919" height="1034" alt="image" src="https://github.com/user-attachments/assets/e81db77f-3cff-4ca9-bdc5-a7bb604f5e11" />
<img width="1919" height="1032" alt="image" src="https://github.com/user-attachments/assets/46ff8c48-ea31-41f8-a1e8-22995b331628" />
<img width="1917" height="984" alt="image" src="https://github.com/user-attachments/assets/90270e60-3aa6-4131-8668-d3546cc695d6" />
<img width="1910" height="993" alt="image" src="https://github.com/user-attachments/assets/0d4992c3-52ea-441c-a340-e383f994056c" />
<img width="1919" height="997" alt="image" src="https://github.com/user-attachments/assets/e6027274-9c95-4ec7-92e1-f6774b51eb45" />





