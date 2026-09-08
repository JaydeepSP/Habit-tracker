import express from "express";
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  togglePin,
  toggleArchive,
  bulkDeleteNotes,
  bulkArchiveNotes,
  bulkColorNotes,
} from "../controllers/noteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/bulk/delete", bulkDeleteNotes);
router.post("/bulk/archive", bulkArchiveNotes);
router.post("/bulk/color", bulkColorNotes);

router.route("/").get(getNotes).post(createNote);
router.route("/:id").get(getNoteById).put(updateNote).delete(deleteNote);
router.patch("/:id/pin", togglePin);
router.patch("/:id/archive", toggleArchive);

export default router;
