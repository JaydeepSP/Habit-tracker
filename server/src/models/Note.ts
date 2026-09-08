import mongoose from "mongoose";

const checklistItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, trim: true, default: "" },
    checked: { type: Boolean, default: false },
  },
  { _id: false },
);

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
      default: "",
    },
    content: {
      type: String,
      trim: true,
      maxlength: [50000, "Content cannot exceed 50000 characters"],
      default: "",
    },
    type: {
      type: String,
      enum: ["text", "checklist"],
      default: "text",
    },
    checklist: {
      type: [checklistItemSchema],
      default: [],
    },
    color: {
      type: String,
      enum: [
        "default",
        "red",
        "orange",
        "yellow",
        "green",
        "blue",
        "purple",
        "pink",
      ],
      default: "default",
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= 10,
        message: "Cannot have more than 10 tags",
      },
    },
    habit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habit",
      default: null,
      index: true,
    },
    targetDate: {
      type: String,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Please provide date in YYYY-MM-DD format"],
      default: null,
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

noteSchema.index({ user: 1, isPinned: -1, updatedAt: -1 });
noteSchema.index({ user: 1, isArchived: 1 });
noteSchema.index({ user: 1, habit: 1 });
noteSchema.index({ user: 1, targetDate: 1 });

const Note = mongoose.model("Note", noteSchema);
export default Note;
