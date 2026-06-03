const express = require('express');
const router = express.Router();
const { redirectUrl } = require('../controllers/redirectController');

// Short URL redirect — must be placed last so it doesn't conflict with /api/*
router.get('/:shortCode', redirectUrl);

module.exports = router;
