const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const storage = require('../utils/storage');

exports.register = async (req, res) => {
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
    const newUser = {
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

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = await storage.readUsers();
    const user = users.find(u => u.username === username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
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

exports.logout = (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out successfully' });
};

exports.me = (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  res.json({ id: req.session.userId, username: req.session.username });
};

// Middleware to protect routes
exports.isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};
