import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/database';
import { Query } from 'appwrite';

export interface FreelancerProfile {
  $id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  skills: string[];
  hourlyRate?: number;
  rating?: number;
  reviewsCount?: number;
  completedJobs?: number;
  location?: string;
  responseTime?: string;
  verification_status?: string;
  availability?: string;
  userType: string;
  languages?: string[];
  experienceLevel?: string;
  totalEarned?: number;
}

export interface JobRequirements {
  skills: string[];
  experienceLevel?: string;
  budgetMin?: number;
  budgetMax?: number;
  category?: string;
  location?: string;
}

export interface MatchScore {
  freelancerId: string;
  score: number;
  skillsMatch: number;
  ratingScore: number;
  experienceScore: number;
  availabilityScore: number;
  budgetCompatibility: number;
  reasons: string[];
}

export class FreelancerMatchingService {
  /**
   * Найти подходящих фрилансеров для джоба с использованием AI-алгоритма
   */
  static async findMatchingFreelancers(
    jobRequirements: JobRequirements,
    limit: number = 10
  ): Promise<{ freelancers: FreelancerProfile[]; matches: MatchScore[] }> {
    try {
      // Получаем всех фрилансеров
      const freelancersResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [
          Query.equal('userType', 'freelancer'),
          Query.limit(100), // Ограничиваем для производительности
          Query.orderDesc('rating')
        ]
      );

      const freelancers = freelancersResponse.documents as FreelancerProfile[];

      // Вычисляем совпадения для каждого фрилансера
      const matches: MatchScore[] = [];

      for (const freelancer of freelancers) {
        const matchScore = this.calculateMatchScore(freelancer, jobRequirements);
        if (matchScore.score > 0.3) { // Минимальный порог совпадения
          matches.push(matchScore);
        }
      }

      // Сортируем по убыванию рейтинга совпадения
      matches.sort((a, b) => b.score - a.score);

      // Берем топ результатов
      const topMatches = matches.slice(0, limit);
      const matchingFreelancers = topMatches.map(match => 
        freelancers.find(f => f.$id === match.freelancerId)!
      );

      return {
        freelancers: matchingFreelancers,
        matches: topMatches
      };
    } catch (error) {
      console.error('Error finding matching freelancers:', error);
      throw new Error('Failed to find matching freelancers');
    }
  }

  /**
   * Вычислить рейтинг совпадения фрилансера с требованиями джоба
   */
  private static calculateMatchScore(
    freelancer: FreelancerProfile,
    jobRequirements: JobRequirements
  ): MatchScore {
    const reasons: string[] = [];
    let totalScore = 0;

    // 1. Совпадение навыков (40% от общего рейтинга)
    const skillsMatch = this.calculateSkillsMatch(freelancer.skills || [], jobRequirements.skills);
    const skillsScore = skillsMatch * 0.4;
    totalScore += skillsScore;

    if (skillsMatch > 0.7) {
      reasons.push('Отличное совпадение навыков');
    } else if (skillsMatch > 0.4) {
      reasons.push('Хорошее совпадение навыков');
    }

    // 2. Рейтинг фрилансера (25% от общего рейтинга)
    const rating = freelancer.rating || 0;
    const ratingScore = (rating / 5) * 0.25;
    totalScore += ratingScore;

    if (rating >= 4.5) {
      reasons.push('Высокий рейтинг');
    } else if (rating >= 4.0) {
      reasons.push('Хороший рейтинг');
    }

    // 3. Опыт работы (20% от общего рейтинга)
    const completedJobs = freelancer.completedJobs || 0;
    const experienceScore = Math.min(completedJobs / 50, 1) * 0.2; // Максимум при 50+ проектах
    totalScore += experienceScore;

    if (completedJobs >= 20) {
      reasons.push('Большой опыт работы');
    } else if (completedJobs >= 5) {
      reasons.push('Достаточный опыт');
    }

    // 4. Доступность (10% от общего рейтинга)
    const availabilityScore = freelancer.availability === 'available' ? 0.1 : 0.05;
    totalScore += availabilityScore;

    if (freelancer.availability === 'available') {
      reasons.push('Доступен для работы');
    }

    // 5. Совместимость бюджета (5% от общего рейтинга)
    let budgetCompatibility = 0;
    if (freelancer.hourlyRate && jobRequirements.budgetMax) {
      const hourlyRate = freelancer.hourlyRate;
      const maxBudget = jobRequirements.budgetMax;
      
      // Предполагаем 40 часов работы для расчета совместимости
      const estimatedCost = hourlyRate * 40;
      
      if (estimatedCost <= maxBudget) {
        budgetCompatibility = 0.05;
        reasons.push('Подходящая стоимость');
      } else if (estimatedCost <= maxBudget * 1.2) {
        budgetCompatibility = 0.025;
        reasons.push('Приемлемая стоимость');
      }
    } else {
      budgetCompatibility = 0.025; // Нейтральный балл если нет данных
    }
    totalScore += budgetCompatibility;

    // Бонусы
    if (freelancer.verification_status === 'verified') {
      totalScore += 0.05;
      reasons.push('Верифицированный аккаунт');
    }

    if (freelancer.responseTime && this.parseResponseTime(freelancer.responseTime) <= 4) {
      totalScore += 0.03;
      reasons.push('Быстрый отклик');
    }

    return {
      freelancerId: freelancer.$id,
      score: Math.min(totalScore, 1), // Максимум 1.0
      skillsMatch,
      ratingScore: rating / 5,
      experienceScore: Math.min(completedJobs / 50, 1),
      availabilityScore: freelancer.availability === 'available' ? 1 : 0.5,
      budgetCompatibility,
      reasons
    };
  }

  /**
   * Вычислить совпадение навыков
   */
  private static calculateSkillsMatch(freelancerSkills: string[], jobSkills: string[]): number {
    if (jobSkills.length === 0) return 0.5; // Нейтральный балл если навыки не указаны

    const normalizedFreelancerSkills = freelancerSkills.map(skill => skill.toLowerCase().trim());
    const normalizedJobSkills = jobSkills.map(skill => skill.toLowerCase().trim());

    let matchCount = 0;
    let partialMatchCount = 0;

    for (const jobSkill of normalizedJobSkills) {
      // Точное совпадение
      if (normalizedFreelancerSkills.includes(jobSkill)) {
        matchCount++;
        continue;
      }

      // Частичное совпадение (содержит подстроку)
      const hasPartialMatch = normalizedFreelancerSkills.some(freelancerSkill =>
        freelancerSkill.includes(jobSkill) || jobSkill.includes(freelancerSkill)
      );

      if (hasPartialMatch) {
        partialMatchCount++;
      }
    }

    // Точные совпадения весят больше чем частичные
    const score = (matchCount + partialMatchCount * 0.5) / jobSkills.length;
    return Math.min(score, 1);
  }

  /**
   * Парсить время отклика в часы
   */
  private static parseResponseTime(responseTime: string): number {
    const time = responseTime.toLowerCase();
    
    if (time.includes('minute')) {
      const minutes = parseInt(time.match(/\d+/)?.[0] || '60');
      return minutes / 60;
    }
    
    if (time.includes('hour')) {
      return parseInt(time.match(/\d+/)?.[0] || '24');
    }
    
    if (time.includes('day')) {
      const days = parseInt(time.match(/\d+/)?.[0] || '1');
      return days * 24;
    }
    
    return 24; // По умолчанию 24 часа
  }

  /**
   * Получить объяснение почему фрилансер подходит
   */
  static getMatchExplanation(match: MatchScore): string {
    const percentage = Math.round(match.score * 100);
    let explanation = `Совпадение ${percentage}%: `;
    
    if (match.reasons.length > 0) {
      explanation += match.reasons.join(', ');
    } else {
      explanation += 'Базовое совпадение профиля';
    }
    
    return explanation;
  }

  /**
   * Фильтровать фрилансеров по дополнительным критериям
   */
  static filterFreelancers(
    freelancers: FreelancerProfile[],
    filters: {
      minRating?: number;
      maxHourlyRate?: number;
      verified?: boolean;
      available?: boolean;
      location?: string;
    }
  ): FreelancerProfile[] {
    return freelancers.filter(freelancer => {
      if (filters.minRating && (freelancer.rating || 0) < filters.minRating) {
        return false;
      }
      
      if (filters.maxHourlyRate && (freelancer.hourlyRate || 0) > filters.maxHourlyRate) {
        return false;
      }
      
      if (filters.verified && freelancer.verification_status !== 'verified') {
        return false;
      }
      
      if (filters.available && freelancer.availability !== 'available') {
        return false;
      }
      
      if (filters.location && freelancer.location !== filters.location) {
        return false;
      }
      
      return true;
    });
  }
}
