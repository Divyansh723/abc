import { z } from 'zod';

export const habitSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name must be less than 50 characters'),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
  category: z.enum(['health', 'fitness', 'productivity', 'learning', 'mindfulness', 'social', 'creativity', 'finance', 'other']),
  frequency: z.enum(['daily', 'weekly', 'custom']),
  reminderTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional(),
  reminderEnabled: z.boolean(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  icon: z.string().min(1, 'Icon is required'),
  customFrequency: z.object({
    daysOfWeek: z.array(z.number().min(0).max(6)),
    timesPerWeek: z.number().min(1).max(7).optional(),
  }).optional(),
}).refine((data) => {
  // If frequency is custom, daysOfWeek must have at least one day
  if (data.frequency === 'custom') {
    return data.customFrequency && data.customFrequency.daysOfWeek.length > 0;
  }
  return true;
}, {
  message: 'Please select at least one day for custom frequency',
  path: ['customFrequency', 'daysOfWeek'],
});

export const userRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type HabitFormData = z.infer<typeof habitSchema>;
export type UserRegistrationData = z.infer<typeof userRegistrationSchema>;
export type UserLoginData = z.infer<typeof userLoginSchema>;