'use client';

import React, { useState } from 'react';
// Try to import from Heroicons, fallback to simple icons
let ChevronDownIcon, XMarkIcon;

try {
  const heroicons = require('@heroicons/react/24/outline');
  ChevronDownIcon = heroicons.ChevronDownIcon;
  XMarkIcon = heroicons.XMarkIcon;
} catch {
  const simpleIcons = require('@/components/icons/SimpleIcons');
  ChevronDownIcon = simpleIcons.ChevronDownIcon;
  XMarkIcon = simpleIcons.XMarkIcon;
}

interface PortfolioFiltersProps {
  selectedCategory: string;
  selectedSkills: string[];
  selectedAIServices: string[];
  sortBy: string;
  onCategoryChange: (category: string) => void;
  onSkillsChange: (skills: string[]) => void;
  onAIServicesChange: (services: string[]) => void;
  onSortChange: (sort: string) => void;
}

const categories = [
  'All Categories',
  'Web Development',
  'Mobile Apps',
  'UI/UX Design',
  'AI/ML Projects',
  'Data Visualization',
  'Blockchain',
  'Game Development',
  'Digital Art',
  'Content Creation',
  'Marketing',
  'Other'
];

const popularSkills = [
  'React', 'Next.js', 'TypeScript', 'Python', 'JavaScript',
  'Figma', 'Photoshop', 'Illustrator', 'Blender', '3D Modeling',
  'Machine Learning', 'TensorFlow', 'PyTorch', 'OpenAI',
  'Blockchain', 'Solidity', 'Web3', 'Smart Contracts',
  'Node.js', 'Express', 'MongoDB', 'PostgreSQL',
  'Flutter', 'React Native', 'Swift', 'Kotlin',
  'Unity', 'Unreal Engine', 'C#', 'C++',
  'Adobe After Effects', 'Premiere Pro', 'DaVinci Resolve'
];

const aiServices = [
  'ChatGPT', 'GPT-4', 'Claude', 'Midjourney', 'DALL-E',
  'Stable Diffusion', 'RunwayML', 'Luma AI', 'Suno AI',
  'ElevenLabs', 'Synthesia', 'Descript', 'Jasper',
  'Copy.ai', 'Notion AI', 'GitHub Copilot', 'Cursor',
  'Figma AI', 'Adobe Firefly', 'Canva AI', 'Framer AI',
  'Replicate', 'Hugging Face', 'OpenAI API', 'Anthropic API'
];

export default function PortfolioFilters({
  selectedCategory,
  selectedSkills,
  selectedAIServices,
  sortBy,
  onCategoryChange,
  onSkillsChange,
  onAIServicesChange,
  onSortChange
}: PortfolioFiltersProps) {
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [showAIServicesDropdown, setShowAIServicesDropdown] = useState(false);

  const handleSkillToggle = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      onSkillsChange(selectedSkills.filter(s => s !== skill));
    } else {
      onSkillsChange([...selectedSkills, skill]);
    }
  };

  const handleAIServiceToggle = (service: string) => {
    if (selectedAIServices.includes(service)) {
      onAIServicesChange(selectedAIServices.filter(s => s !== service));
    } else {
      onAIServicesChange([...selectedAIServices, service]);
    }
  };

  const clearAllFilters = () => {
    onCategoryChange('');
    onSkillsChange([]);
    onAIServicesChange([]);
  };

  const hasActiveFilters = selectedCategory || selectedSkills.length > 0 || selectedAIServices.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex flex-wrap items-center gap-4">
        
        {/* Category Filter */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((category) => (
              <option key={category} value={category === 'All Categories' ? '' : category}>
                {category}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Skills Filter */}
        <div className="relative">
          <button
            onClick={() => setShowSkillsDropdown(!showSkillsDropdown)}
            className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span>Skills {selectedSkills.length > 0 && `(${selectedSkills.length})`}</span>
            <ChevronDownIcon className="w-4 h-4" />
          </button>

          {showSkillsDropdown && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  {popularSkills.map((skill) => (
                    <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill)}
                        onChange={() => handleSkillToggle(skill)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Services Filter */}
        <div className="relative">
          <button
            onClick={() => setShowAIServicesDropdown(!showAIServicesDropdown)}
            className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span>AI Tools {selectedAIServices.length > 0 && `(${selectedAIServices.length})`}</span>
            <ChevronDownIcon className="w-4 h-4" />
          </button>

          {showAIServicesDropdown && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  {aiServices.map((service) => (
                    <label key={service} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAIServices.includes(service)}
                        onChange={() => handleAIServiceToggle(service)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{service}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center space-x-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <XMarkIcon className="w-4 h-4" />
            <span className="text-sm">Clear all</span>
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {selectedCategory && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                {selectedCategory}
                <button
                  onClick={() => onCategoryChange('')}
                  className="ml-2 hover:text-blue-600 dark:hover:text-blue-300"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {selectedSkills.map((skill) => (
              <span key={skill} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                {skill}
                <button
                  onClick={() => handleSkillToggle(skill)}
                  className="ml-2 hover:text-green-600 dark:hover:text-green-300"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
            
            {selectedAIServices.map((service) => (
              <span key={service} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                🤖 {service}
                <button
                  onClick={() => handleAIServiceToggle(service)}
                  className="ml-2 hover:text-purple-600 dark:hover:text-purple-300"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
