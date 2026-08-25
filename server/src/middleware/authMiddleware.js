const authService = require('../services/authService');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.headers.token) {
      token = req.headers.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED: No authentication token provided.'
      });
    }

    const decoded = authService.verifyToken(token);
    const user = await authService.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED: User associated with this token no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: `UNAUTHORIZED: ${error.message || 'Invalid or expired token.'}`
    });
  }
};

module.exports = { protect, requireAuth: protect };
