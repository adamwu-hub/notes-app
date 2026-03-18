const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const notesRouter = require('./routes/notes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/notes', notesRouter);

// Serve uploaded attachments
app.use('/attachments', express.static(path.join(__dirname, '../data/attachments')));

// Serve frontend demo
app.use(express.static(path.join(__dirname, 'public')));

// Global error handler
app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR HANDLER:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
