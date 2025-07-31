'use client';

import { AISpecialist } from '@/types';

export class AITimelineResponder {
  private static responses = {
    milestoneCompleted: [
      "🎉 Отлично! Я завершил этот этап. Пожалуйста, проверьте результат и дайте обратную связь.",
      "✅ Этап выполнен! Загрузил все необходимые файлы. Жду вашего одобрения.",
      "🚀 Готово! Проверьте результат работы. Если есть замечания - с радостью внесу правки.",
      "💯 Этап завершен согласно техническому заданию. Ваши комментарии помогут сделать результат еще лучше!"
    ],
    
    milestoneApproved: [
      "🙏 Спасибо за одобрение! Сразу приступаю к следующему этапу.",
      "✨ Отлично! Рад, что результат вам понравился. Переходим к следующей задаче!",
      "🎯 Супер! Следующий этап уже в работе. Ожидайте обновления в ближайшее время.",
      "⚡ Замечательно! Продолжаю работу с тем же качеством и вниманием к деталям."
    ],
    
    milestoneRejected: [
      "📝 Понял ваши замечания. Внесу все правки и загружу обновленную версию.",
      "🔄 Спасибо за детальную обратную связь! Исправлю все моменты и пришлю доработанный вариант.",
      "💡 Отличные комментарии! Учту все пожелания и сделаю работу еще лучше.",
      "🎨 Принял к сведению! Доработаю согласно вашим требованиям."
    ],
    
    filesUploaded: [
      "📎 Загрузил файлы для текущего этапа. Все готово к проверке!",
      "💼 Файлы добавлены! Можете скачать и оценить результат работы.",
      "🗂️ Материалы загружены. Если нужны дополнительные форматы - дайте знать!",
      "📋 Deliverables готовы! Проверьте качество и соответствие требованиям."
    ],
    
    orderStarted: [
      "🚀 Отлично! Заказ принят в работу. Начинаю с первого этапа.",
      "✨ Спасибо за доверие! Уже приступил к выполнению вашего заказа.",
      "🎯 Заказ в работе! Первые результаты будут готовы в указанные сроки.",
      "⚡ Начинаем! Обещаю качественный результат в обозначенное время."
    ],
    
    orderCompleted: [
      "🎉 Проект завершен! Было приятно работать с вами.",
      "✅ Все этапы выполнены! Надеюсь, результат превзошел ожидания.",
      "🌟 Работа завершена! Буду рад сотрудничеству в будущих проектах.",
      "💯 Проект готов! Спасибо за возможность реализовать ваше видение."
    ]
  };

  private static getRandomResponse(type: keyof typeof AITimelineResponder.responses): string {
    const responses = this.responses[type];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private static getSpecialistPersonality(specialistId: string): string {
    const personalities = {
      'alex-ai': '🤖 Как ваш AI-помощник, ',
      'luna-design': '🎨 С творческим подходом ',
      'viktor-reels': '🎬 С энергией создателя контента ',
      'max-bot': '⚡ С технической точностью '
    };
    return personalities[specialistId as keyof typeof personalities] || '✨ ';
  }

  static generateResponse(
    action: 'completed' | 'approved' | 'rejected' | 'files_uploaded' | 'started' | 'finished',
    specialist: AISpecialist,
    context?: {
      milestoneName?: string;
      fileCount?: number;
      feedback?: string;
    }
  ): string {
    const personality = this.getSpecialistPersonality(specialist.id);
    
    switch (action) {
      case 'completed':
        return personality + this.getRandomResponse('milestoneCompleted');
        
      case 'approved':
        return personality + this.getRandomResponse('milestoneApproved');
        
      case 'rejected':
        const response = this.getRandomResponse('milestoneRejected');
        return personality + response + (context?.feedback ? `\n\n📋 **Ваши замечания:**\n${context.feedback}` : '');
        
      case 'files_uploaded':
        const filesResponse = this.getRandomResponse('filesUploaded');
        const fileInfo = context?.fileCount ? ` (${context.fileCount} файлов)` : '';
        return personality + filesResponse + fileInfo;
        
      case 'started':
        return personality + this.getRandomResponse('orderStarted');
        
      case 'finished':
        return personality + this.getRandomResponse('orderCompleted');
        
      default:
        return personality + 'Продолжаю работу над вашим проектом! 🚀';
    }
  }

  static async sendAIResponse(
    action: 'completed' | 'approved' | 'rejected' | 'files_uploaded' | 'started' | 'finished',
    specialist: AISpecialist,
    onSendMessage?: (content: string, type?: 'text' | 'milestone' | 'payment') => void,
    context?: {
      milestoneName?: string;
      fileCount?: number;
      feedback?: string;
    }
  ): Promise<void> {
    if (!onSendMessage) return;

    // Небольшая задержка для реалистичности
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const response = this.generateResponse(action, specialist, context);
    await onSendMessage(response, 'text');
  }
}