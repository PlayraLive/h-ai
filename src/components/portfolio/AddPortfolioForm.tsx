'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PortfolioService } from '@/lib/appwrite/portfolio';
import { StorageService } from '@/services/storageService';
import { useAuthContext } from '@/contexts/AuthContext';
import SuccessModal from './SuccessModal';
// Try to import from Heroicons, fallback to simple icons
let PhotoIcon, XMarkIcon, PlusIcon, LinkIcon, CodeBracketIcon, GlobeAltIcon;

try {
  const heroicons = require('@heroicons/react/24/outline');
  PhotoIcon = heroicons.PhotoIcon;
  XMarkIcon = heroicons.XMarkIcon;
  PlusIcon = heroicons.PlusIcon;
  LinkIcon = heroicons.LinkIcon;
  CodeBracketIcon = heroicons.CodeBracketIcon;
  GlobeAltIcon = heroicons.GlobeAltIcon;
} catch {
  const simpleIcons = require('@/components/icons/SimpleIcons');
  PhotoIcon = simpleIcons.PhotoIcon;
  XMarkIcon = simpleIcons.XMarkIcon;
  PlusIcon = simpleIcons.PlusIcon;
  LinkIcon = simpleIcons.LinkIcon;
  CodeBracketIcon = simpleIcons.CodeBracketIcon;
  GlobeAltIcon = simpleIcons.GlobeAltIcon;
}

interface AddPortfolioFormProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

const categories = [
  'Web Development', 'Mobile Apps', 'UI/UX Design', 'AI/ML Projects',
  'Data Visualization', 'Blockchain', 'Game Development', 'Digital Art',
  'Content Creation', 'Marketing', 'Other'
];

const popularSkills = [
  'React', 'Next.js', 'TypeScript', 'Python', 'JavaScript',
  'Figma', 'Photoshop', 'Illustrator', 'Blender', '3D Modeling',
  'Machine Learning', 'TensorFlow', 'PyTorch', 'OpenAI',
  'Blockchain', 'Solidity', 'Web3', 'Smart Contracts',
  'Node.js', 'Express', 'MongoDB', 'PostgreSQL'
];

const aiServices = [
  'ChatGPT', 'GPT-4', 'Claude', 'Midjourney', 'DALL-E',
  'Stable Diffusion', 'RunwayML', 'Luma AI', 'Suno AI',
  'ElevenLabs', 'Synthesia', 'Descript', 'Jasper',
  'Copy.ai', 'Notion AI', 'GitHub Copilot', 'Cursor',
  'Figma AI', 'Adobe Firefly', 'Canva AI', 'Framer AI'
];

