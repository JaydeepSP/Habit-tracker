import express from 'express';
import {
  getDashboardStats,
  getWeeklyStats,
  getMonthlyStats,
  getHabitStats,
  getCategoryStats,
  getStreakStats,
} from '../controllers/statsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All stats routes are private

router.get('/dashboard', getDashboardStats);
router.get('/weekly', getWeeklyStats);
router.get('/monthly', getMonthlyStats);
router.get('/habits', getHabitStats);
router.get('/categories', getCategoryStats);
router.get('/streaks', getStreakStats);

export default router;
