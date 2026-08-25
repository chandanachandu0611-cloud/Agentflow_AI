const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { inMemoryStore } = require('../config/db');
const User = require('../models/User');

class AuthService {
  async register({ name, email, password, role }) {
    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      throw new Error('USER_EXISTS: An account with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userData = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'operator',
      lastLogin: new Date()
    };

    let user;
    if (!inMemoryStore.isInMemory) {
      user = await User.create(userData);
      user = user.toObject();
      delete user.password;
    } else {
      const id = `user_${Date.now()}`;
      user = { _id: id, id, ...userData };
      inMemoryStore.users.set(email.toLowerCase(), user);
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  async login({ email, password }) {
    const userWithPassword = await this.findUserByEmail(email, true);
    if (!userWithPassword) {
      throw new Error('INVALID_CREDENTIALS: Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, userWithPassword.password);
    if (!isMatch) {
      throw new Error('INVALID_CREDENTIALS: Invalid email or password.');
    }

    const user = { ...userWithPassword };
    delete user.password;

    const token = this.generateToken(user);
    return { user, token };
  }

  async findUserByEmail(email, includePassword = false) {
    if (!inMemoryStore.isInMemory) {
      const query = User.findOne({ email: email.toLowerCase() });
      if (includePassword) query.select('+password');
      const doc = await query.exec();
      return doc ? doc.toObject() : null;
    }
    return inMemoryStore.users.get(email.toLowerCase()) || null;
  }

  async findUserById(id) {
    if (!inMemoryStore.isInMemory) {
      return await User.findById(id).select('-password').lean();
    }
    for (const u of inMemoryStore.users.values()) {
      if (String(u._id) === String(id) || String(u.id) === String(id)) {
        const c = { ...u };
        delete c.password;
        return c;
      }
    }
    return null;
  }

  generateToken(user) {
    return jwt.sign(
      { id: user._id || user.id, email: user.email, role: user.role },
      env.jwtSecret,
      { expiresIn: '7d' }
    );
  }

  verifyToken(token) {
    return jwt.verify(token, env.jwtSecret);
  }
}

module.exports = new AuthService();
