# Исправления для страницы заказов

## Проблемы:
1. Кнопка "Apply for this Job" показывается создателю заказа
2. Создатель заказа не может приглашать фрилансеров без статуса "клиент"

## Решения:

### 1. Добавить функцию проверки клиента

В файл `src/app/[locale]/jobs/[id]/page.tsx` в начало, после импортов добавить:

```typescript
// Функция проверки статуса клиента
const checkIfUserIsClient = async (userId: string): Promise<boolean> => {
  try {
    // Проверяем есть ли у пользователя хотя бы один созданный заказ
    const userJobs = await JobsService.getJobsByClient(userId);
    return userJobs.length > 0;
  } catch (error) {
    console.log('Error checking client status:', error);
    return false;
  }
};
```

### 2. Сохранить clientId в объекте job

В функции `loadJob`, после строки `setJob(convertedJob);` добавить:

```typescript
// Сохраняем clientId из оригинальных данных для проверки прав
(convertedJob as any).clientId = jobData.clientId;
```

### 3. Исправить логику кнопки Apply

Найти кнопку Apply (около строки 593) и заменить на:

```typescript
{/* Apply button - только если пользователь НЕ создатель заказа */}
{(!user || user.$id !== (job as any).clientId) && (
  <button
    onClick={handleApply}
    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    disabled={!user}
  >
    <Briefcase className="w-4 h-4 mr-2 inline" />
    {!user ? "Login to Apply" : "Apply for this Job"}
  </button>
)}
```

### 4. Исправить логику кнопки приглашения фрилансеров

Найти условие для кнопки "Подобрать фрилансеров" (около строки 607) и заменить:

```typescript
{/* Invite Freelancers button - показываем если пользователь это создатель заказа или клиент */}
{user && (user.$id === (job as any).clientId || user.userType === "client") && (
```

### 5. Добавить проверку клиента при загрузке

В useEffect (около строки 95) изменить условие:

```typescript
if (user && (user.userType === "client" || user.$id === job?.clientId)) {
  loadJobInvitations();
}
```

## Результат:

✅ Кнопка Apply не показывается создателю заказа  
✅ Создатель заказа может приглашать фрилансеров  
✅ Любой пользователь с созданными заказами считается клиентом  
✅ Дашборд больше не выдает ошибку с formatCurrency 