'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { 
  Upload, 
  Video, 
  Image as ImageIcon, 
  X, 
  Play, 
  DollarSign,
  Clock,
  Tag,
  FileText,
  Sparkles,
  ArrowLeft,
  Save
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { ReelsService } from '@/lib/appwrite/reels';
import { storage } from '@/lib/appwrite';

const categories = [
  { id: 'website', label: 'Website Development', icon: '🌐' },
  { id: 'video', label: 'Video Creation', icon: '🎥' },
  { id: 'design', label: 'Design & Graphics', icon: '🎨' },
  { id: 'bot', label: 'Bot Development', icon: '🤖' },
  { id: 'mobile', label: 'Mobile Apps', icon: '📱' },
  { id: 'ai', label: 'AI Services', icon: '🧠' }
];

const techTags = [
  'React', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Django', 'Flask',
  'WordPress', 'Shopify', 'Figma', 'Photoshop', 'After Effects', 'Premiere Pro',
  'OpenAI', 'TensorFlow', 'PyTorch', 'MongoDB', 'PostgreSQL', 'Firebase',
  'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes'
];

export default function CreateSolutionPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const videoRef = useRef<HTMLInputElement>(null);
  const thumbnailRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: [] as string[],
    price: '',
    deliveryTime: '',
    features: [''],
    requirements: ''
  });

  const [files, setFiles] = useState({
    video: null as File | null,
    thumbnail: null as File | null
  });

  const [previews, setPreviews] = useState({
    video: '',
    thumbnail: ''
  });

  const [loading, setLoading] = useState(false);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles(prev => ({ ...prev, video: file }));
      const url = URL.createObjectURL(file);
      setPreviews(prev => ({ ...prev, video: url }));
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles(prev => ({ ...prev, thumbnail: file }));
      const url = URL.createObjectURL(file);
      setPreviews(prev => ({ ...prev, thumbnail: url }));
    }
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (!formData.title || !formData.description || !formData.category || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.tags.length === 0) {
      alert('Please select at least one technology tag');
      return;
    }

    setLoading(true);
    try {
      let videoUrl = '';
      let thumbnailUrl = '';

      // Upload video if provided
      if (files.video) {
        console.log('Uploading video...');
        const videoFile = await storage.createFile(
          process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
          'unique()',
          files.video
        );
        videoUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${videoFile.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
      }

      // Upload thumbnail if provided
      if (files.thumbnail) {
        console.log('Uploading thumbnail...');
        const thumbnailFile = await storage.createFile(
          process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
          'unique()',
          files.thumbnail
        );
        thumbnailUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${thumbnailFile.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
      }

      // Create solution in database
      console.log('Creating solution...');
      const solution = await ReelsService.createReel({
        title: formData.title,
        description: formData.description,
        videoUrl,
        thumbnailUrl,
        category: formData.category,
        creatorId: user.$id,
        creatorName: user.name || 'Anonymous',
        isPremium: parseInt(formData.price) > 100,
        views: 0,
        likes: 0,
        rating: 5.0,
        duration: 60,
        tags: formData.tags,
        price: parseInt(formData.price),
        deliveryTime: formData.deliveryTime,
        features: formData.features.filter(f => f.trim() !== ''),
        requirements: formData.requirements
      });

      console.log('Solution created successfully:', solution);
      alert('Solution created successfully!');
      router.push('/en/dashboard?tab=solutions');
    } catch (error: any) {
      console.error('Error creating solution:', error);
      alert(`Error creating solution: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-8">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">Create New Solution</h1>
                <p className="text-gray-400 mt-2">Share your AI solution with the community</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Media Upload */}
                <div className="space-y-6">
                  {/* Video Upload */}
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <Video className="w-5 h-5" />
                      <span>Demo Video</span>
                    </h3>
                    
                    {!previews.video ? (
                      <div
                        onClick={() => videoRef.current?.click()}
                        className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-gray-600 transition-colors"
                      >
                        <Upload className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 mb-2">Click to upload demo video</p>
                        <p className="text-sm text-gray-500">MP4, WebM up to 100MB</p>
                      </div>
                    ) : (
                      <div className="relative">
                        <video
                          src={previews.video}
                          className="w-full aspect-video rounded-lg"
                          controls
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFiles(prev => ({ ...prev, video: null }));
                            setPreviews(prev => ({ ...prev, video: '' }));
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    <input
                      ref={videoRef}
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Thumbnail Upload */}
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <ImageIcon className="w-5 h-5" />
                      <span>Thumbnail</span>
                    </h3>
                    
                    {!previews.thumbnail ? (
                      <div
                        onClick={() => thumbnailRef.current?.click()}
                        className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-gray-600 transition-colors aspect-video"
                      >
                        <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 mb-2">Click to upload thumbnail</p>
                        <p className="text-sm text-gray-500">JPG, PNG up to 10MB</p>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={previews.thumbnail}
                          alt="Thumbnail preview"
                          className="w-full aspect-video object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFiles(prev => ({ ...prev, thumbnail: null }));
                            setPreviews(prev => ({ ...prev, thumbnail: '' }));
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    <input
                      ref={thumbnailRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Right Column - Form Fields */}
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Solution Title
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="e.g., AI Website Builder Pro"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          rows={4}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                          placeholder="Describe what your solution does and how it helps users..."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Category
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select a category</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.icon} {category.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Delivery */}
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <DollarSign className="w-5 h-5" />
                      <span>Pricing & Delivery</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Price (USD)
                        </label>
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="99"
                          min="1"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Delivery Time
                        </label>
                        <select
                          value={formData.deliveryTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, deliveryTime: e.target.value }))}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select delivery time</option>
                          <option value="instant">Instant</option>
                          <option value="1-day">1 Day</option>
                          <option value="3-days">3 Days</option>
                          <option value="1-week">1 Week</option>
                          <option value="2-weeks">2 Weeks</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Technologies */}
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <Tag className="w-5 h-5" />
                      <span>Technologies Used</span>
                    </h3>

                    <div className="flex flex-wrap gap-2">
                      {techTags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                            formData.tags.includes(tag)
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      Select up to 5 technologies (currently selected: {formData.tags.length}/5)
                    </p>
                  </div>

                  {/* Features */}
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <Sparkles className="w-5 h-5" />
                      <span>Key Features</span>
                    </h3>

                    <div className="space-y-3">
                      {formData.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => updateFeature(index, e.target.value)}
                            className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="e.g., Responsive design"
                          />
                          {formData.features.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="p-2 text-red-400 hover:text-red-300 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addFeature}
                        className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                      >
                        + Add another feature
                      </button>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>Requirements (Optional)</span>
                    </h3>

                    <textarea
                      value={formData.requirements}
                      onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder="Any specific requirements or information buyers should know..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-semibold disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Create Solution</span>
                    </>
                  )}
                </button>
              </div>
            </form>
      </div>
    </div>
  );
}
