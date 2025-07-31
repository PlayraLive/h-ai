import { getAISpecialists } from '@/lib/data/ai-specialists';

export default async function TestSpecialistsPage() {
  console.log('🧪 Testing specialists data...');
  
  try {
    const specialists = await getAISpecialists();
    console.log('✅ Specialists loaded:', specialists.length);
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Тест данных специалистов
          </h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Загружено специалистов: {specialists.length}</h2>
            
            <div className="space-y-4">
              {specialists.map((specialist) => (
                <div key={specialist.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h3 className="font-bold text-lg">{specialist.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ID: {specialist.id}</p>
                  <p className="text-sm">{specialist.title}</p>
                  <div className="mt-2">
                    <a 
                      href={`/en/ai-specialists/${specialist.id}/order`}
                      className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      Тест ссылки заказа →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ Error in test page:', error);
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка загрузки данных</h1>
          <pre className="text-sm text-gray-600 bg-gray-100 p-4 rounded">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </div>
      </div>
    );
  }
}