const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const { listAddresses, createAddress, deleteAddress, listContacts, createContact, deleteContact } = require('../controllers/profileController');

router.get('/addresses',      requireAuth, listAddresses);
router.post('/addresses',     requireAuth, createAddress);
router.delete('/addresses/:id', requireAuth, deleteAddress);
router.get('/contacts',       requireAuth, listContacts);
router.post('/contacts',      requireAuth, createContact);
router.delete('/contacts/:id',  requireAuth, deleteContact);

module.exports = router;
