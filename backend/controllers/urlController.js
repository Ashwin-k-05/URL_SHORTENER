const validUrl = require('valid-url');
const { nanoid } = require('nanoid');
const Url = require('../models/Url');

// POST /api/urls — Create short URL
const createUrl = async (req, res) => {
  try {
    const { originalUrl, customAlias } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ message: 'Original URL is required.' });
    }

    // Validate URL
    if (!validUrl.isWebUri(originalUrl)) {
      return res.status(400).json({ message: 'Invalid URL. Please include http:// or https://.' });
    }

    let shortCode = customAlias ? customAlias.trim() : nanoid(7);

    // Validate custom alias
    if (customAlias) {
      if (!/^[a-zA-Z0-9_-]{3,20}$/.test(customAlias.trim())) {
        return res.status(400).json({
          message: 'Custom alias must be 3-20 characters and contain only letters, numbers, hyphens, or underscores.',
        });
      }
      const existing = await Url.findOne({ shortCode });
      if (existing) {
        return res.status(409).json({ message: 'This custom alias is already taken.' });
      }
    } else {
      // Ensure uniqueness for generated codes
      let attempts = 0;
      while (await Url.findOne({ shortCode })) {
        shortCode = nanoid(7);
        if (++attempts > 10) throw new Error('Could not generate unique short code');
      }
    }

    const url = await Url.create({
      originalUrl,
      shortCode,
      customAlias: customAlias || null,
      user: req.user._id,
    });

    res.status(201).json({
      message: 'Short URL created successfully!',
      url,
    });
  } catch (err) {
    console.error('Create URL error:', err);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

// GET /api/urls — Get all URLs for authenticated user
const getUserUrls = async (req, res) => {
  try {
    const urls = await Url.find({ user: req.user._id, isActive: true })
      .sort({ createdAt: -1 })
      .select('-recentVisits');

    // Add total stats
    const totalClicks = urls.reduce((sum, u) => sum + u.clickCount, 0);

    res.json({ urls, totalClicks });
  } catch (err) {
    console.error('Get URLs error:', err);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

// GET /api/urls/:id/analytics — Get analytics for a specific URL
const getUrlAnalytics = async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, user: req.user._id, isActive: true });

    if (!url) {
      return res.status(404).json({ message: 'URL not found.' });
    }

    // Return last 20 recent visits
    const recentVisits = url.recentVisits.slice(-20).reverse();

    res.json({
      url: {
        ...url.toJSON(),
        recentVisits,
      },
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

// DELETE /api/urls/:id — Delete a URL (soft delete)
const deleteUrl = async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, user: req.user._id });

    if (!url) {
      return res.status(404).json({ message: 'URL not found or unauthorized.' });
    }

    url.isActive = false;
    await url.save();

    res.json({ message: 'URL deleted successfully.' });
  } catch (err) {
    console.error('Delete URL error:', err);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

module.exports = { createUrl, getUserUrls, getUrlAnalytics, deleteUrl };
