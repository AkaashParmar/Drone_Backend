import express from 'express';
import{
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  reverseGeocode,
} from '../controllers/addressController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.get('/reverse', reverseGeocode);

router.use(protect);

router.get('/', getAddresses);
router.post('/', addAddress);
router.put('/:addressId', updateAddress);
router.delete('/:addressId', deleteAddress);
router.patch('/:addressId/set-default', setDefaultAddress);

export default router;
