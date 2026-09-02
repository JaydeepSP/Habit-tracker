import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button, Input, Card } from '@/components/ui';
import { RecommendedHabitsModal } from '@/components/dashboard/RecommendedHabitsModal';

export const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      error('Passwords do not match');
      return;
    }

    try {
      const res = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      });

      if (res.success) {
        success('Account created successfully! Welcome aboard 🚀');
        setOnboardingOpen(true);
      }
    } catch (err) {
      error(err.message || 'Registration failed');
    }
  };

  const handleFinishOnboarding = () => {
    setOnboardingOpen(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0B0F19]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center mx-auto text-white shadow-lg shadow-brand-500/25">
            <Flame className="w-7 h-7 fill-current" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Create your account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Start transforming your personal routine one habit at a time
          </p>
        </div>

        {/* Register Card */}
        <Card className="p-7 space-y-4 shadow-xl border-slate-200/90 dark:border-slate-800">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Jaydeep Prajapati"
              error={errors.name?.message}
              {...register('name', { required: 'Please enter your name' })}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'Please enter your email',
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: 'Please enter a valid email address',
                },
              })}
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) => val === password || 'Passwords do not match',
              })}
            />

            <Button
              type="submit"
              className="w-full justify-center mt-3"
              isLoading={isSubmitting}
            >
              Get Started <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </motion.div>

      {/* Onboarding Recommended Habits Modal */}
      <RecommendedHabitsModal
        isOpen={onboardingOpen}
        onClose={handleFinishOnboarding}
        onAdded={handleFinishOnboarding}
      />
    </div>
  );
};
