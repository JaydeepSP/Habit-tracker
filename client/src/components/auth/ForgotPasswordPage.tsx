import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '@/services/authService';
import { useToast } from '@/context/ToastContext';
import { Button, Input, Card } from '@/components/ui';

export const ForgotPasswordPage = () => {
  const { error } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    try {
      await authService.forgotPassword(data.email);
      setSubmitted(true);
    } catch (err) {
      error(err.message || 'Failed to dispatch reset request');
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
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Forgot Password?
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your registered email to receive a password reset link
          </p>
        </div>

        <Card className="p-7 space-y-5 shadow-xl border-slate-200/90 dark:border-slate-800">
          {submitted ? (
            <div className="text-center space-y-3 py-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Reset Link Dispatched
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                If an account matches that email, check your inbox (or development server console) for the reset link.
              </p>
              <div className="pt-2">
                <Link to="/login">
                  <Button variant="secondary" className="w-full justify-center">
                    Return to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email', {
                  required: 'Please enter your email',
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: 'Please enter a valid email',
                  },
                })}
              />

              <Button
                type="submit"
                className="w-full justify-center mt-2"
                isLoading={isSubmitting}
              >
                Send Reset Link
              </Button>
            </form>
          )}

          <div className="pt-2 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
