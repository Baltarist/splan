import { PrismaClient } from '@prisma/client';
import { monitorAIRequest } from '../config/monitoring';
import { cacheService } from './cacheService';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class AdvancedAnalyticsService {
  // Get comprehensive productivity metrics
  async getProductivityMetrics(userId: string, timeframe: 'week' | 'month' | 'year' = 'month') {
    const startDate = new Date();
    if (timeframe === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeframe === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (timeframe === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const tasks = await prisma.task.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'DONE').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const taskDurations = tasks
      .filter(task => task.actualHours && task.actualHours > 0)
      .map(task => task.actualHours!);
    
    const averageTaskDuration = taskDurations.length > 0 
      ? taskDurations.reduce((sum, duration) => sum + duration, 0) / taskDurations.length 
      : 0;

    const productivityScore = Math.min(100, completionRate * 0.6 + (100 - averageTaskDuration * 10) * 0.4);

    // Calculate weekly trend (last 4 weeks)
    const weeklyTrend = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= weekStart && taskDate <= weekEnd;
      });

      const weekCompleted = weekTasks.filter(task => task.status === 'DONE').length;
      const weekTotal = weekTasks.length;
      const weekRate = weekTotal > 0 ? (weekCompleted / weekTotal) * 100 : 0;

      weeklyTrend.push(weekRate);
    }

    return {
      totalTasks,
      completedTasks,
      completionRate,
      averageTaskDuration,
      productivityScore: Math.round(productivityScore),
      weeklyTrend,
      timeframe,
    };
  }

  // Predict task completion time
  async predictTaskCompletion(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // Simple ML-based prediction (in real implementation, this would use actual ML models)
    const baseHours = task.estimatedHours || 4;
    const complexity = this.calculateTaskComplexity(task);
    const userHistory = await this.getUserTaskHistory(task.userId);
    
    const predictedHours = baseHours * complexity * userHistory.efficiencyFactor;
    const estimatedCompletionDate = new Date();
    estimatedCompletionDate.setHours(estimatedCompletionDate.getHours() + predictedHours);

    const confidence = Math.min(95, 70 + (userHistory.consistencyScore * 25));
    
    const riskFactors = [];
    if (task.dependencies) {
      riskFactors.push('Task has dependencies');
    }
    if (predictedHours > 8) {
      riskFactors.push('High estimated effort');
    }
    if (userHistory.consistencyScore < 0.7) {
      riskFactors.push('Variable completion patterns');
    }

    const recommendations = [
      'Break down complex tasks into smaller subtasks',
      'Set intermediate milestones',
      'Allocate buffer time for unexpected issues',
    ];

    return {
      estimatedCompletionDate,
      confidence: Math.round(confidence),
      riskFactors,
      recommendations,
    };
  }

  // Get personalized user insights
  async getUserInsights(userId: string) {
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const timeEntries = await prisma.timeEntry.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      take: 100,
    });

    // Analyze productivity patterns
    const productivityPatterns = this.analyzeProductivityPatterns(tasks, timeEntries);
    
    // Find peak hours
    const peakHours = this.findPeakHours(timeEntries);
    
    // Analyze preferred task types
    const preferredTaskTypes = this.analyzeTaskTypes(tasks);
    
    // Identify improvement areas
    const improvementAreas = this.identifyImprovementAreas(tasks);
    
    // Identify strengths
    const strengths = this.identifyStrengths(tasks);

    return {
      productivityPatterns,
      peakHours,
      preferredTaskTypes,
      improvementAreas,
      strengths,
    };
  }

  // Get personalized recommendations
  async getRecommendations(userId: string) {
    const insights = await this.getUserInsights(userId);
    const recommendations = [];

    // Generate recommendations based on insights
    if (insights.improvementAreas.includes('Time Management')) {
      recommendations.push('Implement time-blocking techniques to improve focus');
    }
    
    if (insights.improvementAreas.includes('Task Completion')) {
      recommendations.push('Break down large tasks into smaller, manageable pieces');
    }
    
    if (insights.peakHours.length === 0) {
      recommendations.push('Schedule important tasks during your most productive hours');
    }
    
    if (insights.productivityPatterns.includes('Procrastination')) {
      recommendations.push('Use the Pomodoro technique to maintain focus');
    }

    // Add general recommendations
    recommendations.push('Review and update task priorities daily');
    recommendations.push('Set realistic deadlines and track progress regularly');

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  // Get team analytics
  async getTeamAnalytics(userId: string, teamId?: string) {
    // For now, return individual analytics (team functionality can be added later)
    const userMetrics = await this.getProductivityMetrics(userId);
    
    return {
      teamSize: 1,
      averageProductivity: userMetrics.productivityScore,
      topPerformers: [{
        userId,
        productivityScore: userMetrics.productivityScore,
        completionRate: userMetrics.completionRate,
      }],
      teamTrends: {
        productivity: [userMetrics.productivityScore],
        completion: [userMetrics.completionRate],
      },
    };
  }

  // Get performance trends
  async getPerformanceTrends(userId: string, period: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const tasks = await prisma.task.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Calculate daily trends
    const trends = [];
    const currentDate = new Date(startDate);

    while (currentDate <= new Date()) {
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate.toDateString() === currentDate.toDateString();
      });

      const completedTasks = dayTasks.filter(task => task.status === 'DONE').length;
      const totalTasks = dayTasks.length;

      trends.push({
        date: currentDate.toISOString().split('T')[0],
        completed: completedTasks,
        total: totalTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      trends,
      period,
      averageCompletionRate: trends.reduce((sum, day) => sum + day.completionRate, 0) / trends.length,
    };
  }

  // Get productivity comparison
  async getProductivityComparison(userId: string, compareWith: string = 'previous') {
    const currentPeriod = await this.getProductivityMetrics(userId, 'month');
    
    let comparisonPeriod;
    if (compareWith === 'previous') {
      // Get previous month metrics
      const previousMonthStart = new Date();
      previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);
      
      const previousTasks = await prisma.task.findMany({
        where: {
          userId,
          createdAt: { gte: previousMonthStart },
        },
      });

      const totalTasks = previousTasks.length;
      const completedTasks = previousTasks.filter(task => task.status === 'DONE').length;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      comparisonPeriod = {
        totalTasks,
        completedTasks,
        completionRate,
        productivityScore: completionRate * 0.4 + 50, // Simplified calculation
      };
    } else {
      // Compare with team average (simplified)
      comparisonPeriod = {
        totalTasks: 0,
        completedTasks: 0,
        completionRate: 75, // Default benchmark
        productivityScore: 75,
      };
    }

    const comparison = {
      current: currentPeriod,
      comparison: comparisonPeriod,
      improvement: {
        productivityScore: currentPeriod.productivityScore - comparisonPeriod.productivityScore,
        completionRate: currentPeriod.completionRate - comparisonPeriod.completionRate,
        percentage: ((currentPeriod.productivityScore - comparisonPeriod.productivityScore) / comparisonPeriod.productivityScore) * 100,
      },
    };

    return comparison;
  }

  // Get AI-powered insights
  async getAIInsights(userId: string) {
    const [productivityMetrics, userInsights, recommendations] = await Promise.all([
      this.getProductivityMetrics(userId),
      this.getUserInsights(userId),
      this.getRecommendations(userId),
    ]);

    const aiInsights = {
      summary: this.generateAISummary(productivityMetrics, userInsights),
      keyMetrics: {
        productivityScore: productivityMetrics.productivityScore,
        completionRate: productivityMetrics.completionRate,
        averageTaskDuration: productivityMetrics.averageTaskDuration,
      },
      patterns: userInsights.productivityPatterns,
      recommendations: recommendations.slice(0, 3), // Top 3 recommendations
      nextSteps: this.generateNextSteps(productivityMetrics, userInsights),
    };

    return aiInsights;
  }

  // Helper methods
  private calculateTaskComplexity(task: any): number {
    let complexity = 1.0;
    
    if (task.description && task.description.length > 200) complexity += 0.2;
    if (task.dependencies) complexity += 0.3;
    if (task.priority === 'HIGH') complexity += 0.2;
    if (task.estimatedHours && task.estimatedHours > 8) complexity += 0.3;
    
    return Math.min(complexity, 2.0);
  }

  private async getUserTaskHistory(userId: string) {
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const completedTasks = tasks.filter(task => task.status === 'DONE');
    const completionRate = tasks.length > 0 ? completedTasks.length / tasks.length : 0;
    
    // Calculate consistency score
    const completionRates = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= weekStart && taskDate <= weekEnd;
      });

      const weekCompleted = weekTasks.filter(task => task.status === 'DONE').length;
      const weekRate = weekTasks.length > 0 ? weekCompleted / weekTasks.length : 0;
      completionRates.push(weekRate);
    }

    const consistencyScore = completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length;
    const efficiencyFactor = 1.0 + (completionRate - 0.5) * 0.5; // 0.75 to 1.25

    return {
      completionRate,
      consistencyScore,
      efficiencyFactor,
    };
  }

  private analyzeProductivityPatterns(tasks: any[], timeEntries: any[]): string[] {
    const patterns = [];
    
    // Analyze completion patterns
    const completionRates = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= weekStart && taskDate <= weekEnd;
      });

      const weekCompleted = weekTasks.filter(task => task.status === 'DONE').length;
      const weekRate = weekTasks.length > 0 ? weekCompleted / weekTasks.length : 0;
      completionRates.push(weekRate);
    }

    const avgRate = completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length;
    
    if (avgRate < 0.5) patterns.push('Low completion rate');
    if (avgRate > 0.8) patterns.push('High completion rate');
    
    const variance = completionRates.reduce((sum, rate) => sum + Math.pow(rate - avgRate, 2), 0) / completionRates.length;
    if (variance > 0.1) patterns.push('Inconsistent performance');
    if (variance < 0.05) patterns.push('Consistent performance');

    return patterns;
  }

  private findPeakHours(timeEntries: any[]): string[] {
    const hourlyProductivity: Record<number, number> = {};
    
    timeEntries.forEach(entry => {
      if (entry.endTime) {
        const startHour = new Date(entry.startTime).getHours();
        const endHour = new Date(entry.endTime).getHours();
        const duration = (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / (1000 * 60 * 60);
        
        for (let hour = startHour; hour <= endHour; hour++) {
          hourlyProductivity[hour] = (hourlyProductivity[hour] || 0) + duration;
        }
      }
    });

    const sortedHours = Object.entries(hourlyProductivity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => `${hour}:00`);

    return sortedHours;
  }

  private analyzeTaskTypes(tasks: any[]): string[] {
    const taskTypes: Record<string, number> = {};
    
    tasks.forEach(task => {
      const type = task.category || 'General';
      taskTypes[type] = (taskTypes[type] || 0) + 1;
    });

    return Object.entries(taskTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);
  }

  private identifyImprovementAreas(tasks: any[]): string[] {
    const areas = [];
    
    const completionRate = tasks.filter(task => task.status === 'DONE').length / tasks.length;
    if (completionRate < 0.7) areas.push('Task Completion');
    
    const overdueTasks = tasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
    ).length;
    if (overdueTasks > tasks.length * 0.2) areas.push('Time Management');
    
    const avgDuration = tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0) / tasks.length;
    if (avgDuration > 8) areas.push('Task Estimation');
    
    return areas;
  }

  private identifyStrengths(tasks: any[]): string[] {
    const strengths = [];
    
    const completionRate = tasks.filter(task => task.status === 'DONE').length / tasks.length;
    if (completionRate > 0.8) strengths.push('High completion rate');
    
    const onTimeTasks = tasks.filter(task => 
      task.dueDate && new Date(task.dueDate) >= new Date() && task.status === 'DONE'
    ).length;
    if (onTimeTasks > tasks.length * 0.7) strengths.push('Meeting deadlines');
    
    const highPriorityCompleted = tasks.filter(task => 
      task.priority === 'HIGH' && task.status === 'DONE'
    ).length;
    if (highPriorityCompleted > 0) strengths.push('Prioritization skills');
    
    return strengths;
  }

  private generateAISummary(metrics: any, insights: any): string {
    const score = metrics.productivityScore;
    
    if (score >= 80) {
      return "Excellent productivity! You're performing at a high level with consistent task completion and efficient time management.";
    } else if (score >= 60) {
      return "Good productivity with room for improvement. Focus on completing tasks on time and optimizing your workflow.";
    } else {
      return "There's significant potential for improvement. Consider implementing time management strategies and breaking down complex tasks.";
    }
  }

  private generateNextSteps(metrics: any, insights: any): string[] {
    const steps = [];
    
    if (metrics.completionRate < 70) {
      steps.push("Set more realistic task estimates");
      steps.push("Prioritize tasks based on importance and urgency");
    }
    
    if (metrics.averageTaskDuration > 8) {
      steps.push("Break down large tasks into smaller subtasks");
      steps.push("Implement time-blocking techniques");
    }
    
    if (insights.improvementAreas.length > 0) {
      steps.push(`Focus on improving: ${insights.improvementAreas[0]}`);
    }
    
    return steps.slice(0, 3);
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService(); 