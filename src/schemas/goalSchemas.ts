import { z } from 'zod';

export const createGoalSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    category: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
    targetDate: z.string().datetime().optional(),
    estimatedEffort: z.string().optional(),
  }),
});

export const updateGoalSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
    targetDate: z.string().datetime().optional(),
    estimatedEffort: z.string().optional(),
    actualEffort: z.string().optional(),
    progress: z.number().min(0).max(100).optional(),
  }),
});

export const getGoalSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const listGoalsSchema = z.object({
  query: z.object({
    status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    category: z.string().optional(),
    page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  }),
}); 