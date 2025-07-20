import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AIPromptContext {
  userId: string;
  goalId?: string;
  conversationId?: string;
  userPreferences: Record<string, unknown>;
}

interface ScopeResult {
  scope: string;
  confidence: number;
}

interface SprintPlanResult {
  plan: string;
  tasks: Array<{
    title: string;
    description: string;
    estimatedHours: number;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>;
}

interface ProductivityAnalysis {
  summary: string;
  insights: string[];
  recommendations: string[];
}

class OpenAIService {
  private static instance: OpenAIService;
  private rateLimitMap: Map<string, number> = new Map();
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute
  private readonly MAX_REQUESTS_PER_WINDOW = 10;
  private readonly OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  private readonly OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4';
  private readonly OPENAI_MAX_TOKENS = parseInt(process.env.OPENAI_MAX_TOKENS || '2000');

  private constructor() {
    if (!this.OPENAI_API_KEY) {
      console.warn('OpenAI API key not found. AI features will use fallback responses.');
    }
  }

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userRequests = this.rateLimitMap.get(userId) || 0;
    
    if (now - userRequests > this.RATE_LIMIT_WINDOW) {
      this.rateLimitMap.set(userId, now);
      return true;
    }
    
    if (userRequests < this.MAX_REQUESTS_PER_WINDOW) {
      this.rateLimitMap.set(userId, userRequests + 1);
      return true;
    }
    
    return false;
  }

