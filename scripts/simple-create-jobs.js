// Simple script to create jobs via fetch API
// This script can be run in the browser console or as a simple Node.js script

const JOBS_DATA = [
  {
    title: "AI-Powered Logo Design for Tech Startup",
    description: "We need a creative AI designer to create a modern, minimalist logo for our AI startup. The logo should convey innovation, trust, and cutting-edge technology.",
    category: "ai_design",
    skills: ["AI Design", "Logo Design", "Branding", "Figma"],
    budgetType: "fixed",
    budgetMin: 500,
    budgetMax: 1500,
    currency: "USD",
    location: "Remote",
    clientName: "TechFlow AI",
    applicationsCount: 12,
    rating: 4.8
  },
  {
    title: "Machine Learning Model Development",
    description: "Looking for an experienced ML engineer to develop a recommendation system for our e-commerce platform. Must have experience with Python, TensorFlow, and large datasets.",
    category: "ai_development",
    skills: ["Machine Learning", "Python", "TensorFlow", "Data Science"],
    budgetType: "fixed",
    budgetMin: 5000,
    budgetMax: 15000,
    currency: "USD",
    location: "Remote",
    clientName: "ShopSmart Inc",
    applicationsCount: 8,
    rating: 4.9
  },
  {
    title: "AI Video Editing for YouTube Channel",
    description: "Need an AI video editor to create engaging content for our tech YouTube channel. Experience with AI-powered editing tools required.",
    category: "ai_content",
    skills: ["AI Video Editing", "Adobe Premiere", "After Effects", "YouTube SEO"],
    budgetType: "hourly",
    budgetMin: 25,
    budgetMax: 40,
    currency: "USD",
    location: "Remote",
    clientName: "TechTube Media",
    applicationsCount: 15,
    rating: 4.5
  },
  {
    title: "Content Writing for Tech Blog",
    description: "We need a skilled technical content writer to create engaging blog posts for our developer-focused platform. Content Requirements: - 8-10 blog posts per month - Topics: AI, Web Development, DevOps, Cybersecurity - 1500-2500 words per article - SEO optimization - Code examples and tutorials",
    category: "ai_content",
    skills: ["Technical Writing", "SEO", "Content Strategy", "Developer Tools"],
    budgetType: "hourly",
    budgetMin: 25,
    budgetMax: 40,
    currency: "USD",
    location: "Remote",
    clientName: "DevHub Media",
    applicationsCount: 18,
    rating: 4.5
  }
];

// Function to create a job via API
async function createJob(jobData) {
  try {
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Job created:', result);
      return result;
    } else {
      const error = await response.text();
      console.error('❌ Failed to create job:', error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error creating job:', error);
    return null;
  }
}

// Function to create all jobs
async function createAllJobs() {
  console.log('🚀 Starting to create jobs...');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const jobData of JOBS_DATA) {
    console.log(`📝 Creating job: ${jobData.title}`);
    
    const result = await createJob(jobData);
    
    if (result) {
      successCount++;
      console.log(`✅ Successfully created: ${jobData.title}`);
    } else {
      failCount++;
      console.log(`❌ Failed to create: ${jobData.title}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n🎉 Jobs creation completed!`);
  console.log(`✅ Success: ${successCount} jobs`);
  console.log(`❌ Failed: ${failCount} jobs`);
  console.log(`📊 Total: ${JOBS_DATA.length} jobs`);
}

// Function to check existing jobs
async function checkExistingJobs() {
  try {
    const response = await fetch('/api/jobs');
    
    if (response.ok) {
      const result = await response.json();
      console.log('📊 Existing jobs:', result);
      return result;
    } else {
      console.error('❌ Failed to fetch jobs');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    return null;
  }
}

// Main execution
async function main() {
  console.log('🔍 Checking existing jobs...');
  await checkExistingJobs();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('🚀 Creating new jobs...');
  await createAllJobs();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('🔍 Checking final state...');
  await checkExistingJobs();
}

// Export functions for use in browser console
if (typeof window !== 'undefined') {
  window.createAllJobs = createAllJobs;
  window.checkExistingJobs = checkExistingJobs;
  window.createJob = createJob;
  console.log('🌐 Functions available in console: createAllJobs(), checkExistingJobs(), createJob(data)');
}

// Run if called directly
if (typeof module !== 'undefined' && module.exports) {
  main().catch(console.error);
}
