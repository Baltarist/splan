import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    sprintId: z.string().optional(),
    goalId: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
    estimatedHours: z.number().positive().optional(),
    dueDate: z.string().datetime().optional(),
    dependencies: z.string().optional(),
    tags: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    estimatedHours: z.number().positive().optional(),
    actualHours: z.number().positive().optional(),
    progress: z.number().min(0).max(100).optional(),
    dueDate: z.string().datetime().optional(),
    dependencies: z.string().optional(),
    tags: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const getTaskSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const listTasksSchema = z.object({
  query: z.object({
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    sprintId: z.string().optional(),
    goalId: z.string().optional(),
    page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  }),
});

export const timeTrackingSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    startTime: z.string().datetime(),
    endTime: z.string().datetime().optional(),
    duration: z.number().positive().optional(),
    description: z.string().optional(),
  }),
}); 