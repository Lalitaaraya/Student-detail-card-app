# Quick Start Guide

## Structure Overview

Your project is now organized into three main sections:

```
📁 Student card app
├── 📁 frontend/           (User Interface)
│   ├── index.html        (Main page)
│   ├── app.js            (Logic & Routing)
│   └── styles.css        (Professional styling)
│
├── 📁 backend/           (Server & API)
│   └── server.js         (Express server)
│
├── 📁 database/          (Database Info)
│   └── DATABASE.md       (Schema documentation)
│
└── package.json          (Dependencies)
```

## Quick Commands

### Start the Application
```bash
npm start
```
- Server runs on http://localhost:3000
- Auto-creates database and tables

### Development Mode
```bash
npm run dev
```
- Uses nodemon for auto-restart on file changes

### Stop the Server
```
Press Ctrl+C in terminal
```

## Features Implemented

### ✅ Professional Student Card Design
- Profile photo (rounded rectangle, not circular)
- Student name in large bold text
- Company information
- **Two phone numbers side-by-side in one line** (exactly as in screenshot)
- Clickable email link
- Top accent bar with gradient

### ✅ Buttons Outside Card
- "← Back to List" button (white with border)
- "+ New Registration" button (blue/primary color)
- Positioned above and below card for better UX

### ✅ Clean Professional UI
- Modern color scheme (blues and grays)
- Responsive design for all devices
- Smooth animations and transitions
- No childish elements or emojis in card

### ✅ Organized File Structure
- Frontend files separated from backend
- Database documentation included
- Clear separation of concerns

## File Locations

| Component | Location |
|-----------|----------|
| HTML Page | `frontend/index.html` |
| Frontend Logic | `frontend/app.js` |
| Styling | `frontend/styles.css` |
| Server | `backend/server.js` |
| Database Info | `database/DATABASE.md` |
| Project Config | `package.json` |

## Important Changes Made

1. **Folder Structure**: Reorganized into frontend, backend, and database folders
2. **Card Design**: Updated to professional look matching your screenshot
3. **Phone Display**: Two numbers shown side-by-side in one row
4. **Buttons**: Moved outside card (above it)
5. **Colors**: Changed from purple gradient to clean blue/gray palette
6. **Image Handling**: Profile photos stored as base64 in database

## Next Steps

### To Run the App:
1. Open terminal in project folder
2. Type: `npm start`
3. Open http://localhost:3000 in browser
4. Start using the app!

### To Modify:
- **UI Changes**: Edit `frontend/styles.css`
- **Functionality**: Edit `frontend/app.js`
- **API**: Edit `backend/server.js`
- **Styling Colors**: Look for color codes in `frontend/styles.css`

## Troubleshooting

**Server won't start?**
- Check MySQL is running
- Verify credentials in `backend/server.js`
- Kill existing process: `taskkill /F /IM node.exe`

**Photo not displaying?**
- Check file size (max 5MB)
- Use JPG, PNG, or GIF format
- Check browser console for errors

**Can't connect to database?**
- Ensure MySQL service is running
- Check username/password are correct
- Database will auto-create on first run

## API Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/students` | Get all students |
| GET | `/api/students/:id` | Get one student |
| POST | `/api/students` | Create new student |
| PUT | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student |

---

**Need help?** Check the README.md for detailed documentation!
