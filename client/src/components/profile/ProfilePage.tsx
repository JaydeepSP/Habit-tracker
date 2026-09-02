import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { userService } from '@/services/userService';
import { Card, Button, Input } from '@/components/ui';
import { User, Lock, ShieldCheck } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      timezone: user?.timezone || 'UTC',
    },
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onUpdateProfile = async (data) => {
    setIsUpdatingProfile(true);
    try {
      const res = await userService.updateProfile(data);
      if (res.success && res.data?.user) {
        updateUser(res.data.user);
        success('Profile details updated successfully');
      }
    } catch (err) {
      error(err.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onUpdatePassword = async (data) => {
    if (data.newPassword !== data.confirmNewPassword) {
      error('New passwords do not match');
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const res = await userService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      if (res.success) {
        success('Password updated successfully');
        resetPasswordForm();
      }
    } catch (err) {
      error(err.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Account & Preferences
        </h2>
        <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1">
          Manage your personal profile, security credentials, and application appearance
        </p>
      </div>

      {/* Account Overview Header Card (Monochrome Black & White) */}
      <Card className="p-6 flex items-center gap-5 bg-white dark:bg-[#121212] border-slate-200/90 dark:border-neutral-800">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-black flex items-center justify-center font-black text-2xl shadow-lg">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {user?.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
            {user?.email} • Member since {memberSince}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-neutral-900 text-slate-900 dark:text-neutral-200 border border-slate-200 dark:border-neutral-800">
              <ShieldCheck className="w-3.5 h-3.5" /> Account Active
            </span>
          </div>
        </div>
      </Card>

      {/* Profile Details Form */}
      <Card className="p-6 space-y-5 bg-white dark:bg-[#121212] border-slate-200/90 dark:border-neutral-800">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-neutral-800">
          <User className="w-5 h-5 text-slate-900 dark:text-white" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Personal Information
          </h3>
        </div>

        <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="Your Name"
              error={profileErrors.name?.message as string | undefined}
              {...registerProfile('name', { required: 'Name is required' })}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              error={profileErrors.email?.message as string | undefined}
              {...registerProfile('email', { required: 'Email is required' })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-neutral-400">
              Timezone
            </label>
            <select
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-neutral-600"
              {...registerProfile('timezone')}
            >
              <option value="UTC">UTC (Universal Time)</option>
              <option value="America/New_York">Eastern Time (US & Canada)</option>
              <option value="America/Chicago">Central Time (US & Canada)</option>
              <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
              <option value="Europe/London">London (GMT / BST)</option>
              <option value="Europe/Paris">Paris, Berlin, Amsterdam</option>
              <option value="Asia/Kolkata">India Standard Time (IST)</option>
              <option value="Asia/Tokyo">Tokyo, Japan (JST)</option>
              <option value="Australia/Sydney">Sydney, Australia (AEST)</option>
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={isUpdatingProfile} className="dark:bg-white dark:text-black dark:hover:bg-neutral-200">
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Change Password Form */}
      <Card className="p-6 space-y-5 bg-white dark:bg-[#121212] border-slate-200/90 dark:border-neutral-800">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-neutral-800">
          <Lock className="w-5 h-5 text-slate-900 dark:text-white" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Security & Password
          </h3>
        </div>

        <form onSubmit={handlePasswordSubmit(onUpdatePassword)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            error={passwordErrors.currentPassword?.message}
            {...registerPassword('currentPassword', {
              required: 'Please enter your current password',
            })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              error={passwordErrors.newPassword?.message}
              {...registerPassword('newPassword', {
                required: 'Please enter a new password',
                minLength: {
                  value: 6,
                  message: 'Must be at least 6 characters',
                },
              })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              error={passwordErrors.confirmNewPassword?.message}
              {...registerPassword('confirmNewPassword', {
                required: 'Please confirm your new password',
              })}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="secondary" isLoading={isUpdatingPassword} className="dark:bg-neutral-900 dark:border-neutral-800 dark:text-white dark:hover:bg-neutral-800">
              Update Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
