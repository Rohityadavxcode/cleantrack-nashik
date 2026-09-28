import { z } from 'zod';

export const complaintSubmissionSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters long')
    .max(120, 'Title cannot exceed 120 characters'),
  description: z
    .string()
    .min(15, 'Please provide a detailed description (at least 15 characters)')
    .max(1500, 'Description cannot exceed 1500 characters'),
  categoryId: z.string().min(1, 'Please select a problem category'),
  subcategoryId: z.string().optional().nullable(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  duration: z.string().optional().nullable(),
  isBlockingTraffic: z.boolean().default(false),
  isHealthHazard: z.boolean().default(false),

  // Geolocation
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().min(3, 'Address is required'),
  landmark: z.string().optional().nullable(),
  zoneName: z.string().min(1, 'Administrative zone is required'),
  wardNumber: z.string().optional().nullable(),
  locality: z.string().optional().nullable(),

  // Citizen Contact
  citizenName: z.string().min(2, 'Please enter your full name'),
  citizenMobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  citizenEmail: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  citizenLanguage: z.enum(['en', 'mr']).default('en'),

  // Photos
  photos: z.array(z.string()).max(3, 'Maximum 3 photos allowed').default([]),
});

export const statusUpdateSchema = z.object({
  newStatus: z.enum([
    'SUBMITTED',
    'RECEIVED',
    'UNDER_REVIEW',
    'ASSIGNED',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED',
    'REJECTED',
    'DUPLICATE',
    'INVALID_LOCATION',
    'MORE_INFORMATION_REQUIRED',
    'REOPENED',
  ]),
  notes: z.string().optional(),
  publicNote: z.string().optional(),
  resolutionSummary: z.string().optional(),
  resolutionPhoto: z.string().optional(),
  actorName: z.string().default('Divisional Officer'),
  actorId: z.string().optional(),
});

export const citizenFeedbackSchema = z.object({
  resolutionQuality: z.enum(['YES_RESOLVED', 'NOT_FULLY_RESOLVED', 'NO_STILL_EXISTS']),
  feedbackText: z.string().optional(),
  feedbackPhoto: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});
