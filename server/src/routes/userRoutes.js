import express from 'express';
import { updateProfile, changePassword } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Protect all user routes

router.put('/profile', updateProfile);
router.put('/password', changePassword);

export default router;