export default function AddPortfolioForm({ onSubmit, onCancel }: AddPortfolioFormProps) {
  const router = useRouter();
  const { user } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdItem, setCreatedItem] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    skills: [] as string[],
    aiServices: [] as string[],
    tools: [] as string[],
    liveUrl: '',
    githubUrl: '',
    videoUrl: '',
    tags: [] as string[]
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [newAIService, setNewAIService] = useState('');
  const [newTool, setNewTool] = useState('');
  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 5 images
    const newImages = [...images, ...files].slice(0, 5);
    setImages(newImages);

    // Create previews
    const newPreviews = [...imagePreviews];
    files.forEach((file, index) => {
      if (imagePreviews.length + index < 5) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          setImagePreviews([...newPreviews]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      handleInputChange('skills', [...formData.skills, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    handleInputChange('skills', formData.skills.filter(s => s !== skill));
  };

  const addAIService = (service: string) => {
    if (service && !formData.aiServices.includes(service)) {
      handleInputChange('aiServices', [...formData.aiServices, service]);
    }
  };

  const removeAIService = (service: string) => {
    handleInputChange('aiServices', formData.aiServices.filter(s => s !== service));
  };

  const addTool = (tool: string) => {
    if (tool && !formData.tools.includes(tool)) {
      handleInputChange('tools', [...formData.tools, tool]);
      setNewTool('');
    }
  };

  const removeTool = (tool: string) => {
    handleInputChange('tools', formData.tools.filter(t => t !== tool));
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      handleInputChange('tags', [...formData.tags, tag]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    handleInputChange('tags', formData.tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      alert('Please fill in all required fields (title and description).');
      return;
    }

    if (!user) {
      alert('You must be logged in to create portfolio items.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Step 1: Validate images
      const validation = StorageService.validateImageFiles(images);
      if (!validation.valid) {
        alert(`Image validation failed:\n${validation.errors.join('\n')}`);
        return;
      }

      setUploadProgress(20);

      // Step 2: Handle images (if any)
      let imageUrls: string[] = [];
      let thumbnailUrl = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400'; // Default thumbnail

      if (images.length > 0) {
        console.log('Compressing and uploading images...');
        const compressedImages = await Promise.all(
          images.map(image => StorageService.compressImage(image, 1920, 0.8))
        );

        setUploadProgress(40);

        imageUrls = await StorageService.uploadImages(compressedImages, 'portfolio');

        setUploadProgress(60);

        // Step 3: Create thumbnail (use first image)
        const thumbnailFile = await StorageService.createThumbnail(images[0], 400);
        thumbnailUrl = await StorageService.uploadImage(thumbnailFile, 'portfolio/thumbnails');
      } else {
        // Use default images for testing
        imageUrls = ['https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800'];
        setUploadProgress(60);
      }

      setUploadProgress(80);

      // Step 4: Prepare portfolio data
      const portfolioData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory || '',
        images: imageUrls,
        thumbnailUrl: thumbnailUrl,
        videoUrl: formData.videoUrl || '',
        liveUrl: formData.liveUrl || '',
        githubUrl: formData.githubUrl || '',
        aiServices: formData.aiServices,
        skills: formData.skills,
        tools: formData.tools,
        tags: formData.tags,
        userId: user.$id,
        userName: user.name || 'Anonymous',
        userAvatar: user.avatar || null,
        likesCount: 0,
        viewsCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        averageRating: 0,
        ratingsCount: 0,
        status: 'published' as const,
        featured: false,
        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      };

      // Step 5: Save to database
      console.log('Saving portfolio item to database...');
      const savedItem = await PortfolioService.createPortfolioItem(portfolioData, user.$id);

      setUploadProgress(100);

      console.log('Portfolio item created successfully:', savedItem);

      // Step 6: Show success modal
      setCreatedItem(savedItem);
      setShowSuccessModal(true);

      if (onSubmit) {
        await onSubmit(savedItem);
      }

    } catch (error: any) {
      console.error('Error creating portfolio item:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        type: error.type,
        response: error.response
      });

      let errorMessage = 'Failed to create portfolio item';
      if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      if (error.code) {
        errorMessage += ` (Code: ${error.code})`;
      }

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Add to Portfolio
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Showcase your AI-powered creations and projects
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Information */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Basic Information
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter your project title..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your project, the problem it solves, and how you created it..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subcategory
              </label>
              <input
                type="text"
                value={formData.subcategory}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
                placeholder="e.g., E-commerce, SaaS, Mobile Game..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Project Images *
          </h3>
          
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Click to upload images or drag and drop
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                PNG, JPG, GIF up to 10MB (max 5 images)
              </p>
            </label>
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    width={200}
                    height={150}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Services & Tools */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            AI Services & Tools Used
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AI Services
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
              {aiServices.map(service => (
                <button
                  key={service}
                  type="button"
                  onClick={() => addAIService(service)}
                  className={`p-2 text-sm rounded-lg border transition-colors ${
                    formData.aiServices.includes(service)
                      ? 'bg-green-100 dark:bg-green-900 border-green-500 text-green-800 dark:text-green-200'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  🤖 {service}
                </button>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newAIService}
                onChange={(e) => setNewAIService(e.target.value)}
                placeholder="Add custom AI service..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => {
                  addAIService(newAIService);
                  setNewAIService('');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>

            {formData.aiServices.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.aiServices.map(service => (
                  <span key={service} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    🤖 {service}
                    <button
                      type="button"
                      onClick={() => removeAIService(service)}
                      className="ml-2 hover:text-green-600 dark:hover:text-green-300"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Technical Skills *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
              {popularSkills.map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => addSkill(skill)}
                  className={`p-2 text-sm rounded-lg border transition-colors ${
                    formData.skills.includes(skill)
                      ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-800 dark:text-blue-200'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add custom skill..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => {
                  addSkill(newSkill);
                  setNewSkill('');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>

            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.skills.map(skill => (
                  <span key={skill} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 hover:text-blue-600 dark:hover:text-blue-300"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Links */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Project Links
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <GlobeAltIcon className="w-4 h-4 inline mr-1" />
                Live Demo URL
              </label>
              <input
                type="url"
                value={formData.liveUrl}
                onChange={(e) => handleInputChange('liveUrl', e.target.value)}
                placeholder="https://your-project.com"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <CodeBracketIcon className="w-4 h-4 inline mr-1" />
                GitHub Repository
              </label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                placeholder="https://github.com/username/repo"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <LinkIcon className="w-4 h-4 inline mr-1" />
                Video Demo URL
              </label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {isSubmitting && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>Uploading portfolio item...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
              {uploadProgress < 20 && 'Validating images...'}
              {uploadProgress >= 20 && uploadProgress < 40 && 'Compressing images...'}
              {uploadProgress >= 40 && uploadProgress < 60 && 'Uploading images...'}
              {uploadProgress >= 60 && uploadProgress < 80 && 'Creating thumbnail...'}
              {uploadProgress >= 80 && uploadProgress < 100 && 'Saving to database...'}
              {uploadProgress === 100 && 'Complete! 🎉'}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel || (() => router.back())}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.title || !formData.description}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <span>Add to Portfolio</span>
            )}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {showSuccessModal && createdItem && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          portfolioItem={createdItem}
          userStats={{
            portfolioItems: 1, // This should come from real user stats
            totalViews: 0,
            totalLikes: 0,
            averageRating: 0,
            featuredItems: 0,
            nftItems: 0,
            streakDays: 1,
            followers: 0,
            following: 0,
            commentsReceived: 0,
            sharesReceived: 0,
            joinedDate: user?.createdAt || new Date().toISOString()
          }}
          onShare={(platform) => {
            console.log(`Shared on ${platform}`);
          }}
          onViewPortfolio={() => {
            setShowSuccessModal(false);
            router.push('/en/dashboard?tab=portfolio');
          }}
        />
      )}
    </div>
  );
}
