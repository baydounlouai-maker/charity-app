const express = require('express');
const router = express.Router();
const requireRole = require('../middleware/requireRole');
const requireAuth = require('../middleware/auth');
const { listRequests, listMyRequests, getRequest, createRequest, approveRequest, rejectRequest, cancelRequest } = require('../controllers/requestController');

router.get('/',    requireAuth,            listRequests);
router.get('/my',  requireRole('Charity'), listMyRequests);
router.get('/:id', requireAuth,            getRequest);
router.post('/',   requireRole('Charity'), createRequest);
router.put('/:id/approve', requireRole('Admin'),   approveRequest);
router.put('/:id/reject',  requireRole('Admin'),   rejectRequest);
router.put('/:id/cancel',  requireRole('Charity'), cancelRequest);

module.exports = router;
