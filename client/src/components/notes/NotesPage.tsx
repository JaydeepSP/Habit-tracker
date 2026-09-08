import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Pin,
  PinOff,
  Archive,
  ArchiveRestore,
  Trash2,
  CheckSquare,
  FileText,
  Tag,
  X,
  Check,
  Palette,
  MoreVertical,
  StickyNote,
} from "lucide-react";
import { noteService } from "@/services/noteService";
import { useToast } from "@/context/ToastContext";
import { DynamicIcon } from "@/utils/constants";
import { useHabits } from "@/hooks";
import { Habit } from "@/types";

type NoteColor =
  | "default"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink";

type NoteType = "text" | "checklist";

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface Note {
  _id: string;
  title: string;
  content: string;
  type: NoteType;
  checklist: ChecklistItem[];
  color: NoteColor;
  tags: string[];
  habit?: Habit | string | null;
  targetDate?: string | null;
  isPinned: boolean;
  isArchived: boolean;
  updatedAt: string;
  createdAt: string;
}

const NOTE_COLORS: {
  key: NoteColor;
  bg: string;
  border: string;
  dot: string;
}[] = [
  {
    key: "default",
    bg: "bg-white dark:bg-[#1a1a1a]",
    border: "border-slate-200 dark:border-neutral-800",
    dot: "bg-neutral-400",
  },
  {
    key: "red",
    bg: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-200 dark:border-red-900",
    dot: "bg-red-500",
  },
  {
    key: "orange",
    bg: "bg-orange-50 dark:bg-orange-950/40",
    border: "border-orange-200 dark:border-orange-900",
    dot: "bg-orange-500",
  },
  {
    key: "yellow",
    bg: "bg-yellow-50 dark:bg-yellow-950/40",
    border: "border-yellow-200 dark:border-yellow-900",
    dot: "bg-yellow-500",
  },
  {
    key: "green",
    bg: "bg-green-50 dark:bg-green-950/40",
    border: "border-green-200 dark:border-green-900",
    dot: "bg-green-500",
  },
  {
    key: "blue",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-200 dark:border-blue-900",
    dot: "bg-blue-500",
  },
  {
    key: "purple",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-200 dark:border-purple-900",
    dot: "bg-purple-500",
  },
  {
    key: "pink",
    bg: "bg-pink-50 dark:bg-pink-950/40",
    border: "border-pink-200 dark:border-pink-900",
    dot: "bg-pink-500",
  },
];

const getCC = (c: NoteColor) =>
  NOTE_COLORS.find((x) => x.key === c) || NOTE_COLORS[0];

