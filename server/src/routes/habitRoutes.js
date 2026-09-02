import express from 'express';
import {
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabitActive,
  toggleHabitCompletion,
  createRecommendedHabits,
} from '../controllers/habitController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Protect all habit routes

router.route('/')
  .get(getHabits)
  .post(createHabit);

router.post('/batch', createRecommendedHabits);

router.route('/:id')
  .get(getHabitById)
  .put(updateHabit)
  .delete(deleteHabit);

router.patch('/:id/toggle-active', toggleHabitActive);
router.post('/:id/toggle', toggleHabitCompletion);

export default router;
