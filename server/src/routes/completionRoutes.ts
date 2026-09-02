import express from 'express';
import {
  getCompletions,
  getCompletionsByDate,
  createCompletion,
  updateCompletion,
  deleteCompletion,
} from '../controllers/completionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All completion routes are private

router.route('/')
  .get(getCompletions)
  .post(createCompletion);

router.get('/date/:date', getCompletionsByDate);

router.route('/:id')
  .patch(updateCompletion)
  .delete(deleteCompletion);

export default router;
