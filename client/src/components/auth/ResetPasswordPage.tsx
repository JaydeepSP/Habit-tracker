import React from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button, Input, Card } from '@/components/ui';

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const { updateUser } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      error('Passwords do not match');
      return;
    }

    try {
      const res = await authService.resetPassword(token, data.password);
      if (res.success) {
        if (res.data?.user) updateUser(res.data.user);
        success('Password reset successfully! Logged in.');
        navigate('/dashboard');
      }
    } catch (err) {
      error(err.message || 'Invalid or expired reset token');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0B0F19]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center mx-auto text-white shadow-lg shadow-brand-500/25">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your new secure password below
          </p>
        </div>

        <Card className="p-7 space-y-4 shadow-xl border-slate-200/90 dark:border-slate-800">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="At least 6 characters"
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Must be at least 6 characters',
                },
              })}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm password',
                validate: (val) => val === password || 'Passwords do not match',
              })}
            />

            <Button
              type="submit"
              className="w-full justify-center mt-2"
              isLoading={isSubmitting}
            >
              Update Password & Sign In <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="pt-2 text-center">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel and return to Login
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
