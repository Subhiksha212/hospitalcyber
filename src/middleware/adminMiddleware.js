// backend/src/middleware/adminMiddleware.js
const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required' 
      });
    }

    if (req.user.role !== 'admin') {
      console.log(`❌ Non-admin user attempted admin access: ${req.user.email}`);
      return res.status(403).json({ 
        success: false,
        error: 'FORBIDDEN',
        message: 'Access denied. Admin privileges required.'
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ 
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to verify admin privileges' 
    });
  }
};

module.exports = adminMiddleware;