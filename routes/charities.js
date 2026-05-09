const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const { listCharities, getCharity } = require('../controllers/charityController');

router.get('/',    requireAuth, listCharities);
router.get('/:id', requireAuth, getCharity);

module.exports = router;
