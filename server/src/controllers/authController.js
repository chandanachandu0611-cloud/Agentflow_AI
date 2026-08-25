const { validationResult } = require('express-validator');
const authService = require('../services/authService');

class AuthController {
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { name, email, password, role } = req.body;
      const result = await authService.register({ name, email, password, role });

      return res.status(201).json({
        success: true,
        user: result.user,
        token: result.token
      });
    } catch (error) {
      const statusCode = error.message.startsWith('USER_EXISTS') ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async signup(req, res) {
    return this.register(req, res);
  }

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      return res.status(200).json({
        success: true,
        user: result.user,
        token: result.token
      });
    } catch (error) {
      const statusCode = error.message.startsWith('INVALID_CREDENTIALS') ? 401 : 500;
      return res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  async logout(req, res) {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  }

  async me(req, res) {
    try {
      return res.status(200).json({
        success: true,
        user: req.user
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();
