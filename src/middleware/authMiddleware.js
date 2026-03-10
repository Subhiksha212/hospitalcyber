// backend/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        error: 'NO_TOKEN',
        message: 'No authentication token provided' 
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'INVALID_FORMAT',
        message: 'Invalid token format. Use Bearer <token>' 
      });
    }

    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'EMPTY_TOKEN',
        message: 'Token is empty' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };
    
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Invalid or malformed token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'TOKEN_EXPIRED',
        message: 'Token has expired' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'AUTH_ERROR',
      message: 'Authentication failed' 
    });
  }
};

module.exports = authMiddleware;