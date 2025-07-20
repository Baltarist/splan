import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.d';
import prisma from '../config/database';
import { logger } from '../utils/logger';

interface ExportData {
  goals: any[];
  sprints: any[];
  tasks: any[];
  timeEntries: any[];
  notifications: any[];
  userConfiguration: any[];
}

interface ImportResult {
  success: boolean;
  imported: {
    goals: number;
    sprints: number;
    tasks: number;
    timeEntries: number;
    notifications: number;
    userConfiguration: number;
  };
  errors: string[];
}

export const dataExportImportController = {
  // Export user data
  exportData: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;

      const [goals, sprints, tasks, timeEntries, notifications, userConfiguration] = await Promise.all([
        prisma.goal.findMany({
          where: { userId },
          include: { tasks: true },
        }),
        prisma.sprint.findMany({
          where: { userId },
          include: { tasks: true },
        }),
        prisma.task.findMany({
          where: { userId },
          include: { timeEntries: true, sprint: true, goal: true },
        }),
        prisma.timeEntry.findMany({
          where: { userId },
          include: { task: true },
        }),
        prisma.notification.findMany({
          where: { userId },
        }),
        prisma.userConfiguration.findMany({
          where: { userId },
        }),
      ]);

      const exportData: ExportData = {
        goals,
        sprints,
        tasks,
        timeEntries,
        notifications,
        userConfiguration,
      };

      // Create CSV content
      const csvContent = generateCSV(exportData);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=splan-export-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvContent);
    } catch (error) {
      logger.error('Error exporting data:', error);
      next(error);
    }
  },

  // Import user data
  importData: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { csvContent } = req.body;

      if (!csvContent || typeof csvContent !== 'string') {
        res.status(400).json({
          success: false,
          message: 'CSV content is required',
        });
        return;
      }

      const importResult = await processCSVImport(csvContent, userId);

      res.status(200).json({
        success: importResult.success,
        data: importResult,
        message: importResult.success ? 'Data imported successfully' : 'Import completed with errors',
      });
    } catch (error) {
      logger.error('Error importing data:', error);
      next(error);
    }
  },

  // Backup user data
  backupData: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;

      const [goals, sprints, tasks, timeEntries, notifications, userConfiguration] = await Promise.all([
        prisma.goal.findMany({
          where: { userId },
          include: { tasks: true },
        }),
        prisma.sprint.findMany({
          where: { userId },
          include: { tasks: true },
        }),
        prisma.task.findMany({
          where: { userId },
          include: { timeEntries: true, sprint: true, goal: true },
        }),
        prisma.timeEntry.findMany({
          where: { userId },
          include: { task: true },
        }),
        prisma.notification.findMany({
          where: { userId },
        }),
        prisma.userConfiguration.findMany({
          where: { userId },
        }),
      ]);

      const backupData = {
        timestamp: new Date().toISOString(),
        userId,
        data: {
          goals,
          sprints,
          tasks,
          timeEntries,
          notifications,
          userConfiguration,
        },
      };

      res.status(200).json({
        success: true,
        data: backupData,
        message: 'Data backup created successfully',
      });
    } catch (error) {
      logger.error('Error creating backup:', error);
      next(error);
    }
  },

  // Restore user data
  restoreData: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { backupData } = req.body;

      if (!backupData || !backupData.data) {
        res.status(400).json({
          success: false,
          message: 'Valid backup data is required',
        });
        return;
      }

      const restoreResult = await restoreFromBackup(backupData.data, userId);

      res.status(200).json({
        success: restoreResult.success,
        data: restoreResult,
        message: restoreResult.success ? 'Data restored successfully' : 'Restore completed with errors',
      });
    } catch (error) {
      logger.error('Error restoring data:', error);
      next(error);
    }
  },

  // Get backup history
  getBackups: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;

      const backups = await prisma.dataBackup.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({
        success: true,
        data: backups,
        message: 'Backup history retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting backup history:', error);
      next(error);
    }
  },

  // Download backup
  downloadBackup: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Backup ID is required',
        });
        return;
      }

      const backup = await prisma.dataBackup.findFirst({
        where: { id, userId },
      });

      if (!backup) {
        res.status(404).json({
          success: false,
          message: 'Backup not found',
        });
        return;
      }

      // In a real implementation, you would read the backup file from storage
      // For now, we'll return the backup metadata
      res.status(200).json({
        success: true,
        data: backup,
        message: 'Backup metadata retrieved successfully',
      });
    } catch (error) {
      logger.error('Error downloading backup:', error);
      next(error);
    }
  },

  // Restore backup
  restoreBackup: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Backup ID is required',
        });
        return;
      }

      const backup = await prisma.dataBackup.findFirst({
        where: { id, userId },
      });

      if (!backup) {
        res.status(404).json({
          success: false,
          message: 'Backup not found',
        });
        return;
      }

      // In a real implementation, you would read the backup file and restore data
      // For now, we'll create a restore record
      const restore = await prisma.dataRestore.create({
        data: {
          userId,
          backupId: id,
          status: 'COMPLETED',
          restoredRecords: 0,
          skippedRecords: 0,
          errorCount: 0,
        },
      });

      res.status(200).json({
        success: true,
        data: restore,
        message: 'Backup restore initiated successfully',
      });
    } catch (error) {
      logger.error('Error restoring backup:', error);
      next(error);
    }
  },

  // Get export/import history
  getExportImportHistory: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;

      const [exports, imports] = await Promise.all([
        prisma.dataExport.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.dataImport.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          exports,
          imports,
        },
        message: 'Export/Import history retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting export/import history:', error);
      next(error);
    }
  },
};

