'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { ReelsService, Reel } from '@/lib/appwrite/reels';
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

export default function EditSolutionPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthContext();
  const videoRef = useRef<HTMLInputElement>(null);
  const thumbnailRef = useRef<HTMLInputElement>(null);

  const [solution, setSolution] = useState<Reel | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

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

  // Load solution data
  useEffect(() => {
    const loadSolution = async () => {
      if (!params.id || !user) return;

      try {
        setLoadingData(true);
        const solutionData = await ReelsService.getReel(params.id as string);
        
        if (!solutionData) {
          alert('Solution not found');
          router.push('/en/dashboard?tab=solutions');
          return;
        }

        // Check if user owns this solution
        if (solutionData.creatorId !== user.$id) {
          alert('You can only edit your own solutions');
          router.push('/en/dashboard?tab=solutions');
          return;
        }

        setSolution(solutionData);
        setFormData({
          title: solutionData.title,
          description: solutionData.description,
          category: solutionData.category,
          tags: solutionData.tags || [],
          price: solutionData.price?.toString() || '',
          deliveryTime: solutionData.deliveryTime || '',
          features: solutionData.features || [''],
          requirements: solutionData.requirements || ''
        });

        // Set existing media URLs
        if (solutionData.videoUrl) {
          setPreviews(prev => ({ ...prev, video: solutionData.videoUrl! }));
        }
        if (solutionData.thumbnailUrl) {
          setPreviews(prev => ({ ...prev, thumbnail: solutionData.thumbnailUrl! }));
        }

      } catch (error) {
        console.error('Error loading solution:', error);
        alert('Failed to load solution');
        router.push('/en/dashboard?tab=solutions');
      } finally {
        setLoadingData(false);
      }
    };

    loadSolution();
  }, [params.id, user, router]);

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
    if (!user || !solution) return;

    // Validation
    if (!formData.title || !formData.description || !formData.category || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      let videoUrl = solution.videoUrl;
      let thumbnailUrl = solution.thumbnailUrl;

      // Upload new video if provided
      if (files.video) {
        console.log('Uploading new video...');
        const videoFile = await storage.createFile(
          process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
          'unique()',
          files.video
        );
        videoUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${videoFile.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
      }

      // Upload new thumbnail if provided
      if (files.thumbnail) {
        console.log('Uploading new thumbnail...');
        const thumbnailFile = await storage.createFile(
          process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
          'unique()',
          files.thumbnail
        );
        thumbnailUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${thumbnailFile.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
      }

      // Update solution in database
      console.log('Updating solution...');
      await ReelsService.updateReel(solution.$id!, {
        title: formData.title,
        description: formData.description,
        videoUrl,
        thumbnailUrl,
        category: formData.category,
        isPremium: parseInt(formData.price) > 100,
        tags: formData.tags,
        price: parseInt(formData.price),
        deliveryTime: formData.deliveryTime,
        features: formData.features.filter(f => f.trim() !== ''),
        requirements: formData.requirements
      });

      console.log('Solution updated successfully');
      alert('Solution updated successfully!');
      router.push('/en/dashboard?tab=solutions');
    } catch (error: any) {
      console.error('Error updating solution:', error);
      alert(`Error updating solution: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-[#0A0A0F]">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!solution) {
    return (
      <div className="min-h-screen bg-[#0A0A0F]">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Solution not found</h1>
            <button
              onClick={() => router.push('/en/dashboard?tab=solutions')}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
            >
              Back to Solutions
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-white">Edit Solution</h1>
            <p className="text-gray-400 mt-2">Update your AI solution</p>
          </div>
        </div>

        {/* Rest of the form will be similar to create page but with pre-filled data */}
        <div className="text-center py-12">
          <p className="text-gray-400">Edit form implementation continues...</p>
          <button
            onClick={() => router.push('/en/dashboard?tab=solutions')}
            className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            Back to Solutions
          </button>
        </div>
      </div>
    </div>
  );
}
