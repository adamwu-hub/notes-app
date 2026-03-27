import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import * as storage from '../utils/storage.js';

declare module 'express-session' {
  interface SessionData {
    userId: string;
    username: string;
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    console.log('Registering user:', username);
    if (!username || !password) {
      console.warn('Registration failed: Username or password missing');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const users = await storage.readUsers();
    if (users.find(u => u.username === username)) {
      console.warn('Registration failed: Username already exists', username);
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: storage.User = {
      id: uuidv4(),
      username,
      password: hashedPassword
    };

    users.push(newUser);
    await storage.writeUsers(users);
    console.log('User registered successfully:', username);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const users = await storage.readUsers();
    const user = users.find(u => u.username === username);

    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Initialize session
    req.session.userId = user.id;
    req.session.username = user.username;

    res.json({ id: user.id, username: user.username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
       console.error('Error destroying session:', err);
       return res.status(500).json({ message: 'Could not log out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
};

export const me = (req: Request, res: Response) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  res.json({ id: req.session.userId, username: req.session.username });
};

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};
