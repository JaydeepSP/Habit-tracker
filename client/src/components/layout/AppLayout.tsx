import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  Flame,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui';
import { HabitModal } from '@/components/habits/HabitModal';

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/habits', label: 'Habits', icon: CheckSquare },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#080808] text-slate-900 dark:text-neutral-100 antialiased selection:bg-neutral-800 dark:selection:bg-white selection:text-white dark:selection:text-black">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200/80 dark:border-neutral-800 bg-white dark:bg-[#0D0D0D] shrink-0 p-5 justify-between fixed top-0 bottom-0 left-0 z-30">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg">
              <Flame className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-tight text-slate-900 dark:text-white">
                AtomicSync
              </h1>
              <p className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">
                Daily Routine
              </p>
            </div>
          </div>

          {/* Action Quick Button */}
          {/* <Button
            onClick={() => setCreateModalOpen(true)}
            className="w-full justify-center shadow-md bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            <Plus className="w-4 h-4" />
            New Habit
          </Button> */}

          {/* Navigation Links */}
          <nav className="space-y-1 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-slate-200 dark:bg-neutral-800/90 text-slate-900 dark:text-white font-bold shadow-sm'
                        : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-900'
                    }`
                  }
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-neutral-500'}`} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Settings */}
        <div className="space-y-4 pt-4 border-t border-neutral-800">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center font-bold text-sm shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-[11px] text-neutral-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-950/40 transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between px-4 py-3.5 bg-[#0D0D0D] border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">HabitSync</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-neutral-900 text-neutral-300 border border-neutral-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Menu Drawer — fixed overlay, always on top regardless of scroll */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="mobile-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden fixed top-[57px] left-0 right-0 bottom-0 z-40 bg-black/60 backdrop-blur-sm"
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Menu Panel — fixed to top, below the header (top: 57px = header height) */}
              <motion.div
                key="mobile-menu"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="lg:hidden fixed top-[57px] left-0 right-0 z-50 bg-[#0D0D0D] border-b border-neutral-800 px-4 py-4 space-y-3 shadow-2xl"
              >
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setCreateModalOpen(true);
                  }}
                  className="w-full justify-center bg-white text-black hover:bg-neutral-100"
                >
                  <Plus className="w-4 h-4" />
                  New Habit
                </Button>
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-neutral-800 text-white font-bold'
                              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                          }`
                        }
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </NavLink>
                    );
                  })}
                </nav>
                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                  <span className="text-xs text-neutral-400 truncate">{user?.email}</span>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-semibold text-rose-500 flex items-center gap-1 hover:text-rose-400 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20 lg:pb-8">
          <Outlet context={{ openCreateModal: () => setCreateModalOpen(true) }} />
        </main>
      </div>

      {/* Habit Create Modal */}
      <HabitModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSaved={() => {
          setCreateModalOpen(false);
          // Trigger custom event so active pages refresh seamlessly
          window.dispatchEvent(new CustomEvent('habit-data-changed'));
        }}
      />
    </div>
  );
};
