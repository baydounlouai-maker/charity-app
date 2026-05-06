const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const { listCategories } = require('../controllers/categoryController');

router.get('/', requireAuth, listCategories);

module.exports = router;
