'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import ProjectEditor from '@/components/ProjectEditor';
import { useAuth } from '@/hooks/useAuth';

interface ProjectData {
  id: string;
  name: string;
  type: 'website' | 'video' | 'bot' | 'design';
  userId: string;
  data: any;
}

export default function EditorPage() {
  const params = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProject();
  }, [params.projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      
      // В реальном приложении здесь будет запрос к API
      // const projectData = await ProjectsService.getProject(params.projectId as string);
      
      // Mock data для демо
      const mockProject: ProjectData = {
        id: params.projectId as string,
        name: 'My AI Website',
        type: 'website',
        userId: user?.$id || 'demo-user',
        data: {
          design: {
            theme: 'modern',
            colors: ['#6366f1', '#8b5cf6', '#ec4899'],
            layout: 'grid'
          },
          content: {
            title: 'Welcome to My Website',
            description: 'This is an AI-generated website',
            sections: ['hero', 'features', 'contact']
          }
        }
      };
      
      setProject(mockProject);
    } catch (error) {
      console.error('Error loading project:', error);
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка проекта...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Проект не найден</h1>
          <p className="text-gray-400 mb-6">{error || 'Запрашиваемый проект не существует.'}</p>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  // Проверка прав доступа
  if (project.userId !== user?.$id) {
    return (
      <div className="h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Доступ запрещен</h1>
          <p className="text-gray-400 mb-6">У вас нет прав для редактирования этого проекта.</p>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProjectEditor
      projectId={project.id}
      solutionType={project.type}
      initialData={project.data}
    />
  );
}
