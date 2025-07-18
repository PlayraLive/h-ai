'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  DollarSign,
  Palette,
  Code,
  Video,
  Gamepad2
} from 'lucide-react';

import { JobService } from '@/services/jobs';
import { useAuthContext } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function CreateJobPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    skills: [] as string[],
    budgetType: 'fixed',
    budgetMin: '',
    budgetMax: '',
    duration: '',
    experienceLevel: 'intermediate',
    location: 'remote',
    deadline: '',
    attachments: [] as File[]
  });

  const [newSkill, setNewSkill] = useState('');

  const categories = [
    { id: 'design', label: 'AI Design', icon: Palette, color: 'from-pink-500 to-rose-500' },
    { id: 'code', label: 'AI Development', icon: Code, color: 'from-blue-500 to-cyan-500' },
    { id: 'video', label: 'AI Video', icon: Video, color: 'from-purple-500 to-violet-500' },
    { id: 'games', label: 'AI Games', icon: Gamepad2, color: 'from-green-500 to-emerald-500' }
  ];

  const durations = [
    { value: '1-week', label: 'Less than 1 week' },
    { value: '1-2-weeks', label: '1-2 weeks' },
    { value: '2-4-weeks', label: '2-4 weeks' },
    { value: '1-2-months', label: '1-2 months' },
    { value: '2-6-months', label: '2-6 months' },
    { value: '6-months+', label: 'More than 6 months' }
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner', description: 'New to AI tools and freelancing' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some experience with AI tools' },
    { value: 'expert', label: 'Expert', description: 'Extensive experience and proven track record' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('handleSubmit: user object:', user);
    console.log('handleSubmit: isAuthenticated:', isAuthenticated);
    console.log('handleSubmit: user exists:', user ? 'YES' : 'NO');
    console.log('handleSubmit: user details:', user ? { name: user.name, email: user.email, id: user.$id } : 'null');

    // Проверяем аутентификацию
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, redirecting to login');
      console.log('Auth state:', { isAuthenticated, user: user ? 'exists' : 'null' });
      alert('Please log in to post a job');
      router.push('/en/login');
      return;
    }

    // Убираем проверку на mock пользователя - всегда пытаемся создать реальную запись

    // Проверяем наличие переменных окружения Appwrite
    if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
        !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ||
        !process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID) {
      console.warn('Appwrite not configured, simulating job creation');
      alert('Job created successfully! (Demo mode - Appwrite not configured)');
      router.push(`/${locale}/jobs`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare job data according to JobFormData interface
      const jobData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        skills: formData.skills,
        budgetType: formData.budgetType as 'fixed' | 'hourly',
        budgetMin: formData.budgetMin,
        budgetMax: formData.budgetMax,
        duration: formData.duration,
        experienceLevel: formData.experienceLevel as 'beginner' | 'intermediate' | 'expert',
        attachments: formData.attachments
      };

      // Create job in database
      const jobService = new JobService();
      const result = await jobService.createJob(jobData, user.$id);

      if (!result.success || !result.job) {
        alert('Failed to create job: ' + (result.error || 'Unknown error'));
        return;
      }

      const createdJob = result.job;

      console.log('Job created successfully:', createdJob);

      // Redirect to job details page
      router.push(`/en/jobs/${createdJob.$id}`);

    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData({
      ...formData,
      attachments: [...formData.attachments, ...files]
    });
  };

  const removeFile = (fileToRemove: File) => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter(file => file !== fileToRemove)
    });
  };

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar />

      <div className="flex-1 lg:ml-0">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href={`/${locale}/jobs`}
              className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Jobs</span>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Post a New Job</h1>
            <p className="text-gray-400">Find the perfect AI specialist for your project</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>
              
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field w-full"
                    placeholder="e.g., AI Logo Design for Tech Startup"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field w-full resize-none"
                    placeholder="Describe your project in detail. Include requirements, deliverables, and any specific AI tools you prefer..."
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Category *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: category.id })}
                          className={cn(
                            "flex flex-col items-center space-y-3 p-4 rounded-xl border-2 transition-all duration-300",
                            formData.category === category.id
                              ? "border-purple-500 bg-purple-500/10"
                              : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                          )}
                        >
                          <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-sm font-medium text-white">{category.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Skills & Requirements */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-xl font-semibold text-white mb-6">Skills & Requirements</h2>
              
              <div className="space-y-6">
                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Required Skills
                  </label>
                  <div className="flex space-x-2 mb-3">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="input-field flex-1"
                      placeholder="e.g., Midjourney, DALL-E, Python..."
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="btn-primary"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {formData.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center space-x-2 bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="hover:text-purple-300 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Experience Level *
                  </label>
                  <div className="space-y-3">
                    {experienceLevels.map((level) => (
                      <label key={level.value} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="experienceLevel"
                          value={level.value}
                          checked={formData.experienceLevel === level.value}
                          onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                          className="w-4 h-4 text-purple-500 bg-gray-800 border-gray-600 focus:ring-purple-500 focus:ring-2 mt-1"
                        />
                        <div>
                          <div className="text-white font-medium">{level.label}</div>
                          <div className="text-sm text-gray-400">{level.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Budget & Timeline */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-xl font-semibold text-white mb-6">Budget & Timeline</h2>
              
              <div className="space-y-6">
                {/* Budget Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-4">
                    Budget Type *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="budgetType"
                        value="fixed"
                        checked={formData.budgetType === 'fixed'}
                        onChange={(e) => setFormData({ ...formData, budgetType: e.target.value })}
                        className="w-4 h-4 text-purple-500 bg-gray-800 border-gray-600 focus:ring-purple-500 focus:ring-2"
                      />
                      <div>
                        <div className="text-white font-medium">Fixed Price</div>
                        <div className="text-sm text-gray-400">One-time payment for the entire project</div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="budgetType"
                        value="hourly"
                        checked={formData.budgetType === 'hourly'}
                        onChange={(e) => setFormData({ ...formData, budgetType: e.target.value })}
                        className="w-4 h-4 text-purple-500 bg-gray-800 border-gray-600 focus:ring-purple-500 focus:ring-2"
                      />
                      <div>
                        <div className="text-white font-medium">Hourly Rate</div>
                        <div className="text-sm text-gray-400">Pay by the hour</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Budget Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {formData.budgetType === 'fixed' ? 'Minimum Budget' : 'Minimum Hourly Rate'} *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        required
                        value={formData.budgetMin}
                        onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                        className="input-field pl-9 w-full"
                        placeholder="500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {formData.budgetType === 'fixed' ? 'Maximum Budget' : 'Maximum Hourly Rate'} *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        required
                        value={formData.budgetMax}
                        onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                        className="input-field pl-9 w-full"
                        placeholder="2000"
                      />
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project Duration *
                  </label>
                  <select
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="input-field w-full"
                  >
                    <option value="">Select duration</option>
                    {durations.map((duration) => (
                      <option key={duration.value} value={duration.value}>
                        {duration.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-xl font-semibold text-white mb-6">Attachments (Optional)</h2>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">Upload project files, references, or requirements</p>
                  <p className="text-sm text-gray-400 mb-4">PNG, JPG, PDF, DOC up to 10MB each</p>
                  <label className="btn-secondary cursor-pointer">
                    Choose Files
                    <input
                      type="file"
                      multiple
                      accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
                        <span className="text-gray-300 text-sm">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(file)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between">
              <Link href={`/${locale}/jobs`} className="btn-secondary">
                Cancel
              </Link>
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'Creating Job...' : 'Post Job'}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}
