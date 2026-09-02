import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  habitName: string;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  habitName,
  isDeleting = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0.1 }}
            className="relative w-full max-w-md bg-white dark:bg-[#141414] border border-slate-200 dark:border-neutral-800 rounded-3xl shadow-2xl p-6 z-10 my-8 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header / Icon */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="flex-1 pr-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Delete Habit
                </h3>
                <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    "{habitName}"
                  </span>
                  ? This will permanently erase all streak data and history.
                </p>
              </div>
            </div>

            {/* Warning badge */}
            <div className="mt-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>This action cannot be undone.</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={onConfirm}
                isLoading={isDeleting}
                className="px-5 py-2 text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20"
              >
                Delete Habit
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
