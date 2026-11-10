const jwt = require('jsonwebtoken');
const store = require('../models/store');
const config = require('../config/config');

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Find user by email or provide default intern / admin demo user
  let user = store.findOne('users', (u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // If logging in as any name for testing, create profile
    user = store.insert('users', {
      name: email.split('@')[0],
      email,
      role: 'IoT Engineer',
      organization: 'Infotact Solutions',
    });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  store.insert('eventLogs', {
    category: 'AUTH',
    action: 'USER_LOGIN',
    message: `User ${user.name} (${user.email}) logged in successfully`,
    level: 'info',
    metadata: { userId: user.id, email: user.email },
  });

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      organization: user.organization,
      refNo: user.refNo,
      avatar: user.avatar,
    },
  });
};

exports.getMe = (req, res) => {
  return res.json({ user: req.user });
};

exports.updateProfile = (req, res) => {
  const { name, department, phone, avatar } = req.body;
  const updated = store.updateById('users', req.user.id, {
    name: name || req.user.name,
    department: department || req.user.department,
    phone: phone || req.user.phone,
    avatar: avatar || req.user.avatar,
  });

  return res.json({ user: updated });
};
