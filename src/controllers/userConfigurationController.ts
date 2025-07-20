import { Request, Response } from 'express';
import prisma from '../config/database';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export const getUserConfiguration = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const config = await prisma.userConfiguration.findUnique({
      where: { userId },
    });

    if (!config) {
      // Default configuration oluştur
      const defaultConfig = await prisma.userConfiguration.create({
        data: {
          userId,
          timezone: 'UTC',
          workingDays: 'monday,tuesday,wednesday,thursday,friday',
          workingHoursStart: '09:00',
          workingHoursEnd: '17:00',
          coreHoursStart: '10:00',
          coreHoursEnd: '16:00',
          sprintDuration: 14,
          sprintStartDay: 'monday',
          dailyStandupTime: '09:00',
          demoTime: '16:00',
          retroTime: '17:00',
          aiPreferences: JSON.stringify({
            communicationStyle: 'friendly',
            detailLevel: 'medium',
            reminderFrequency: 'daily'
          }),
          leaveSettings: JSON.stringify({
            annualLeaveDays: 20,
            sickLeaveDays: 10,
            personalLeaveDays: 5
          })
        },
      });
      return res.json(defaultConfig);
    }

    return res.json(config);
  } catch (error) {
    console.error('Error getting user configuration:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserConfiguration = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      timezone,
      workingDays,
      workingHoursStart,
      workingHoursEnd,
      coreHoursStart,
      coreHoursEnd,
      sprintDuration,
      sprintStartDay,
      dailyStandupTime,
      demoTime,
      retroTime,
      aiPreferences,
      leaveSettings
    } = req.body;

    const updateData: Record<string, unknown> = {};
    if (timezone !== undefined) updateData.timezone = timezone;
    if (workingDays !== undefined) updateData.workingDays = workingDays;
    if (workingHoursStart !== undefined) updateData.workingHoursStart = workingHoursStart;
    if (workingHoursEnd !== undefined) updateData.workingHoursEnd = workingHoursEnd;
    if (coreHoursStart !== undefined) updateData.coreHoursStart = coreHoursStart;
    if (coreHoursEnd !== undefined) updateData.coreHoursEnd = coreHoursEnd;
    if (sprintDuration !== undefined) updateData.sprintDuration = sprintDuration;
    if (sprintStartDay !== undefined) updateData.sprintStartDay = sprintStartDay;
    if (dailyStandupTime !== undefined) updateData.dailyStandupTime = dailyStandupTime;
    if (demoTime !== undefined) updateData.demoTime = demoTime;
    if (retroTime !== undefined) updateData.retroTime = retroTime;
    if (aiPreferences !== undefined) updateData.aiPreferences = JSON.stringify(aiPreferences);
    if (leaveSettings !== undefined) updateData.leaveSettings = JSON.stringify(leaveSettings);

    const config = await prisma.userConfiguration.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        timezone: timezone || 'UTC',
        workingDays: workingDays || 'monday,tuesday,wednesday,thursday,friday',
        workingHoursStart: workingHoursStart || '09:00',
        workingHoursEnd: workingHoursEnd || '17:00',
        coreHoursStart: coreHoursStart || null,
        coreHoursEnd: coreHoursEnd || null,
        sprintDuration: sprintDuration || 14,
        sprintStartDay: sprintStartDay || 'monday',
        dailyStandupTime: dailyStandupTime || '09:00',
        demoTime: demoTime || '16:00',
        retroTime: retroTime || '17:00',
        aiPreferences: aiPreferences ? JSON.stringify(aiPreferences) : null,
        leaveSettings: leaveSettings ? JSON.stringify(leaveSettings) : null,
      },
    });

    return res.json(config);
  } catch (error) {
    console.error('Error updating user configuration:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateWorkingHours = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { workingDays, workingHoursStart, workingHoursEnd, coreHoursStart, coreHoursEnd } = req.body;

    const config = await prisma.userConfiguration.upsert({
      where: { userId },
      update: {
        workingDays,
        workingHoursStart,
        workingHoursEnd,
        coreHoursStart,
        coreHoursEnd,
      },
      create: {
        userId,
        workingDays: workingDays || 'monday,tuesday,wednesday,thursday,friday',
        workingHoursStart: workingHoursStart || '09:00',
        workingHoursEnd: workingHoursEnd || '17:00',
        coreHoursStart: coreHoursStart || null,
        coreHoursEnd: coreHoursEnd || null,
      },
    });

    return res.json(config);
  } catch (error) {
    console.error('Error updating working hours:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSprintSettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { sprintDuration, sprintStartDay, dailyStandupTime, demoTime, retroTime } = req.body;

    const config = await prisma.userConfiguration.upsert({
      where: { userId },
      update: {
        sprintDuration,
        sprintStartDay,
        dailyStandupTime,
        demoTime,
        retroTime,
      },
      create: {
        userId,
        sprintDuration: sprintDuration || 14,
        sprintStartDay: sprintStartDay || 'monday',
        dailyStandupTime: dailyStandupTime || '09:00',
        demoTime: demoTime || '16:00',
        retroTime: retroTime || '17:00',
      },
    });

    return res.json(config);
  } catch (error) {
    console.error('Error updating sprint settings:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAIPreferences = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { aiPreferences } = req.body;

    const config = await prisma.userConfiguration.upsert({
      where: { userId },
      update: {
        aiPreferences: JSON.stringify(aiPreferences),
      },
      create: {
        userId,
        aiPreferences: JSON.stringify(aiPreferences),
      },
    });

    return res.json(config);
  } catch (error) {
    console.error('Error updating AI preferences:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateLeaveSettings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { leaveSettings } = req.body;

    const config = await prisma.userConfiguration.upsert({
      where: { userId },
      update: {
        leaveSettings: JSON.stringify(leaveSettings),
      },
      create: {
        userId,
        leaveSettings: JSON.stringify(leaveSettings),
      },
    });

    return res.json(config);
  } catch (error) {
    console.error('Error updating leave settings:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 