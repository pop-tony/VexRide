const { ensureUser, findUserByEmail, findUserById, findUserByPhone, getDbReady, getMemoryStore } = require('../utils/helpers');
const { User } = require('../models');

const userController = {
  async getOrCreateUser(req, res) {
    try {
      const { userName, userEmail } = req.body;
      const user = await ensureUser(userName, userEmail);
      res.json({ success: true, user });
    } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async signup(req, res) {
    try {
      const { name, email, phone, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email and password are required' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email address' });
      }

      if (String(password).length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      }

      if (phone) {
        const phoneNormalized = String(phone).trim();
        const existingByPhone = await findUserByPhone(phoneNormalized);
        if (existingByPhone) {
          return res.status(409).json({ success: false, message: 'Phone number already in use' });
        }
      }

      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'User already exists' });
      }

      const bcrypt = require('bcryptjs');
      const password_hash = await bcrypt.hash(password, 8);

      if (!getDbReady()) {
        const store = getMemoryStore();
        const newUser = {
          id: store.users.length + 1,
          name,
          email,
          phone: phone || null,
          password_hash,
          rating: 5.0
        };
        store.users.push(newUser);
        const safeUser = { ...newUser };
        delete safeUser.password_hash;
        return res.json({ success: true, user: safeUser, message: 'Account created' });
      }

      const user = await User.create({ name, email, phone: phone || null, password_hash, rating: 5.0 });
      const safeUser = { ...user.toJSON() };
      delete safeUser.password_hash;
      res.json({ success: true, user: safeUser, message: 'Account created' });
    } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email address' });
      }

      const user = await findUserByEmail(email);
      if (!user) {
        return res.status(404).json({ success: false, message: 'No account found for this email' });
      }

      const bcrypt = require('bcryptjs');
      const match = await bcrypt.compare(password, user.password_hash || '');
      if (!match) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const safeUser = user.toJSON ? { ...user.toJSON() } : { ...user };
      delete safeUser.password_hash;

      res.json({ success: true, user: safeUser, message: 'Logged in' });
    } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async logout(req, res) {
    try {
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getUserById(req, res) {
    try {
      const { userId } = req.params;
      const user = await findUserById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, user });
    } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = userController;
