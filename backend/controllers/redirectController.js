const Url = require('../models/Url');

// GET /:shortCode — Redirect to original URL and track visit
const redirectUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode, isActive: true });

    if (!url) {
      // Redirect to frontend with error page
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/not-found`);
    }

    // Track analytics
    const visitData = {
      ip: req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      referrer: req.headers['referer'] || 'direct',
      visitedAt: new Date(),
    };

    // Keep only last 100 visits
    if (url.recentVisits.length >= 100) {
      url.recentVisits.shift();
    }
    url.recentVisits.push(visitData);
    url.clickCount += 1;
    url.lastVisited = new Date();

    await url.save();

    return res.redirect(301, url.originalUrl);
  } catch (err) {
    console.error('Redirect error:', err);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/not-found`);
  }
};

module.exports = { redirectUrl };
