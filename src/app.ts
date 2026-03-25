import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import cors from 'cors';
import morgan from 'morgan';
import * as path from 'path';
import notesRouter from './routes/notes';
import authRouter from './routes/auth';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'notes-app-secret-123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/notes', notesRouter);

// Serve uploaded attachments
app.use('/attachments', express.static(path.join(__dirname, '../data/attachments')));

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('GLOBAL ERROR HANDLER:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
