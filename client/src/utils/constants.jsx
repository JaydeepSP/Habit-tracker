import * as Icons from 'lucide-react';
import React from 'react';

export const CATEGORIES = [
  'All',
  'Health',
  'Fitness',
  'Learning',
  'Work',
  'Personal',
  'Finance',
  'Social',
  'Other',
];

export const CATEGORY_COLORS = {
  Health: '#10B981', // Emerald
  Fitness: '#EF4444', // Red
  Learning: '#3B82F6', // Blue
  Work: '#F59E0B', // Amber
  Personal: '#8B5CF6', // Purple
  Finance: '#06B6D4', // Cyan
  Social: '#EC4899', // Pink
  Other: '#64748B', // Slate
};

export const COLOR_PALETTES = [
  '#6366F1', // Indigo
  '#3B82F6', // Blue
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#84CC16', // Lime
  '#F59E0B', // Amber
  '#F97316', // Orange
  '#EF4444', // Red
  '#EC4899', // Pink
  '#8B5CF6', // Purple
];

export const AVAILABLE_ICONS = [
  'Activity',
  'Dumbbell',
  'BookOpen',
  'Code2',
  'Droplets',
  'Sparkles',
  'SunMedium',
  'Moon',
  'Brain',
  'HeartPulse',
  'Coffee',
  'Apple',
  'PenLine',
  'CheckCircle2',
  'Flame',
  'Target',
  'Trophy',
  'Smile',
  'Laptop',
  'Briefcase',
];

export const DynamicIcon = ({ name, className = 'w-5 h-5', color }) => {
  const IconComponent = Icons[name] || Icons.Activity;
  return <IconComponent className={className} style={color ? { color } : undefined} />;
};

export const DAYS_OF_WEEK = [
  { index: 0, short: 'Sun', name: 'Sunday' },
  { index: 1, short: 'Mon', name: 'Monday' },
  { index: 2, short: 'Tue', name: 'Tuesday' },
  { index: 3, short: 'Wed', name: 'Wednesday' },
  { index: 4, short: 'Thu', name: 'Thursday' },
  { index: 5, short: 'Fri', name: 'Friday' },
  { index: 6, short: 'Sat', name: 'Saturday' },
];
