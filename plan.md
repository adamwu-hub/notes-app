# Project Plan: Node.js Express Notes App

## 1. Overview
A simple, robust Node.js Express application for managing notes with integrated image attachment support via pasting.

## 2. Technical Stack
- **Backend**: Node.js, Express
- **Storage**: Local JSON (`data/notes.json`)
- **File Handling**: Multer (storing images in `data/attachments/`)
- **Frontend**: Vanilla HTML/CSS/JS (SPA structure)

## 3. Folder Structure
```text
notes-app/
├── data/
│   ├── notes.json          # JSON storage for note metadata
│   └── attachments/        # Directory for uploaded images
├── src/
│   ├── routes/             # API route definitions
│   ├── controllers/        # CRUD business logic
│   ├── middleware/         # Multer configuration
│   ├── utils/              # File I/O helpers (storage.js)
│   ├── public/             # Frontend assets (index.html, script.js)
│   └── app.js              # Express application entry point
└── package.json
```

## 4. API Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/notes` | Retrieve all notes |
| `GET` | `/api/notes/:id` | Retrieve a single note |
| `POST` | `/api/notes` | Create a new note |
| `PUT` | `/api/notes/:id` | Update an existing note |
| `DELETE` | `/api/notes/:id` | Delete a note and its attachments |
| `POST` | `/api/notes/attachments` | Upload a pasted image (returns metadata) |

## 5. Key Features & Implementation
- **Image Pasting**: Frontend listens for `paste` events in the editor and immediately uploads images as attachments.
- **View Separation**: Distinct "List View" (search/sort) and "Editor View" (create/edit).
- **Persistence**: 
  - Notes saved to a local JSON file.
  - User sort/filter preferences persisted via **URL Query Parameters** (`?sort=asc&filter=term`).
- **Interactive UI**:
  - Image thumbnails with a full-screen **Modal Popup** for previews.
  - **Quick Clear** (X) button for the filter input.
  - Real-time filtering and sorting.

## 6. Execution Phases
1. [x] Project Initialization & Dependency Setup
2. [x] Storage & Upload Middleware Implementation
3. [x] CRUD Controller & API Routing
4. [x] Frontend Development (HTML/CSS/JS)
5. [x] Feature Enhancements (Modal, Search Clear, Persistence)
6. [x] Bug Fixing (BOM issues, Error Logging)