const generateSafeId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const ChecklistEditor: React.FC<{
  items: ChecklistItem[];
  onChange: (i: ChecklistItem[]) => void;
  readOnly?: boolean;
}> = ({ items, onChange, readOnly }) => {
  const addItem = () =>
    onChange([...items, { id: generateSafeId(), text: "", checked: false }]);

  const updateItem = (id: string, patch: Partial<ChecklistItem>) =>
    onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const removeItem = (id: string) =>
    onChange(items.filter((i) => i.id !== id));

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
    if (e.key === "Backspace") {
      const item = items.find((i) => i.id === id);
      if (item && item.text === "" && items.length > 1) {
        e.preventDefault();
        removeItem(id);
      }
    }
  };

  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);

  return (
    <div className="space-y-1">
      {unchecked.map((item) => (
        <div key={item.id} className="flex items-center gap-2 group">
          <button
            type="button"
            onClick={() => !readOnly && updateItem(item.id, { checked: true })}
            className="w-4 h-4 rounded border-2 border-slate-300 dark:border-neutral-600 flex items-center justify-center shrink-0 hover:border-slate-900 dark:hover:border-white transition-colors"
          />
          {readOnly ? (
            <span className="text-sm text-slate-800 dark:text-neutral-200 flex-1">
              {item.text || "Empty item"}
            </span>
          ) : (
            <input
              type="text"
              value={item.text}
              onChange={(e) => updateItem(item.id, { text: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
              placeholder="List item..."
              className="flex-1 text-sm bg-transparent text-slate-800 dark:text-neutral-200 placeholder:text-slate-400 dark:placeholder:text-neutral-600 outline-none border-b border-transparent focus:border-slate-200 dark:focus:border-neutral-700 py-0.5"
            />
          )}
          {!readOnly && (
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
      {!readOnly && (
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-2 text-xs text-slate-400 dark:text-neutral-600 hover:text-slate-700 dark:hover:text-neutral-300 transition-colors py-1"
        >
          <Plus className="w-3 h-3" />
          Add item
        </button>
      )}
      {checked.length > 0 && (
        <div className="pt-2 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-neutral-600">
            Completed ({checked.length})
          </p>
          {checked.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 group opacity-60"
            >
              <button
                type="button"
                onClick={() =>
                  !readOnly && updateItem(item.id, { checked: false })
                }
                className="w-4 h-4 rounded border-2 border-slate-400 dark:border-neutral-500 bg-slate-400 dark:bg-neutral-500 flex items-center justify-center shrink-0"
              >
                <Check className="w-2.5 h-2.5 text-white" />
              </button>
              <span className="flex-1 text-sm line-through text-slate-500 dark:text-neutral-500">
                {item.text}
              </span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface NoteCardProps {
  note: Note;
  onClick: () => void;
  onPin: () => void;
  onArchive: () => void;
  onDelete: () => void;
  isSelected?: boolean;
  onToggleSelect?: (e: React.MouseEvent) => void;
  selectionMode?: boolean;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onClick,
  onPin,
  onArchive,
  onDelete,
  isSelected,
  onToggleSelect,
  selectionMode,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const cc = getCC(note.color);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const progress =
    note.type === "checklist" && note.checklist?.length > 0
      ? Math.round(
          (note.checklist.filter((i) => i.checked).length /
            note.checklist.length) *
            100,
        )
      : null;

  const linkedHabit =
    typeof note.habit === "object" && note.habit !== null
      ? (note.habit as Habit)
      : null;

  const isMissedHabit =
    note.tags?.includes("missed-habit") ||
    (linkedHabit && note.color === "red");
  const isHabitNote = !!linkedHabit;
  const isReminderNote = !linkedHabit && !!note.targetDate;
  const isTodoNote =
    note.type === "checklist" && !linkedHabit && !note.targetDate;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      onClick={onClick}
      className={`relative group rounded-xl border p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${cc.bg} ${
        isSelected
          ? "ring-2 ring-blue-500 dark:ring-blue-400 border-blue-400 shadow-md"
          : cc.border
      }`}
    >
      {/* Top Left Selection Checkbox */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect?.(e);
        }}
        className={`absolute top-3 left-3 z-10 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
          isSelected
            ? "bg-blue-600 text-white shadow-sm scale-100 opacity-100"
            : selectionMode
              ? "bg-white/80 dark:bg-neutral-800/80 border border-slate-300 dark:border-neutral-600 opacity-100 hover:border-blue-500"
              : "bg-white/80 dark:bg-neutral-800/80 border border-slate-300 dark:border-neutral-600 opacity-0 group-hover:opacity-100 hover:border-blue-500 hover:scale-105"
        }`}
        title={isSelected ? "Deselect note" : "Select note"}
      >
        {isSelected ? (
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        ) : (
          <div className="w-2 h-2 rounded-sm bg-transparent group-hover:bg-slate-300 dark:group-hover:bg-neutral-600" />
        )}
      </div>

      {note.isPinned && (
        <div className="absolute top-3 right-3">
          <Pin className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 fill-current" />
        </div>
      )}

      {/* Note Type & Linked Badges */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2.5 pl-6 pr-6">
        {isHabitNote ? (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${
              isMissedHabit
                ? "bg-red-100 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300"
                : "border"
            }`}
            style={
              !isMissedHabit
                ? {
                    backgroundColor: `${linkedHabit.color || "#3B82F6"}18`,
                    borderColor: `${linkedHabit.color || "#3B82F6"}40`,
                    color: linkedHabit.color || "#3B82F6",
                  }
                : undefined
            }
          >
            <DynamicIcon
              name={linkedHabit.icon || "Activity"}
              className="w-3 h-3"
            />
            <span className="truncate max-w-[130px]">
              {isMissedHabit ? `Missed: ${linkedHabit.name}` : linkedHabit.name}
            </span>
          </span>
        ) : isReminderNote ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            🔔 Calendar Reminder
          </span>
        ) : isTodoNote ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
            ☑ To-Do Checklist
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 border border-slate-200 dark:border-neutral-700">
            📝 Standard Note
          </span>
        )}

        {note.targetDate && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700">
            📅 {note.targetDate}
          </span>
        )}
      </div>

      {note.title && (
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1.5 pr-6 leading-tight line-clamp-2">
          {note.title}
        </h3>
      )}
      {note.type === "text" && note.content && (
        <p className="text-xs text-slate-600 dark:text-neutral-400 line-clamp-4 leading-relaxed whitespace-pre-wrap">
          {note.content}
        </p>
      )}
      {note.type === "checklist" && note.checklist?.length > 0 && (
        <div className="space-y-1.5">
          {note.checklist.slice(0, 4).map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <div
                className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                  item.checked
                    ? "bg-slate-400 dark:bg-neutral-500 border-slate-400 dark:border-neutral-500"
                    : "border-slate-300 dark:border-neutral-600"
                }`}
              >
                {item.checked && <Check className="w-2 h-2 text-white" />}
              </div>
              <span
                className={`text-xs leading-snug ${
                  item.checked
                    ? "line-through text-slate-400 dark:text-neutral-600"
                    : "text-slate-700 dark:text-neutral-300"
                }`}
              >
                {item.text || "Empty item"}
              </span>
            </div>
          ))}
          {note.checklist.length > 4 && (
            <p className="text-[10px] text-slate-400 dark:text-neutral-600 pl-5">
              +{note.checklist.length - 4} more
            </p>
          )}
          {progress !== null && (
            <div className="pt-1">
              <div className="h-1 rounded-full bg-slate-200 dark:bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-slate-900 dark:bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
      {note.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5">
          {note.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 border border-slate-200 dark:border-neutral-700"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-neutral-800">
        <span className="text-[10px] text-slate-400 dark:text-neutral-600">
          {note.updatedAt
            ? new Date(note.updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : ""}
        </span>
        <div
          ref={menuRef}
          className="relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-700 text-slate-400 dark:text-neutral-500 transition-all"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 bottom-full mb-1 w-40 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-neutral-700 rounded-xl shadow-xl z-50 py-1 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => {
                    onPin();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  {note.isPinned ? (
                    <PinOff className="w-3.5 h-3.5" />
                  ) : (
                    <Pin className="w-3.5 h-3.5" />
                  )}
                  {note.isPinned ? "Unpin" : "Pin to top"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onArchive();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  {note.isArchived ? (
                    <ArchiveRestore className="w-3.5 h-3.5" />
                  ) : (
                    <Archive className="w-3.5 h-3.5" />
                  )}
                  {note.isArchived ? "Unarchive" : "Archive"}
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-neutral-800" />
                <button
                  type="button"
                  onClick={() => {
                    onDelete();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const NoteEditor: React.FC<{
  note: Partial<Note> | null;
  onClose: () => void;
  onSave: (d: Partial<Note>) => Promise<void>;
  availableHabits: Habit[];
}> = ({ note, onClose, onSave, availableHabits }) => {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [type, setType] = useState<NoteType>(note?.type || "text");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    note?.checklist || [],
  );
  const [color, setColor] = useState<NoteColor>(note?.color || "default");
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [habitId, setHabitId] = useState<string>(
    typeof note?.habit === "object" && note?.habit !== null
      ? (note.habit as Habit)._id
      : (note?.habit as string) || "",
  );
  const [targetDate, setTargetDate] = useState<string>(note?.targetDate || "");
  const [saving, setSaving] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const cc = getCC(color);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !tags.includes(t) && tags.length < 10) setTags([...tags, t]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        title,
        content,
        type,
        checklist,
        color,
        tags,
        habit: habitId || null,
        targetDate: targetDate || null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const isEmpty =
    !title.trim() &&
    (type === "text" ? !content.trim() : checklist.length === 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[88vh] ${cc.bg} ${cc.border}`}
      >
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            autoFocus
            className="flex-1 text-base font-bold bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Linked Habit & Reminder Date selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-4 pb-2.5">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
              Connect Habit (Optional)
            </label>
            <select
              value={habitId}
              onChange={(e) => setHabitId(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-neutral-600"
            >
              <option value="">No linked habit</option>
              {availableHabits.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name} ({h.category})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
              Reminder / Target Date
            </label>
            <input
              type="date"
              value={targetDate ? targetDate.substring(0, 10) : ""}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-neutral-600"
            />
          </div>
        </div>

        {/* Note Type switcher tabs */}
        <div className="flex items-center gap-1 px-4 pb-2 border-b border-slate-100 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setType("text")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              type === "text"
                ? "bg-slate-900 dark:bg-white text-white dark:text-black"
                : "text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-neutral-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Note
          </button>
          <button
            type="button"
            onClick={() => setType("checklist")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              type === "checklist"
                ? "bg-slate-900 dark:bg-white text-white dark:text-black"
                : "text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-neutral-200"
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Checklist
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 min-h-[160px]">
          {type === "text" ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Take a note..."
              rows={6}
              className="w-full bg-transparent text-sm text-slate-800 dark:text-neutral-200 placeholder:text-slate-400 dark:placeholder:text-neutral-600 outline-none resize-none leading-relaxed"
            />
          ) : (
            <ChecklistEditor items={checklist} onChange={setChecklist} />
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-slate-100 dark:border-neutral-800 flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add tag and press Enter..."
            className="flex-1 text-xs bg-transparent text-slate-700 dark:text-neutral-300 placeholder:text-slate-400 dark:placeholder:text-neutral-600 outline-none"
          />
          {tagInput && (
            <button
              type="button"
              onClick={addTag}
              className="text-xs font-semibold text-blue-500 hover:text-blue-600"
            >
              Add
            </button>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-1.5 rounded-lg text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
              title="Change color"
            >
              <Palette className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {showColorPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 4 }}
                  className="absolute left-0 sm:left-1/2 sm:-translate-x-1/2 bottom-full mb-2 p-2 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-neutral-700 rounded-2xl shadow-xl flex gap-1.5 z-50"
                >
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => {
                        setColor(c.key);
                        setShowColorPicker(false);
                      }}
                      className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${c.dot} ${
                        color === c.key
                          ? "border-slate-900 dark:border-white scale-110"
                          : "border-transparent"
                      }`}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isEmpty || saving}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving..." : note?._id ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const NotesPage: React.FC = () => {
  const { habits } = useHabits();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedHabitFilter, setSelectedHabitFilter] = useState<string>("");
  const [categoryTab, setCategoryTab] = useState<
    "all" | "habits" | "reminders" | "todos"
  >("all");
  const [activeTag, setActiveTag] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorNote, setEditorNote] = useState<Partial<Note> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);

  // Multi-selection state
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [bulkColorPickerOpen, setBulkColorPickerOpen] = useState(false);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const { success, error: toastError } = useToast();

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await noteService.getNotes({
        archived: showArchived,
        tag: activeTag || undefined,
        habit: selectedHabitFilter || undefined,
        search: search || undefined,
      });
      setNotes(res.data);
    } catch {
      toastError("Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  }, [showArchived, activeTag, selectedHabitFilter, search, toastError]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Clear selections when changing tabs or archived view
  useEffect(() => {
    setSelectedNoteIds([]);
    setBulkColorPickerOpen(false);
    setBulkDeleteConfirmOpen(false);
  }, [showArchived, categoryTab, activeTag, selectedHabitFilter]);

  const openCreate = () => {
    setEditorNote(null);
    setEditorOpen(true);
  };

  const openEdit = (note: Note) => {
    setEditorNote(note);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditorNote(null);
  };

  const handleSave = async (data: Partial<Note>) => {
    if (editorNote?._id) {
      const res = await noteService.updateNote(editorNote._id, data);
      setNotes((prev) =>
        prev.map((n) => (n._id === editorNote._id ? res.data : n)),
      );
      success("Note updated");
    } else {
      const res = await noteService.createNote(data);
      setNotes((prev) => [res.data, ...prev]);
      success("Note created");
    }
  };

  const handlePin = async (note: Note) => {
    const res = await noteService.togglePin(note._id);
    setNotes((prev) => prev.map((n) => (n._id === note._id ? res.data : n)));
  };

  const handleArchive = async (note: Note) => {
    await noteService.toggleArchive(note._id);
    setNotes((prev) => prev.filter((n) => n._id !== note._id));
    setSelectedNoteIds((prev) => prev.filter((id) => id !== note._id));
    success(note.isArchived ? "Note restored" : "Note archived");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await noteService.deleteNote(deleteTarget._id);
    setNotes((prev) => prev.filter((n) => n._id !== deleteTarget._id));
    setSelectedNoteIds((prev) => prev.filter((id) => id !== deleteTarget._id));
    setDeleteTarget(null);
    success("Note deleted");
  };

  // Filter notes by category tab
  const displayedNotes = notes.filter((n) => {
    const hasHabit = !!n.habit;
    const hasDateReminder = !n.habit && !!n.targetDate;
    const isTodo = n.type === "checklist" && !n.habit && !n.targetDate;

    if (categoryTab === "habits") return hasHabit;
    if (categoryTab === "reminders") return hasDateReminder;
    if (categoryTab === "todos") return isTodo;
    return true;
  });

  // Multi-selection handlers
  const toggleSelectNote = (id: string) => {
    setSelectedNoteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedNoteIds.length === displayedNotes.length) {
      setSelectedNoteIds([]);
    } else {
      setSelectedNoteIds(displayedNotes.map((n) => n._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNoteIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      await noteService.bulkDelete(selectedNoteIds);
      setNotes((prev) => prev.filter((n) => !selectedNoteIds.includes(n._id)));
      success(`Deleted ${selectedNoteIds.length} notes`);
      setSelectedNoteIds([]);
      setBulkDeleteConfirmOpen(false);
    } catch {
      toastError("Failed to delete selected notes");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkArchive = async (archiveState: boolean) => {
    if (selectedNoteIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      await noteService.bulkArchive(selectedNoteIds, archiveState);
      setNotes((prev) => prev.filter((n) => !selectedNoteIds.includes(n._id)));
      success(
        `${archiveState ? "Archived" : "Restored"} ${selectedNoteIds.length} notes`,
      );
      setSelectedNoteIds([]);
    } catch {
      toastError("Failed to update archive status");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkColor = async (color: NoteColor) => {
    if (selectedNoteIds.length === 0) return;
    setBulkActionLoading(true);
    try {
      await noteService.bulkColor(selectedNoteIds, color);
      setNotes((prev) =>
        prev.map((n) =>
          selectedNoteIds.includes(n._id) ? { ...n, color } : n,
        ),
      );
      success(`Updated color for ${selectedNoteIds.length} notes`);
      setBulkColorPickerOpen(false);
    } catch {
      toastError("Failed to update notes color");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const allTags = Array.from(
    new Set(displayedNotes.flatMap((n) => n.tags || [])),
  ).slice(0, 20);
  const pinned = displayedNotes.filter((n) => n.isPinned);
  const unpinned = displayedNotes.filter((n) => !n.isPinned);

  const isAllSelected =
    displayedNotes.length > 0 &&
    selectedNoteIds.length === displayedNotes.length;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Notes & Habit Logs
          </h2>
          <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">
            {displayedNotes.length}{" "}
            {displayedNotes.length === 1 ? "note" : "notes"}
            {showArchived ? " archived" : ""} • Keep track of habit reasons, daily logs, and date reminders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setShowArchived(!showArchived);
              setActiveTag("");
              setSelectedHabitFilter("");
              setCategoryTab("all");
              setSearch("");
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              showArchived
                ? "bg-slate-900 dark:bg-white text-white dark:text-black border-transparent"
                : "bg-white dark:bg-neutral-900 text-slate-600 dark:text-neutral-400 border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800"
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            Archive
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-neutral-200 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        </div>
      </div>

      {/* Category Tabs & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 rounded-2xl bg-slate-100 dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Notes" },
            { id: "habits", label: "🎯 Habit Logs & Reasons" },
            { id: "reminders", label: "🔔 Calendar Reminders" },
            { id: "todos", label: "☑ To-Do Checklists" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategoryTab(tab.id as any)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                categoryTab === tab.id
                  ? "bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {displayedNotes.length > 0 && (
          <button
            type="button"
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800 transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            {isAllSelected ? "Deselect All" : "Select All"}
          </button>
        )}
      </div>

      {/* Search & Habit Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-neutral-600 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes by title, content, or tag..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#121212] border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-neutral-700"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div>
          <select
            value={selectedHabitFilter}
            onChange={(e) => setSelectedHabitFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-[#121212] border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-neutral-700"
          >
            <option value="">All Habit Logs & General Notes</option>
            {habits.map((h) => (
              <option key={h._id} value={h._id}>
                Habit: {h.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {["", ...allTags].map((tag) => (
            <button
              type="button"
              key={tag || "__all"}
              onClick={() => setActiveTag(activeTag === tag ? "" : tag)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                activeTag === tag
                  ? "bg-slate-900 dark:bg-white text-white dark:text-black border-transparent"
                  : "bg-white dark:bg-neutral-900 text-slate-600 dark:text-neutral-400 border-slate-200 dark:border-neutral-800 hover:border-slate-400 dark:hover:border-neutral-600"
              }`}
            >
              {tag ? `#${tag}` : "All"}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="break-inside-avoid rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-neutral-800 p-4 animate-pulse"
              style={{ height: `${120 + (i % 3) * 40}px` }}
            />
          ))}
        </div>
      )}

      {!loading && notes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-neutral-900 flex items-center justify-center">
            <StickyNote className="w-10 h-10 text-slate-300 dark:text-neutral-700" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              {search
                ? "No notes found"
                : showArchived
                  ? "No archived notes"
                  : "No notes yet"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-neutral-500">
              {search
                ? `No results for "${search}"`
                : showArchived
                  ? "Archived notes appear here"
                  : "Create your first note to get started"}
            </p>
          </div>
          {!search && !showArchived && (
            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-neutral-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create your first note
            </button>
          )}
        </div>
      )}

      {!loading && notes.length > 0 && (
        <div className="space-y-6">
          {pinned.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-neutral-600 mb-3 flex items-center gap-1.5">
                <Pin className="w-3 h-3" />
                Pinned
              </p>
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
                <AnimatePresence>
                  {pinned.map((note) => (
                    <div key={note._id} className="break-inside-avoid mb-4">
                      <NoteCard
                        note={note}
                        isSelected={selectedNoteIds.includes(note._id)}
                        selectionMode={selectedNoteIds.length > 0}
                        onToggleSelect={() => toggleSelectNote(note._id)}
                        onClick={() => openEdit(note)}
                        onPin={() => handlePin(note)}
                        onArchive={() => handleArchive(note)}
                        onDelete={() => setDeleteTarget(note)}
                      />
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {unpinned.length > 0 && (
            <div>
              {pinned.length > 0 && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-neutral-600 mb-3">
                  Others
                </p>
              )}
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
                <AnimatePresence>
                  {unpinned.map((note) => (
                    <div key={note._id} className="break-inside-avoid mb-4">
                      <NoteCard
                        note={note}
                        isSelected={selectedNoteIds.includes(note._id)}
                        selectionMode={selectedNoteIds.length > 0}
                        onToggleSelect={() => toggleSelectNote(note._id)}
                        onClick={() => openEdit(note)}
                        onPin={() => handlePin(note)}
                        onArchive={() => handleArchive(note)}
                        onDelete={() => setDeleteTarget(note)}
                      />
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Bulk Actions Toolbar */}
      <AnimatePresence>
        {selectedNoteIds.length > 0 && (
          <div className="fixed bottom-6 inset-x-0 lg:left-64 flex justify-center items-center pointer-events-none z-50 px-4">
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 28, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
              className="relative pointer-events-auto flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-white/95 dark:bg-[#151517]/95 backdrop-blur-2xl text-slate-800 dark:text-neutral-100 rounded-full shadow-[0_16px_36px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.06)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.08)] border border-slate-200/90 dark:border-neutral-800/90"
            >
              {/* Centered Color Palette Popover above toolbar */}
              <AnimatePresence>
                {bulkColorPickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-2 bg-white dark:bg-[#1a1a1d] border border-slate-200 dark:border-neutral-750 rounded-2xl shadow-2xl flex items-center justify-center gap-1.5 z-50 backdrop-blur-xl"
                  >
                    {NOTE_COLORS.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => handleBulkColor(c.key)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-125 ${c.dot} border-transparent hover:border-slate-400 dark:hover:border-neutral-300 shadow-sm`}
                        title={c.key}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selected Count & Clear */}
              <div className="flex items-center gap-2 pl-1 pr-2.5">
                <span className="flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-sm">
                  {selectedNoteIds.length}
                </span>
                <span className="text-xs font-medium text-slate-600 dark:text-neutral-300 hidden sm:inline">
                  selected
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedNoteIds([]);
                    setBulkColorPickerOpen(false);
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Clear selection"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="h-4 w-px bg-slate-200 dark:bg-neutral-800" />

              {/* Color Button */}
              <button
                type="button"
                onClick={() => setBulkColorPickerOpen(!bulkColorPickerOpen)}
                disabled={bulkActionLoading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  bulkColorPickerOpen
                    ? "bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-white font-semibold"
                    : "text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800/80 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Color</span>
              </button>

              {/* Archive / Restore Button */}
              <button
                type="button"
                onClick={() => {
                  setBulkColorPickerOpen(false);
                  handleBulkArchive(!showArchived);
                }}
                disabled={bulkActionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800/80 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {showArchived ? (
                  <>
                    <ArchiveRestore className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </>
                ) : (
                  <>
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archive</span>
                  </>
                )}
              </button>

              <div className="h-4 w-px bg-slate-200 dark:bg-neutral-800" />

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => {
                  setBulkColorPickerOpen(false);
                  setBulkDeleteConfirmOpen(true);
                }}
                disabled={bulkActionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                title="Delete selected"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Delete Confirmation Dialog */}
      <AnimatePresence>
        {bulkDeleteConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete {selectedNoteIds.length} Notes?
                </h3>
                <p className="text-sm text-slate-500 dark:text-neutral-400">
                  The selected {selectedNoteIds.length} notes will be permanently deleted. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setBulkDeleteConfirmOpen(false)}
                  disabled={bulkActionLoading}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={bulkActionLoading}
                  className="flex-1 py-2 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  {bulkActionLoading ? "Deleting..." : "Delete All"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editorOpen && (
          <NoteEditor
            note={editorNote}
            onClose={closeEditor}
            onSave={handleSave}
            availableHabits={habits}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete Note?
                </h3>
                <p className="text-sm text-slate-500 dark:text-neutral-400">
                  "{deleteTarget.title || "Untitled"}" will be permanently
                  deleted.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 py-2 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotesPage;
