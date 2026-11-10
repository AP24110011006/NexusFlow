const store = require('../models/store');

exports.getLogs = (req, res) => {
  const { category, level, search, limit = '100', page = '1' } = req.query;
  let logs = store.find('eventLogs');

  if (category && category !== 'all') {
    logs = logs.filter((l) => l.category === category);
  }

  if (level && level !== 'all') {
    logs = logs.filter((l) => l.level === level);
  }

  if (search) {
    const q = search.toLowerCase();
    logs = logs.filter(
      (l) =>
        l.message.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        (l.category && l.category.toLowerCase().includes(q))
    );
  }

  // Sort newest first
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const total = logs.length;
  const numLimit = parseInt(limit, 10);
  const numPage = parseInt(page, 10);
  const startIndex = (numPage - 1) * numLimit;
  const paginated = logs.slice(startIndex, startIndex + numLimit);

  return res.json({
    total,
    page: numPage,
    totalPages: Math.ceil(total / numLimit),
    logs: paginated,
  });
};

exports.clearLogs = (req, res) => {
  const removed = store.remove('eventLogs', () => true);
  store.insert('eventLogs', {
    category: 'SYSTEM',
    action: 'LOGS_CLEARED',
    message: 'System audit logs cleared by administrator',
    level: 'info',
  });
  return res.json({ success: true, count: removed });
};