  private async callOpenAI(prompt: string, options: { maxTokens?: number; temperature?: number } = {}): Promise<string> {
    if (!this.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.OPENAI_MODEL,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: options.maxTokens || this.OPENAI_MAX_TOKENS,
          temperature: options.temperature || 0.7,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as any;
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json() as any;
      return data.choices[0].message.content;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('OpenAI API request timed out');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  public async generateScopeDocument(
    title: string, 
    description: string, 
    context: AIPromptContext
  ): Promise<ScopeResult> {
    if (!this.checkRateLimit(context.userId)) {
      throw new Error('Rate limit exceeded');
    }

    try {
      const prompt = `Generate a detailed scope document for the following goal:
Title: ${title}
Description: ${description}
User Preferences: ${JSON.stringify(context.userPreferences)}

Please provide a comprehensive scope document with clear objectives, deliverables, and success criteria. Format the response as a markdown document.`;

      const response = await this.callOpenAI(prompt, {
        maxTokens: 2000,
        temperature: 0.5,
      });

      return {
        scope: response,
        confidence: 0.85
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to mock response
      return {
        scope: `# Scope Document: ${title}

## Overview
${description}

## Objectives
- Define clear project goals
- Establish success criteria
- Identify key deliverables

## Deliverables
1. Project plan
2. Technical specifications
3. Timeline and milestones

## Success Criteria
- All objectives met within timeline
- Stakeholder satisfaction
- Quality standards maintained

## Assumptions
- Team availability
- Resource allocation
- Technology stack

## Constraints
- Budget limitations
- Time constraints
- Technical limitations`,
        confidence: 0.6
      };
    }
  }

  public async generateSprintPlan(
    goalId: string, 
    sprintDuration: number, 
    context: AIPromptContext
  ): Promise<SprintPlanResult> {
    if (!this.checkRateLimit(context.userId)) {
      throw new Error('Rate limit exceeded');
    }

    // Get goal details from database
    const goal = await prisma.goal.findUnique({
      where: { id: goalId }
    });

    if (!goal) {
      throw new Error('Goal not found');
    }

    try {
      const prompt = `Generate a sprint plan for the following goal:
Goal: ${goal.title}
Description: ${goal.description}
Sprint Duration: ${sprintDuration} days
User Preferences: ${JSON.stringify(context.userPreferences)}

Please break down the goal into manageable tasks with time estimates and priorities. Return the response as a JSON object with the following structure:
{
  "plan": "Sprint plan description",
  "tasks": [
    {
      "title": "Task title",
      "description": "Task description",
      "estimatedHours": 8,
      "priority": "HIGH"
    }
  ]
}`;

      const response = await this.callOpenAI(prompt, {
        maxTokens: 1500,
        temperature: 0.6,
      });

      try {
        const parsedResponse = JSON.parse(response);
        return {
          plan: parsedResponse.plan || `Sprint Plan for ${goal.title}`,
          tasks: parsedResponse.tasks || []
        };
      } catch (parseError) {
        // If JSON parsing fails, return fallback
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to mock response
      return {
        plan: `# Sprint Plan for ${goal.title}

## Sprint Overview
Duration: ${sprintDuration} days
Goal: ${goal.title}

## Sprint Goals
- Break down the main goal into actionable tasks
- Establish clear priorities and time estimates
- Define acceptance criteria for each task

## Sprint Backlog
The following tasks have been identified and prioritized based on the goal requirements.`,
        tasks: [
          {
            title: 'Project Setup and Planning',
            description: 'Initialize project structure and create detailed planning documents',
            estimatedHours: 8,
            priority: 'HIGH'
          },
          {
            title: 'Core Feature Development',
            description: 'Implement the main functionality as outlined in the scope',
            estimatedHours: 24,
            priority: 'HIGH'
          },
          {
            title: 'Testing and Quality Assurance',
            description: 'Comprehensive testing of all implemented features',
            estimatedHours: 12,
            priority: 'MEDIUM'
          },
          {
            title: 'Documentation and Review',
            description: 'Create user documentation and conduct code reviews',
            estimatedHours: 8,
            priority: 'MEDIUM'
          },
          {
            title: 'Deployment Preparation',
            description: 'Prepare for deployment and final testing',
            estimatedHours: 6,
            priority: 'LOW'
          }
        ]
      };
    }
  }

  public async generateDailyStandupResponse(
    message: string, 
    context: AIPromptContext
  ): Promise<string> {
    if (!this.checkRateLimit(context.userId)) {
      throw new Error('Rate limit exceeded');
    }

    try {
      const prompt = `Generate a helpful response for a daily standup message:
User Message: ${message}
User Preferences: ${JSON.stringify(context.userPreferences)}

Please provide a supportive and actionable response that helps the user with their daily standup. Keep the response concise and encouraging.`;

      const response = await this.callOpenAI(prompt, {
        maxTokens: 500,
        temperature: 0.8,
      });

      return response;
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to mock response
      return `Great update! Based on what you've shared, here are some suggestions:

**Yesterday's Progress:**
- Well done on completing the planned tasks
- Good progress on the ongoing work

**Today's Focus:**
- Continue with the current priorities
- Address any blockers that came up
- Stay focused on the sprint goals

**Potential Blockers:**
- If you encounter any issues, don't hesitate to reach out
- Consider breaking down complex tasks into smaller pieces

Keep up the great work! 🚀`;
    }
  }

  public async analyzeProductivity(
    userId: string, 
    timeRange: { start: Date; end: Date }
  ): Promise<ProductivityAnalysis> {
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded');
    }

    // Get user's tasks data
    const tasks = await prisma.task.findMany({
      where: {
        userId,
        createdAt: {
          gte: timeRange.start,
          lte: timeRange.end
        }
      }
    });

    try {
      const prompt = `Analyze productivity data for the user:
Time Range: ${timeRange.start.toISOString()} to ${timeRange.end.toISOString()}
Tasks Completed: ${tasks.filter(t => t.status === 'DONE').length}
Total Tasks: ${tasks.length}
Task Details: ${JSON.stringify(tasks.map(t => ({ title: t.title, status: t.status, priority: t.priority })))}

Please provide insights and recommendations for improving productivity. Return the response as a JSON object with the following structure:
{
  "summary": "Overall productivity summary",
  "insights": ["insight 1", "insight 2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}`;

      const response = await this.callOpenAI(prompt, {
        maxTokens: 1000,
        temperature: 0.6,
      });

      try {
        const parsedResponse = JSON.parse(response);
        return {
          summary: parsedResponse.summary || 'Productivity analysis completed',
          insights: parsedResponse.insights || [],
          recommendations: parsedResponse.recommendations || []
        };
      } catch (parseError) {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to mock response
      return {
        summary: `Productivity Analysis for ${timeRange.start.toDateString()} - ${timeRange.end.toDateString()}

You completed ${tasks.filter(t => t.status === 'DONE').length} out of ${tasks.length} tasks during this period, showing consistent progress toward your goals.`,
        insights: [
          'You\'re maintaining good task completion rates',
          'Most tasks are being completed within estimated timeframes',
          'Good progress on ongoing work'
        ],
        recommendations: [
          'Consider breaking down larger tasks for better progress tracking',
          'Schedule regular breaks to maintain productivity',
          'Review and adjust time estimates based on actual completion times'
        ]
      };
    }
  }

  public async getConversationContext(conversationId: string): Promise<Record<string, unknown>> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!conversation) {
      return {};
    }

    return {
      conversationType: conversation.type,
      recentMessages: conversation.messages.map(msg => ({
        role: msg.role,
        content: msg.content.substring(0, 100) + '...'
      })),
      context: conversation.context ? JSON.parse(conversation.context) : {}
    };
  }
}

export default OpenAIService.getInstance(); 