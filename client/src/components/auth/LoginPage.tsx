import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button, Input, Card } from '@/components/ui';

export const LoginPage = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await login(data.email, data.password);
      if (res.success) {
        success('Welcome back! 👋');
        navigate('/dashboard');
      }
    } catch (err) {
      error(err.message || 'Invalid credentials');
    }
  };

  const handleDemoLogin = async () => {
    try {
      const res = await login('demo@habittracker.com', 'Password123!');
      if (res.success) {
        success('Logged in as Demo User! 🚀');
        navigate('/dashboard');
      }
    } catch (err) {
      error('Please run database seed (npm run seed in server) for demo account');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#080808] text-neutral-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6"
      >
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-white shadow-xl">
            <Flame className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Sign in to HabitSync
          </h1>
          <p className="text-xs text-neutral-400">
            Build atomic daily habits and achieve consistency
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-7 space-y-5 bg-[#121212] border-neutral-800 shadow-2xl rounded-3xl">
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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-neutral-400 hover:text-white hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Please enter your password',
                })}
              />
            </div>

            <Button
              type="submit"
              className="w-full justify-center mt-2"
              isLoading={isSubmitting}
            >
              Sign In <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="pt-3 border-t border-neutral-800/80 space-y-2">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              Quick Demo Login (Pre-populated Data)
            </button>
          </div>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs text-neutral-400">
          Don't have an account yet?{' '}
          <Link
            to="/register"
            className="font-bold text-white hover:underline ml-1"
          >
            Create free account
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
