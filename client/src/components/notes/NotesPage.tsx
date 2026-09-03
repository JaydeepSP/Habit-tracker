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

const NoteCard: React.FC<{
  note: Note;
  onClick: () => void;
  onPin: () => void;
  onArchive: () => void;
  onDelete: () => void;
}> = ({ note, onClick, onPin, onArchive, onDelete }) => {
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      onClick={onClick}
      className={`relative group rounded-xl border p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${cc.bg} ${cc.border}`}
    >
      {note.isPinned && (
        <div className="absolute top-3 right-3">
          <Pin className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 fill-current" />
        </div>
      )}
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
}> = ({ note, onClose, onSave }) => {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [type, setType] = useState<NoteType>(note?.type || "text");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    note?.checklist || [],
  );
  const [color, setColor] = useState<NoteColor>(note?.color || "default");
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [tagInput, setTagInput] = useState("");
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
      await onSave({ title, content, type, checklist, color, tags });
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
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${cc.bg} ${cc.border}`}
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
        <div className="flex items-center gap-1 px-4 pb-3">
          {(
            [
              ["text", "Text", FileText],
              ["checklist", "Checklist", CheckSquare],
            ] as const
          ).map(([t, label, Icon]) => (
            <button
              type="button"
              key={t}
              onClick={() => {
                setType(t as NoteType);
                if (t === "checklist" && checklist.length === 0)
                  setChecklist([
                    { id: generateSafeId(), text: "", checked: false },
                  ]);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                type === t
                  ? "bg-slate-900 dark:bg-white text-white dark:text-black"
                  : "text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800"
              }`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
        <div className="h-px bg-slate-100 dark:bg-neutral-800 mx-4" />
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {type === "text" ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your note..."
              className="w-full min-h-[180px] text-sm text-slate-800 dark:text-neutral-200 placeholder:text-slate-400 dark:placeholder:text-neutral-600 bg-transparent outline-none resize-none leading-relaxed"
            />
          ) : (
            <ChecklistEditor items={checklist} onChange={setChecklist} />
          )}
          <div className="pt-2 border-t border-slate-100 dark:border-neutral-800">
            <div className="flex flex-wrap gap-1.5 items-center">
              <Tag className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-600 shrink-0" />
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
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
                placeholder="Add tag..."
                className="text-xs bg-transparent text-slate-700 dark:text-neutral-300 placeholder:text-slate-400 dark:placeholder:text-neutral-600 outline-none w-20"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-neutral-800">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
              title="Change color"
            >
              <Palette className="w-4 h-4 text-slate-500 dark:text-neutral-400" />
            </button>
            <AnimatePresence>
              {showColorPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute bottom-full left-0 mb-2 flex gap-1.5 p-2.5 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-neutral-700 rounded-xl shadow-xl z-10"
                >
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => {
                        setColor(c.key);
                        setShowColorPicker(false);
                      }}
                      className={`w-5 h-5 rounded-full ${c.dot} ring-offset-1 transition-transform hover:scale-125 ${
                        color === c.key
                          ? "ring-2 ring-slate-900 dark:ring-white scale-125"
                          : ""
                      }`}
                      title={c.key}
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
              className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || isEmpty}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving..." : "Save Note"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const NotesPage: React.FC = () => {
  const { success, error } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [editorNote, setEditorNote] = useState<Partial<Note> | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const fetchNotes = useCallback(async () => {
    try {
      const params: any = { archived: showArchived };
      if (search) params.search = search;
      if (activeTag) params.tag = activeTag;
      const res = await noteService.getNotes(params);
      setNotes(res.data || []);
    } catch (err) {
      error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [showArchived, search, activeTag]);

  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(fetchNotes, search ? 350 : 0);
  }, [fetchNotes, search]);

  const openCreate = () => {
    setEditorNote({});
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
    success(note.isArchived ? "Note restored" : "Note archived");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await noteService.deleteNote(deleteTarget._id);
    setNotes((prev) => prev.filter((n) => n._id !== deleteTarget._id));
    setDeleteTarget(null);
    success("Note deleted");
  };

  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags || []))).slice(
    0,
    20,
  );
  const pinned = notes.filter((n) => n.isPinned);
  const unpinned = notes.filter((n) => !n.isPinned);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Notes
          </h2>
          <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">
            {notes.length} {notes.length === 1 ? "note" : "notes"}
            {showArchived ? " archived" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setShowArchived(!showArchived);
              setActiveTag("");
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

      <div className="relative">
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

      <AnimatePresence>
        {editorOpen && (
          <NoteEditor
            note={editorNote}
            onClose={closeEditor}
            onSave={handleSave}
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
