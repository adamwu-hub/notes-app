# Project Mandates: Notes App

This file contains foundational instructions for Gemini CLI when working on this project. These mandates take precedence over general defaults.
## 1. Architectural Principles
- **Backend**: Always use Node.js and Express (running on port 3001).
- **Frontend**: Always use Next.js (running on port 3000, proxying API and attachments to backend).
- **Storage**: Use local JSON file storage (`data/notes.json` and `data/users.json`).
- **Authentication**: Use `express-session` for session management and `bcryptjs` for password hashing.
- **Authorization**: Implement ownership logic. Users only see their own notes or notes where their ID is in the `sharedWith` array.
- **Modality**: Only owners can update or delete their notes. Shared users have read-only access.
- **File Handling**: Store image attachments in `data/attachments/` using Multer.

## 2. State & Persistence Mandates
- **Sessions**: Use sessions to track the current user. Protect API routes with authentication middleware.
- **URL Query over LocalStorage**: Always prefer **URL Query Parameters** for UI state like sorting or filtering.
...
## 3. UI/UX Standards
- **Auth Flow**: Provide a unified Login/Register view. Redirect to auth if not logged in.
- **Sharing UI**: Allow users to select other registered users to share a note with via a multi-select interface in the editor.
- **Badging**: Clearly label notes as "My Note" or "Shared with me" in the list view.
...
- **Image Handling**: 
  - Support direct `paste` events in text areas for image uploads.
  - Display images as clickable thumbnails that open in a full-screen modal/popup.
- **Filter Inputs**: Always provide a "Clear" (X) button for search or filter inputs to allow one-click resets.
- **View Management**: Use a Single Page Application (SPA) approach, toggling visibility between "List View" and "Editor View".

## 4. Coding & Maintenance Standards
- **JSON Integrity**: Ensure all JSON files are written as valid UTF-8 **without a Byte Order Mark (BOM)** to prevent parsing errors.
- **Logging**: Maintain verbose error logging to `stdout` (using `console.error`) in controllers and global error handlers to facilitate debugging.
- **Error Handling**: Use a centralized error handler in `app.js` and ensure it returns clean JSON error responses to the frontend.
- **Modularity**: Keep a clean separation between Routes, Controllers, and Utility/Storage layers.
