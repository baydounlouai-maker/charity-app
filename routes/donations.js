const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  createDonation,
  listDonationsByRequest,
  listMyDonations,
  approveDonation,
  rejectDonation,
  finalizeDonation,
  cancelDonation,
} = require('../controllers/donationController');

router.post('/',                       requireRole('Donor'),    createDonation);
router.get('/my',                      requireAuth,             listMyDonations);
router.get('/request/:requestId',      requireAuth,             listDonationsByRequest);
router.put('/:id/approve',             requireRole('Charity'),  approveDonation);
router.put('/:id/reject',              requireRole('Charity'),  rejectDonation);
router.put('/:id/finalize',            requireRole('Charity'),  finalizeDonation);
router.put('/:id/cancel',              requireRole('Donor'),    cancelDonation);

module.exports = router;
