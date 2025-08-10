import { NextRequest, NextResponse } from 'next/server';
import { JobsService } from '@/lib/appwrite/jobs';

// GET /api/jobs - Get all jobs
export async function GET(request: NextRequest) {
  try {
    console.log('📥 GET /api/jobs - Fetching jobs...');
    
    const jobs = await JobsService.getJobs();
    
    console.log(`✅ Found ${jobs.jobs.length} jobs`);
    
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Create a new job
export async function POST(request: NextRequest) {
  try {
    console.log('📝 POST /api/jobs - Creating new job...');
    
    const body = await request.json();
    console.log('📋 Job data:', body);
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'category', 'budgetType', 'budgetMin', 'budgetMax', 'location', 'clientName'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: 'Missing required fields', missingFields },
        { status: 400 }
      );
    }
    
    // For demo purposes, use a default client ID
    const clientId = body.clientId || 'demo_client_001';
    
    const jobData = {
      title: body.title,
      description: body.description,
      category: body.category,
      subcategory: body.subcategory,
      skills: body.skills || [],
      budgetType: body.budgetType,
      budgetMin: parseInt(body.budgetMin),
      budgetMax: parseInt(body.budgetMax),
      currency: body.currency || 'USD',
      duration: body.duration || '2-4 weeks',
      experienceLevel: body.experienceLevel || 'intermediate',
      location: body.location,
      status: 'active',
      clientId: clientId,
      clientName: body.clientName,
      clientCompany: body.clientCompany,
      clientAvatar: body.clientAvatar,
      featured: body.featured || false,
      urgent: body.urgent || false,
      deadline: body.deadline,
      attachments: body.attachments || [],
      applicationsCount: body.applicationsCount || 0,
      viewsCount: body.viewsCount || 0,
      tags: body.tags || []
    };
    
    console.log('🔄 Creating job with data:', jobData);
    
    const job = await JobsService.createJob(jobData, clientId);
    
    console.log('✅ Job created successfully:', job.$id);
    
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating job:', error);
    return NextResponse.json(
      { error: 'Failed to create job', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