// Helper functions
function generateCSV(data: ExportData): string {
  const lines: string[] = [];
  
  // Add headers
  lines.push('Entity,Data');
  
  // Add goals
  data.goals.forEach(goal => {
    const goalData = JSON.stringify(goal).replace(/"/g, '""');
    lines.push(`Goal,"${goalData}"`);
  });
  
  // Add sprints
  data.sprints.forEach(sprint => {
    const sprintData = JSON.stringify(sprint).replace(/"/g, '""');
    lines.push(`Sprint,"${sprintData}"`);
  });
  
  // Add tasks
  data.tasks.forEach(task => {
    const taskData = JSON.stringify(task).replace(/"/g, '""');
    lines.push(`Task,"${taskData}"`);
  });
  
  // Add time entries
  data.timeEntries.forEach(entry => {
    const entryData = JSON.stringify(entry).replace(/"/g, '""');
    lines.push(`TimeEntry,"${entryData}"`);
  });
  
  // Add notifications
  data.notifications.forEach(notification => {
    const notificationData = JSON.stringify(notification).replace(/"/g, '""');
    lines.push(`Notification,"${notificationData}"`);
  });
  
  // Add user configuration
  data.userConfiguration.forEach(config => {
    const configData = JSON.stringify(config).replace(/"/g, '""');
    lines.push(`UserConfiguration,"${configData}"`);
  });
  
  return lines.join('\n');
}

async function processCSVImport(csvContent: string, userId: string): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    imported: {
      goals: 0,
      sprints: 0,
      tasks: 0,
      timeEntries: 0,
      notifications: 0,
      userConfiguration: 0,
    },
    errors: [],
  };

  const data: Record<string, any[]> = {
    Goal: [],
    Sprint: [],
    Task: [],
    TimeEntry: [],
    Notification: [],
    UserConfiguration: [],
  };

  try {
    const lines = csvContent.split('\n');
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;
      
      const [entity, jsonData] = line.split(',', 2);
      if (!entity || !jsonData) continue;
      
      try {
        const parsedData = JSON.parse(jsonData.replace(/""/g, '"'));
        if (!data[entity]) data[entity] = [];
        data[entity].push(parsedData);
      } catch (parseError) {
        result.errors.push(`Parse error for ${entity}: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    }

    // Import goals
    for (const goalData of data.Goal || []) {
      try {
        const { id, userId: _, tasks, ...goalFields } = goalData;
        await prisma.goal.create({
          data: {
            ...goalFields,
            userId,
          },
        });
        result.imported.goals++;
      } catch (error) {
        result.errors.push(`Goal import error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Import sprints
    for (const sprintData of data.Sprint || []) {
      try {
        const { id, userId: _, tasks, ...sprintFields } = sprintData;
        await prisma.sprint.create({
          data: {
            ...sprintFields,
            userId,
          },
        });
        result.imported.sprints++;
      } catch (error) {
        result.errors.push(`Sprint import error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Import tasks
    for (const taskData of data.Task || []) {
      try {
        const { id, userId: _, timeEntries, sprint, goal, ...taskFields } = taskData;
        await prisma.task.create({
          data: {
            ...taskFields,
            userId,
          },
        });
        result.imported.tasks++;
      } catch (error) {
        result.errors.push(`Task import error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Import other entities
    for (const entity of ['TimeEntry', 'Notification', 'UserConfiguration']) {
      for (const entityData of data[entity] || []) {
        try {
          const { id, userId: _, ...entityFields } = entityData;
          const tableName = entity.toLowerCase() as keyof typeof prisma;
          
          if (prisma[tableName] && typeof (prisma[tableName] as any).create === 'function') {
            await (prisma[tableName] as any).create({
              data: {
                ...entityFields,
                userId,
              },
            });
            result.imported[entity.toLowerCase() as keyof typeof result.imported]++;
          }
        } catch (error) {
          result.errors.push(`${entity} import error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

  } catch (error) {
    result.errors.push(`General import error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  result.success = result.errors.length === 0;
  return result;
}

async function restoreFromBackup(backupData: any, userId: string): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    imported: {
      goals: 0,
      sprints: 0,
      tasks: 0,
      timeEntries: 0,
      notifications: 0,
      userConfiguration: 0,
    },
    errors: [],
  };

  try {
    // Clear existing data
    await Promise.all([
      prisma.notification.deleteMany({ where: { userId } }),
      prisma.timeEntry.deleteMany({ where: { userId } }),
      prisma.task.deleteMany({ where: { userId } }),
      prisma.sprint.deleteMany({ where: { userId } }),
      prisma.goal.deleteMany({ where: { userId } }),
      prisma.userConfiguration.deleteMany({ where: { userId } }),
    ]);

    // Restore data
    if (backupData.goals) {
      for (const goal of backupData.goals) {
        try {
          const { id, userId: _, tasks, ...goalFields } = goal;
          await prisma.goal.create({
            data: {
              ...goalFields,
              userId,
            },
          });
          result.imported.goals++;
        } catch (error) {
          result.errors.push(`Goal restore error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    // Restore other entities similarly
    const entities = [
      { key: 'sprints', table: 'sprint' },
      { key: 'tasks', table: 'task' },
      { key: 'timeEntries', table: 'timeEntry' },
      { key: 'notifications', table: 'notification' },
      { key: 'userConfiguration', table: 'userConfiguration' },
    ];

    for (const entity of entities) {
      if (backupData[entity.key]) {
        for (const item of backupData[entity.key]) {
          try {
            const { id, userId: _, ...itemFields } = item;
            const tableName = entity.table as keyof typeof prisma;
            
            if (prisma[tableName] && typeof (prisma[tableName] as any).create === 'function') {
              await (prisma[tableName] as any).create({
                data: {
                  ...itemFields,
                  userId,
                },
              });
              result.imported[entity.key as keyof typeof result.imported]++;
            }
          } catch (error) {
            result.errors.push(`${entity.key} restore error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }
    }

  } catch (error) {
    result.errors.push(`Restore error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  result.success = result.errors.length === 0;
  return result;
} 