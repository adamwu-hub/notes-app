# Project Mandates: Notes App

This file contains foundational instructions for Gemini CLI when working on this project. These mandates take precedence over general defaults.

## 1. Architectural Principles
- **Backend**: Always use Node.js and Express.
- **Storage**: Use local JSON file storage (`data/notes.json`) for data persistence. Do not migrate to a database unless explicitly directed.
- **File Handling**: Store image attachments in `data/attachments/` using Multer.
- **Frontend**: Use Vanilla HTML, Vanilla CSS, and Vanilla JavaScript. Avoid adding heavy frameworks (React, Vue, Angular) or utility-first CSS (Tailwind) unless requested.

## 2. State & Persistence Mandates
- **URL Query over LocalStorage**: Always prefer **URL Query Parameters** (`?sort=...&filter=...`) for persisting UI state like sorting, filtering, or view modes. 
- **DO NOT** use `localStorage` or `sessionStorage` for UI state persistence without a specific architectural reason.

## 3. UI/UX Standards
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
