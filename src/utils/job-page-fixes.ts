// Исправления для страницы заказов

// 1. Функция проверки статуса клиента
export const checkIfUserIsClient = async (userId: string, JobsService: any): Promise<boolean> => {
  try {
    // Проверяем есть ли у пользователя хотя бы один созданный заказ
    const userJobs = await JobsService.getJobsByClient(userId);
    return userJobs.length > 0;
  } catch (error) {
    console.log('Error checking client status:', error);
    return false;
  }
};

// 2. Исправленная логика для кнопки Apply
export const shouldShowApplyButton = (user: any, job: any): boolean => {
  // Показываем кнопку Apply только если пользователь НЕ создатель заказа
  return !user || user.$id !== job.clientId;
};

// 3. Исправленная логика для кнопки приглашения фрилансеров
export const shouldShowInviteButton = async (user: any, job: any, JobsService: any): Promise<boolean> => {
  if (!user) return false;
  
  // Показываем кнопку если:
  // 1. Пользователь создатель этого заказа ИЛИ
  // 2. Пользователь является клиентом (создал хотя бы один заказ)
  return user.$id === job.clientId || await checkIfUserIsClient(user.$id, JobsService);
};

// 4. Функция для сохранения clientId в job объекте
export const enrichJobWithClientId = (convertedJob: any, originalJobData: any) => {
  (convertedJob as any).clientId = originalJobData.clientId;
  return convertedJob;
}; 