import { PrismaClient } from '@prisma/client';
import openaiService from './openaiService';

const prisma = new PrismaClient();

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  messages: AIMessage[];
  context?: string | undefined;
  summary?: string | undefined;
}

// Fallback responses when OpenAI is not available
const fallbackResponses = {
  greeting: "Merhaba! Ben Splan AI Assistant'ınız. Hedeflerinizi görüyorum ve size yardım etmek için buradayım. Şu anda 'Test Goal' adında bir hedefiniz var ve bu hedefi gerçekleştirmek için size öneriler sunabilirim.",
  goalAdvice: "Hedeflerinizi gerçekleştirmek için şu adımları öneriyorum:\n1. Hedefinizi küçük parçalara bölün\n2. Her parça için somut görevler oluşturun\n3. Günlük ve haftalık planlar yapın\n4. İlerlemenizi takip edin\n5. Gerekirse hedeflerinizi revize edin",
  productivity: "Üretkenliğinizi artırmak için:\n- Pomodoro tekniğini kullanın\n- Günlük önceliklerinizi belirleyin\n- Dikkat dağıtıcıları minimize edin\n- Düzenli molalar verin\n- Hedeflerinizi görselleştirin"
};

export const aiService = {
  // AI ile sohbet
  async chat(userId: string, message: string, conversationId?: string): Promise<{ response: string; conversationId: string }> {
    try {
      let conversation: any;
      
      if (conversationId) {
        conversation = await prisma.conversation.findFirst({
          where: { id: conversationId, userId },
          include: { messages: true }
        });
      }

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            userId,
            type: 'ai_chat',
            context: 'Splan AI Assistant - Productivity and Goal Management'
          },
          include: { messages: true }
        });
      }

      // Try to get AI response from OpenAI
      let aiResponse: string;
      try {
        const context = await openaiService.getConversationContext(conversation.id);
        aiResponse = await openaiService.generateDailyStandupResponse(message, {
          userId,
          conversationId: conversation.id,
          userPreferences: context
        });
      } catch (openaiError) {
        console.error('OpenAI service error, using fallback:', openaiError);
        
        // Fallback to simple response logic
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('merhaba') || lowerMessage.includes('selam')) {
          aiResponse = fallbackResponses.greeting;
        } else if (lowerMessage.includes('hedef') || lowerMessage.includes('goal')) {
          aiResponse = fallbackResponses.goalAdvice;
        } else if (lowerMessage.includes('üretken') || lowerMessage.includes('productivity')) {
          aiResponse = fallbackResponses.productivity;
        } else {
          aiResponse = "Teşekkürler! Size nasıl yardımcı olabilirim? Hedefleriniz, görevleriniz veya üretkenliğiniz hakkında sorular sorabilirsiniz.";
        }
      }

      // Mesajları kaydet
      await prisma.message.createMany({
        data: [
          {
            conversationId: conversation.id,
            role: 'user',
            content: message
          },
          {
            conversationId: conversation.id,
            role: 'assistant',
            content: aiResponse
          }
        ]
      });

      return {
        response: aiResponse,
        conversationId: conversation.id
      };
    } catch (error) {
      console.error('AI Chat Error:', error);
      throw new Error('AI servisi şu anda kullanılamıyor');
    }
  },

  // Hedef önerileri
  async suggestGoals(userId: string, context?: string): Promise<string[]> {
    try {
      // Try to get AI suggestions
      try {
        const prompt = `Based on the following context, suggest 4 relevant goals for a productivity app user:
Context: ${context || 'Productivity and goal management'}

Please provide 4 specific, actionable goals that would help improve productivity and personal development.`;

        const response = await openaiService.generateDailyStandupResponse(prompt, {
          userId,
          userPreferences: { context }
        });

        // Parse the response to extract goals
        const lines = response.split('\n').filter(line => line.trim().length > 0);
        return lines.slice(0, 4).map(line => line.replace(/^\d+\.\s*/, '').trim());
      } catch (openaiError) {
        console.error('OpenAI suggestions error, using fallback:', openaiError);
        
        // Fallback suggestions
        return [
          "Yeni Teknoloji Öğrenme - React Native ve AI teknolojilerini öğrenmek",
          "Fitness Hedefi - Haftada 3 gün spor yapmak",
          "Kitap Okuma - Ayda 2 kitap okumak",
          "Yeni Dil Öğrenme - İngilizce seviyesini geliştirmek"
        ];
      }
    } catch (error) {
      console.error('Goal Suggestions Error:', error);
      return [];
    }
  },

  // Görev önerileri
  async suggestTasks(userId: string, goalId?: string): Promise<string[]> {
    try {
      // Try to get AI suggestions
      try {
        let prompt = 'Suggest 5 actionable tasks for improving productivity and goal achievement:';
        
        if (goalId) {
          const goal = await prisma.goal.findUnique({
            where: { id: goalId, userId }
          });
          if (goal) {
            prompt = `Based on the goal "${goal.title}" (${goal.description || 'No description'}), suggest 5 specific tasks that would help achieve this goal:`;
          }
        }

        const response = await openaiService.generateDailyStandupResponse(prompt, {
          userId,
          userPreferences: { goalId }
        });

        // Parse the response to extract tasks
        const lines = response.split('\n').filter(line => line.trim().length > 0);
        return lines.slice(0, 5).map(line => line.replace(/^\d+\.\s*/, '').trim());
      } catch (openaiError) {
        console.error('OpenAI task suggestions error, using fallback:', openaiError);
        
        // Fallback task suggestions
        return [
          "Araştırma Yap - Hedefle ilgili kaynakları araştır",
          "Plan Oluştur - Detaylı bir eylem planı hazırla",
          "Kaynakları Belirle - Gerekli araçları ve kaynakları listele",
          "Zaman Çizelgesi - Hedef için gerçekçi bir zaman planı yap",
          "İlerleme Takibi - Düzenli olarak ilerlemeyi ölç ve kaydet"
        ];
      }
    } catch (error) {
      console.error('Task Suggestions Error:', error);
      return [];
    }
  },

  // Hedef kapsamını yeniden oluştur
  async regenerateGoalScope(userId: string, goalId?: string): Promise<string> {
    try {
      if (!goalId) {
        throw new Error('Goal ID is required');
      }

      const goal = await prisma.goal.findUnique({
        where: { id: goalId, userId },
        select: { title: true, description: true }
      });

      if (!goal) {
        throw new Error('Hedef bulunamadı');
      }

      // Try to get AI-generated scope
      try {
        const result = await openaiService.generateScopeDocument(
          goal.title,
          goal.description || 'No description provided',
          {
            userId,
            goalId,
            userPreferences: {}
          }
        );
        return result.scope;
      } catch (openaiError) {
        console.error('OpenAI scope generation error, using fallback:', openaiError);
        
        // Fallback scope
        return JSON.stringify({
          title: goal.title,
          description: goal.description || 'Açıklama yok',
          successCriteria: ['Hedef tamamlandı', 'Kalite standartları karşılandı'],
          risks: ['Zaman kısıtlaması', 'Kaynak eksikliği'],
          resources: ['Zaman', 'Enerji', 'Bilgi'],
          timeline: '3-6 ay',
          subGoals: ['Alt hedef 1', 'Alt hedef 2', 'Alt hedef 3']
        }, null, 2);
      }
    } catch (error) {
      console.error('Goal Scope Regeneration Error:', error);
      throw new Error('Hedef kapsamı yeniden oluşturulamadı');
    }
  },

  // Sohbet geçmişini al
  async getConversationHistory(userId: string, conversationId?: string): Promise<AIMessage[]> {
    try {
      if (!conversationId) {
        return [];
      }

      const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, userId },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
      });

      if (!conversation) {
        return [];
      }

      return conversation.messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));
    } catch (error) {
      console.error('Get Conversation History Error:', error);
      return [];
    }
  },

  // Kullanıcının sohbetlerini listele
  async getUserConversations(userId?: string): Promise<AIConversation[]> {
    try {
      if (!userId) {
        return [];
      }

      const conversations = await prisma.conversation.findMany({
        where: { userId, type: 'ai_chat' },
        include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
        orderBy: { updatedAt: 'desc' }
      });

      return conversations.map(conv => ({
        id: conv.id,
        userId: conv.userId,
        messages: conv.messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        context: conv.context || undefined,
        summary: conv.summary || undefined
      }));
    } catch (error) {
      console.error('Get User Conversations Error:', error);
      return [];
    }
  }
}; 