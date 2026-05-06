const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const { listAddresses, createAddress, listContacts, createContact } = require('../controllers/profileController');

router.get('/addresses',  requireAuth, listAddresses);
router.post('/addresses', requireAuth, createAddress);
router.get('/contacts',   requireAuth, listContacts);
router.post('/contacts',  requireAuth, createContact);

module.exports = router;
