const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// @route   POST /api/auth/register & /api/auth/signup
router.post('/register', registerValidation, (req, res) => authController.register(req, res));
router.post('/signup', registerValidation, (req, res) => authController.signup(req, res));

// @route   POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  (req, res) => authController.login(req, res)
);

// @route   POST /api/auth/logout
router.post('/logout', (req, res) => authController.logout(req, res));

// @route   GET /api/auth/me
router.get('/me', protect, (req, res) => authController.me(req, res));

module.exports = router;
