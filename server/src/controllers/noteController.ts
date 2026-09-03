import type { Response } from "express";
import type { AuthRequest } from "../types/index.js";
import Note from "../models/Note.js";
import createHttpError from "http-errors";
import asyncHandler from "../utils/asyncHandler.js";

// @desc  Get all notes for user
// @route GET /api/notes
export const getNotes = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { archived, tag, search, color } = req.query;

  const filter: any = { user: req.user._id };

  if (archived === "true") {
    filter.isArchived = true;
  } else {
    filter.isArchived = false;
  }

  if (tag) filter.tags = tag;
  if (color) filter.color = color;

  if (search && typeof search === "string") {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  const notes = await Note.find(filter).sort({ isPinned: -1, updatedAt: -1 });

  res.json({ success: true, data: notes });
});

// @desc  Get single note
// @route GET /api/notes/:id
export const getNoteById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) throw createHttpError(404, "Note not found");
  res.json({ success: true, data: note });
});

// @desc  Create note
// @route POST /api/notes
export const createNote = asyncHandler(async (req: AuthRequest, res: Response) => {
  const note = await Note.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, data: note });
});

// @desc  Update note
// @route PUT /api/notes/:id
export const updateNote = asyncHandler(async (req: AuthRequest, res: Response) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true },
  );
  if (!note) throw createHttpError(404, "Note not found");
  res.json({ success: true, data: note });
});

// @desc  Delete note
// @route DELETE /api/notes/:id
export const deleteNote = asyncHandler(async (req: AuthRequest, res: Response) => {
  const note = await Note.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!note) throw createHttpError(404, "Note not found");
  res.json({ success: true, message: "Note deleted" });
});

// @desc  Toggle pin
// @route PATCH /api/notes/:id/pin
export const togglePin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) throw createHttpError(404, "Note not found");
  note.isPinned = !note.isPinned;
  await note.save();
  res.json({ success: true, data: note });
});

// @desc  Toggle archive
// @route PATCH /api/notes/:id/archive
export const toggleArchive = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) throw createHttpError(404, "Note not found");
    note.isArchived = !note.isArchived;
    if (note.isArchived) note.isPinned = false;
    await note.save();
    res.json({ success: true, data: note });
  },
);

