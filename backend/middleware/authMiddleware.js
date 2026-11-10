const jwt = require('jsonwebtoken');
const config = require('../config/config');
const store = require('../models/store');

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For convenience in testing/demos, attach default Manikanth profile if no token
    req.user = store.findOne('users', (u) => u.email === 'manikanth9878@gmail.com') || {
      id: 'usr_manikanth',
      name: 'Koneti Manikanth',
      role: 'Associate L1. Intern',
      email: 'manikanth9878@gmail.com',
    };
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = store.findById('users', decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
