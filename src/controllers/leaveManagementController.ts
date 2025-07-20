import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import openaiService from '../services/openaiService';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

export const leaveManagementController = {
  // İzin talebi oluştur
  createLeaveRequest: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const { type, startDate, endDate, reason } = req.body;

      if (!type || !startDate || !endDate) {
        res.status(400).json({ 
          success: false, 
          message: 'Type, startDate, and endDate are required' 
        });
        return;
      }

      // Tarih validasyonu
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        res.status(400).json({ 
          success: false, 
          message: 'End date must be after start date' 
        });
        return;
      }

      if (start < new Date()) {
        res.status(400).json({ 
          success: false, 
          message: 'Start date cannot be in the past' 
        });
        return;
      }

      // Çakışan izin talepleri kontrolü
      const conflictingLeaves = await prisma.leaveRequest.findMany({
        where: {
          userId,
          status: { in: ['PENDING', 'APPROVED'] },
          OR: [
            {
              startDate: { lte: end },
              endDate: { gte: start }
            }
          ]
        }
      });

      if (conflictingLeaves.length > 0) {
        res.status(400).json({ 
          success: false, 
          message: 'You have conflicting leave requests for this period' 
        });
        return;
      }

      // İzin talebini oluştur
      const leaveRequest = await prisma.leaveRequest.create({
        data: {
          userId,
          type,
          startDate: start,
          endDate: end,
          reason: reason || null,
          status: 'PENDING'
        }
      });

      // AI-powered impact analysis
      try {
        const impactAnalysis = await analyzeLeaveImpact(userId, leaveRequest);
        
        // İzin talebini güncelle
        await prisma.leaveRequest.update({
          where: { id: leaveRequest.id },
          data: {
            impactAnalysis: JSON.stringify(impactAnalysis)
          }
        });

        res.status(201).json({
          success: true,
          message: 'Leave request created successfully',
          data: {
            ...leaveRequest,
            impactAnalysis
          }
        });
      } catch (aiError) {
        console.error('AI impact analysis failed:', aiError);
        
        res.status(201).json({
          success: true,
          message: 'Leave request created successfully (impact analysis failed)',
          data: leaveRequest
        });
      }
    } catch (error) {
      next(error);
    }
  },

  // İzin taleplerini listele
  getLeaveRequests: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const { status, type, startDate, endDate } = req.query;

      const where: any = { userId };

      if (status) {
        where.status = status;
      }

      if (type) {
        where.type = type;
      }

      if (startDate && endDate) {
        where.startDate = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        };
      }

      const leaveRequests = await prisma.leaveRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({
        success: true,
        message: 'Leave requests retrieved successfully',
        data: leaveRequests
      });
    } catch (error) {
      next(error);
    }
  },

  // İzin talebi detayı
  getLeaveRequestById: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const id = req.params.id;
      if (!id) {
        res.status(400).json({ success: false, message: 'Leave request ID is required' });
        return;
      }

      const leaveRequest = await prisma.leaveRequest.findFirst({
        where: { id, userId }
      });

      if (!leaveRequest) {
        res.status(404).json({ success: false, message: 'Leave request not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Leave request retrieved successfully',
        data: leaveRequest
      });
    } catch (error) {
      next(error);
    }
  },

  // İzin talebini güncelle
  updateLeaveRequest: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const id = req.params.id;
      if (!id) {
        res.status(400).json({ success: false, message: 'Leave request ID is required' });
        return;
      }

      const { type, startDate, endDate, reason } = req.body;

      const leaveRequest = await prisma.leaveRequest.findFirst({
        where: { id, userId }
      });

      if (!leaveRequest) {
        res.status(404).json({ success: false, message: 'Leave request not found' });
        return;
      }

      if (leaveRequest.status !== 'PENDING') {
        res.status(400).json({ 
          success: false, 
          message: 'Cannot update leave request that is not pending' 
        });
        return;
      }

      const updateData: any = {};

      if (type) updateData.type = type;
      if (startDate) updateData.startDate = new Date(startDate);
      if (endDate) updateData.endDate = new Date(endDate);
      if (reason !== undefined) updateData.reason = reason;

      const updatedLeaveRequest = await prisma.leaveRequest.update({
        where: { id },
        data: updateData
      });

      res.status(200).json({
        success: true,
        message: 'Leave request updated successfully',
        data: updatedLeaveRequest
      });
    } catch (error) {
      next(error);
    }
  },

  // İzin talebini sil
  deleteLeaveRequest: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const id = req.params.id;
      if (!id) {
        res.status(400).json({ success: false, message: 'Leave request ID is required' });
        return;
      }

      const leaveRequest = await prisma.leaveRequest.findFirst({
        where: { id, userId }
      });

      if (!leaveRequest) {
        res.status(404).json({ success: false, message: 'Leave request not found' });
        return;
      }

      if (leaveRequest.status !== 'PENDING') {
        res.status(400).json({ 
          success: false, 
          message: 'Cannot delete leave request that is not pending' 
        });
        return;
      }

      await prisma.leaveRequest.delete({
        where: { id }
      });

      res.status(200).json({
        success: true,
        message: 'Leave request deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // İzin talebini onayla/reddet
  updateLeaveRequestStatus: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const id = req.params.id;
      if (!id) {
        res.status(400).json({ success: false, message: 'Leave request ID is required' });
        return;
      }

      const { status, approvedBy } = req.body;

      if (!['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].includes(status)) {
        res.status(400).json({ 
          success: false, 
          message: 'Invalid status. Must be PENDING, APPROVED, REJECTED, or CANCELLED' 
        });
        return;
      }

      const leaveRequest = await prisma.leaveRequest.findFirst({
        where: { id, userId }
      });

      if (!leaveRequest) {
        res.status(404).json({ success: false, message: 'Leave request not found' });
        return;
      }

      const updateData: any = { status };

      if (status === 'APPROVED') {
        updateData.approvedBy = approvedBy || 'AI_AGENT';
        updateData.approvedAt = new Date();
      }

      const updatedLeaveRequest = await prisma.leaveRequest.update({
        where: { id },
        data: updateData
      });

      // Eğer onaylandıysa sprint'leri otomatik ayarla
      if (status === 'APPROVED') {
        try {
          await adjustSprintsForLeave(userId, leaveRequest);
        } catch (adjustmentError) {
          console.error('Sprint adjustment failed:', adjustmentError);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Leave request status updated successfully',
        data: updatedLeaveRequest
      });
    } catch (error) {
      next(error);
    }
  },

  // İzin istatistikleri
  getLeaveStatistics: async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const { year } = req.query;
      const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

      const startOfYear = new Date(currentYear, 0, 1);
      const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

      const leaveRequests = await prisma.leaveRequest.findMany({
        where: {
          userId,
          startDate: { gte: startOfYear, lte: endOfYear }
        }
      });

      const statistics = {
        year: currentYear,
        total: leaveRequests.length,
        approved: leaveRequests.filter(lr => lr.status === 'APPROVED').length,
        pending: leaveRequests.filter(lr => lr.status === 'PENDING').length,
        rejected: leaveRequests.filter(lr => lr.status === 'REJECTED').length,
        cancelled: leaveRequests.filter(lr => lr.status === 'CANCELLED').length,
        byType: leaveRequests.reduce((acc, lr) => {
          acc[lr.type] = (acc[lr.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        totalDays: leaveRequests
          .filter(lr => lr.status === 'APPROVED')
          .reduce((total, lr) => {
            const days = Math.ceil((lr.endDate.getTime() - lr.startDate.getTime()) / (1000 * 60 * 60 * 24));
            return total + days;
          }, 0)
      };

      res.status(200).json({
        success: true,
        message: 'Leave statistics retrieved successfully',
        data: statistics
      });
    } catch (error) {
      next(error);
    }
  }
};

// AI-powered leave impact analysis
async function analyzeLeaveImpact(userId: string, leaveRequest: any) {
  try {
    // Kullanıcının aktif sprint'lerini al
    const activeSprints = await prisma.sprint.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        OR: [
          {
            startDate: { lte: leaveRequest.endDate },
            endDate: { gte: leaveRequest.startDate }
          }
        ]
      },
      include: {
        tasks: {
          where: {
            status: { in: ['TODO', 'IN_PROGRESS'] }
          }
        }
      }
    });

    // Kullanıcının aktif görevlerini al
    const activeTasks = await prisma.task.findMany({
      where: {
        userId,
        status: { in: ['TODO', 'IN_PROGRESS'] },
        dueDate: {
          gte: leaveRequest.startDate,
          lte: leaveRequest.endDate
        }
      }
    });

    const prompt = `Analyze the impact of a leave request on productivity and project timelines:

Leave Request Details:
- Type: ${leaveRequest.type}
- Start Date: ${leaveRequest.startDate.toISOString()}
- End Date: ${leaveRequest.endDate.toISOString()}
- Duration: ${Math.ceil((leaveRequest.endDate.getTime() - leaveRequest.startDate.getTime()) / (1000 * 60 * 60 * 24))} days

Active Sprints: ${activeSprints.length}
Active Tasks: ${activeTasks.length}

Please provide a comprehensive impact analysis including:
1. Sprint impact assessment
2. Task completion risks
3. Timeline adjustments needed
4. Recommendations for mitigation

Return the response as a JSON object with the following structure:
{
  "sprintImpact": "High/Medium/Low",
  "taskRisks": ["risk1", "risk2"],
  "timelineAdjustments": ["adjustment1", "adjustment2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "overallImpact": "High/Medium/Low"
}`;

    const response = await openaiService.generateDailyStandupResponse(prompt, {
      userId,
      userPreferences: {}
    });

    try {
      return JSON.parse(response);
    } catch (parseError) {
      return {
        sprintImpact: 'Medium',
        taskRisks: ['Tasks may be delayed during leave period'],
        timelineAdjustments: ['Consider extending sprint deadlines'],
        recommendations: ['Plan tasks around leave period'],
        overallImpact: 'Medium'
      };
    }
  } catch (error) {
    console.error('AI impact analysis error:', error);
    return {
      sprintImpact: 'Medium',
      taskRisks: ['Unable to analyze impact'],
      timelineAdjustments: ['Manual review required'],
      recommendations: ['Review leave impact manually'],
      overallImpact: 'Unknown'
    };
  }
}

// Sprint'leri izin için otomatik ayarla
async function adjustSprintsForLeave(userId: string, leaveRequest: any) {
  try {
    const affectedSprints = await prisma.sprint.findMany({
      where: {
        userId,
        status: 'ACTIVE',
        OR: [
          {
            startDate: { lte: leaveRequest.endDate },
            endDate: { gte: leaveRequest.startDate }
          }
        ]
      }
    });

    for (const sprint of affectedSprints) {
      const leaveDays = Math.ceil((leaveRequest.endDate.getTime() - leaveRequest.startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Sprint'i uzat
      const newEndDate = new Date(sprint.endDate);
      newEndDate.setDate(newEndDate.getDate() + leaveDays);

      await prisma.sprint.update({
        where: { id: sprint.id },
        data: {
          endDate: newEndDate,
          healthMetrics: JSON.stringify({
            adjustedForLeave: true,
            originalEndDate: sprint.endDate,
            leaveDays: leaveDays,
            adjustedAt: new Date()
          })
        }
      });
    }
  } catch (error) {
    console.error('Sprint adjustment error:', error);
    throw error;
  }
} 