const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'school_secret_key';

if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET not set in environment. Using insecure default.');
}

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.redirect('/auth/login');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie('token');
    return res.redirect('/auth/login');
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.redirect('/auth/login?error=Access+denied');
};

const isParent = (req, res, next) => {
  if (req.user && req.user.role === 'parent') return next();
  return res.redirect('/auth/login?error=Access+denied');
};

module.exports = { authenticateToken, isAdmin, isParent, JWT_SECRET };
