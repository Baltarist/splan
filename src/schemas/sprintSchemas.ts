import { z } from 'zod';

export const createSprintSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    goalId: z.string().optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    capacity: z.number().positive().optional(),
  }),
});

export const updateSprintSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
    capacity: z.number().positive().optional(),
    velocity: z.number().optional(),
  }),
});

export const getSprintSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const listSprintsSchema = z.object({
  query: z.object({
    status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
    goalId: z.string().optional(),
    page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  }),
});

export const startSprintSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const completeSprintSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
}); 