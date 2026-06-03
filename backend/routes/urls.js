const express = require('express');
const router = express.Router();
const { createUrl, getUserUrls, getUrlAnalytics, deleteUrl } = require('../controllers/urlController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.post('/', createUrl);
router.get('/', getUserUrls);
router.get('/:id/analytics', getUrlAnalytics);
router.delete('/:id', deleteUrl);

module.exports = router;
