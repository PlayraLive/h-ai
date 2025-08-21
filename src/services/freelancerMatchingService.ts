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
      console.log('🔍 Поиск фрилансеров для требований:', jobRequirements);
      
      // Получаем всех фрилансеров
      const freelancersResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [
          Query.equal('userType', 'freelancer'),
          Query.limit(100), // Ограничиваем для производительности
          // Query.orderDesc('rating') // Убираем сортировку по рейтингу пока не исправим
        ]
      );

      const freelancers = freelancersResponse.documents as FreelancerProfile[];
      
      console.log('🔍 Найдено фрилансеров в базе:', freelancers.length);
      if (freelancers.length > 0) {
        console.log('🔍 Первый фрилансер:', {
          id: freelancers[0].$id,
          name: freelancers[0].name,
          skills: freelancers[0].skills,
          userType: freelancers[0].userType
        });
      }

      // Вычисляем совпадения для каждого фрилансера
      const matches: MatchScore[] = [];

      for (const freelancer of freelancers) {
        try {
          const matchScore = this.calculateMatchScore(freelancer, jobRequirements);
          if (matchScore.score > 0.1) { // Снижаем минимальный порог совпадения
            matches.push(matchScore);
          }
        } catch (error) {
          console.warn('Ошибка вычисления матча для фрилансера:', freelancer.$id, error);
        }
      }

      console.log('🔍 Вычислено матчей:', matches.length);

      // Сортируем по убыванию рейтинга совпадения
      matches.sort((a, b) => b.score - a.score);

      // Берем топ результатов
      const topMatches = matches.slice(0, limit);
      const matchingFreelancers = topMatches.map(match => 
        freelancers.find(f => f.$id === match.freelancerId)!
      ).filter(Boolean); // Убираем undefined

      console.log('🔍 Возвращаем фрилансеров:', matchingFreelancers.length);

      return {
        freelancers: matchingFreelancers,
        matches: topMatches
      };
    } catch (error) {
      console.error('❌ Ошибка поиска фрилансеров:', error);
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
    console.log('🔍 Вычисляем матч для фрилансера:', freelancer.name, 'ID:', freelancer.$id);
    console.log('🔍 Навыки фрилансера:', freelancer.skills);
    console.log('🔍 Требуемые навыки:', jobRequirements.skills);
    
    const reasons: string[] = [];
    let totalScore = 0;

    // 1. Совпадение навыков (50% от общего рейтинга)
    const skillsMatch = this.calculateSkillsMatch(freelancer.skills || [], jobRequirements.skills);
    const skillsScore = skillsMatch * 0.5;
    totalScore += skillsScore;

    if (skillsMatch > 0.7) {
      reasons.push('Отличное совпадение навыков');
    } else if (skillsMatch > 0.4) {
      reasons.push('Хорошее совпадение навыков');
    } else if (skillsMatch > 0.1) {
      reasons.push('Частичное совпадение навыков');
    }

    // 2. Рейтинг фрилансера (20% от общего рейтинга)
    const rating = freelancer.rating || 0;
    const ratingScore = (rating / 5) * 0.2;
    totalScore += ratingScore;

    if (rating >= 4.5) {
      reasons.push('Высокий рейтинг');
    } else if (rating >= 4.0) {
      reasons.push('Хороший рейтинг');
    } else if (rating > 0) {
      reasons.push('Есть рейтинг');
    }

    // 3. Опыт работы (20% от общего рейтинга)
    const completedJobs = freelancer.completedJobs || 0;
    const experienceScore = Math.min(completedJobs / 20, 1) * 0.2; // Максимум при 20+ проектах
    totalScore += experienceScore;

    if (completedJobs >= 10) {
      reasons.push('Большой опыт работы');
    } else if (completedJobs >= 3) {
      reasons.push('Достаточный опыт');
    } else if (completedJobs > 0) {
      reasons.push('Есть опыт');
    }

    // 4. Доступность (5% от общего рейтинга)
    const availabilityScore = freelancer.availability === 'available' ? 0.05 : 0.025;
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

    const finalScore = Math.min(totalScore, 1);
    console.log('🔍 Финальный матч для', freelancer.name, ':', finalScore, 'Причины:', reasons);
    
    return {
      freelancerId: freelancer.$id,
      score: finalScore, // Максимум 1.0
      skillsMatch,
      ratingScore: rating / 5,
      experienceScore: Math.min(completedJobs / 20, 1),
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
    if (freelancerSkills.length === 0) return 0; // Нет навыков у фрилансера

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
   * Фильтровать фрилансеров по дополнительным критериям
   */
  static filterFreelancers(
    freelancers: FreelancerProfile[],
    filters: {
      minRating?: number;
      maxHourlyRate?: number;
      verified?: boolean;
      available?: boolean;
    }
  ): FreelancerProfile[] {
    let filtered = [...freelancers];

    if (filters.minRating && filters.minRating > 0) {
      filtered = filtered.filter(f => (f.rating || 0) >= filters.minRating!);
    }

    if (filters.maxHourlyRate && filters.maxHourlyRate < 1000) {
      filtered = filtered.filter(f => (f.hourlyRate || 0) <= filters.maxHourlyRate!);
    }

    if (filters.verified) {
      filtered = filtered.filter(f => f.verification_status === 'verified');
    }

    if (filters.available) {
      filtered = filtered.filter(f => f.availability === 'available');
    }

    return filtered;
  }

  /**
   * Получить топ фрилансеров по рейтингу
   */
  static async getTopFreelancers(limit: number = 10): Promise<FreelancerProfile[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [
          Query.equal('userType', 'freelancer'),
          Query.limit(limit),
          Query.orderDesc('$createdAt') // Сортируем по дате создания
        ]
      );

      return response.documents as FreelancerProfile[];
    } catch (error) {
      console.error('Error getting top freelancers:', error);
      return [];
    }
  }

  /**
   * Получить фрилансеров по навыкам
   */
  static async getFreelancersBySkills(skills: string[], limit: number = 10): Promise<FreelancerProfile[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [
          Query.equal('userType', 'freelancer'),
          Query.limit(limit)
        ]
      );

      const freelancers = response.documents as FreelancerProfile[];
      
      // Фильтруем по навыкам
      return freelancers.filter(freelancer => 
        freelancer.skills && freelancer.skills.some(skill =>
          skills.some(requiredSkill =>
            skill.toLowerCase().includes(requiredSkill.toLowerCase()) ||
            requiredSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    } catch (error) {
      console.error('Error getting freelancers by skills:', error);
      return [];
    }
  }
}
