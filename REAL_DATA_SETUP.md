# 🚀 H-AI Platform - Real Data Setup Guide

Complete guide to set up your H-AI platform with realistic data from Appwrite Database and Storage.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Quick Setup](#quick-setup)
- [Step-by-Step Setup](#step-by-step-setup)
- [Data Verification](#data-verification)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

## 🎯 Overview

This setup process will:
- ✅ Create Appwrite Storage buckets for media files
- ✅ Set up database collections and relationships
- ✅ Seed realistic user profiles with real avatars
- ✅ Create portfolio items with stock images
- ✅ Generate projects, reviews, and interactions
- ✅ Set up real-time statistics and counters
- ✅ Enable full platform functionality with real data

**Result**: A fully functional platform that feels like it's been in use for months!

## 📚 Prerequisites

### Required Tools
- Node.js 18+ installed
- Appwrite Cloud account or self-hosted Appwrite
- Git (for cloning the repository)

### Appwrite Setup
1. Create an Appwrite project
2. Get your API credentials
3. Enable required services:
   - Database
   - Storage
   - Authentication

### Environment Variables
You need these variables in your `.env.local` file:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
APPWRITE_API_KEY=your-api-key
```

## ⚡ Quick Setup

For immediate setup with all features:

```bash
# Install dependencies
npm install

# Set up everything at once (recommended)
npm run setup:all

# Or run individually
npm run setup:storage    # Create storage buckets
npm run setup:database   # Create database collections
npm run setup:seed       # Seed with realistic data
```

**That's it!** Your platform is now ready with realistic data.

## 🔧 Step-by-Step Setup

### Step 1: Environment Configuration

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Fill in your Appwrite credentials:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id-here
NEXT_PUBLIC_APPWRITE_DATABASE_ID=main-database
APPWRITE_API_KEY=your-api-key-here

# Optional: Stripe (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Step 2: Storage Buckets Setup

Create media storage buckets:

```bash
npm run setup:storage
```

This creates buckets for:
- 👤 **Avatars** (5MB limit, images only)
- 🎨 **Portfolio** (10MB limit, images/videos)
- 📁 **Projects** (20MB limit, documents/images)
- 🎬 **Videos** (100MB limit, video content)
- 📄 **Documents** (50MB limit, PDFs, docs)
- 🖼️ **Thumbnails** (2MB limit, optimized images)

### Step 3: Database Collections

Set up all database collections:

```bash
npm run setup:database
```

Creates 12+ collections:
- Users, Projects, Reviews
- Portfolio, Messages, Notifications
- Interactions, Categories, Skills
- Reels, Payments, Contracts

### Step 4: Data Seeding

Populate with realistic data:

```bash
# Test connection first
node scripts/seed-real-data.js test

# Seed all data
npm run setup:seed

# Or clean and seed fresh
node scripts/seed-real-data.js clean-seed
```

This creates:
- 👥 **8 realistic users** (5 freelancers + 3 clients)
- 🎨 **15+ portfolio items** with real images
- 💼 **5 active projects** with different statuses
- ⭐ **Multiple reviews** and ratings
- 🔔 **Notifications** for all users
- 💬 **Conversations** and messages
- 📊 **Real interaction statistics**

## ✅ Data Verification

### Check Your Setup

```bash
# List storage buckets
npm run storage:list

# List database collections
npm run db:list

# Test data seeding connection
node scripts/seed-real-data.js test
```

### Admin Panel Verification

1. Go to `/en/admin/data` in your browser
2. Login with admin credentials
3. Check database statistics
4. Verify all collections have data

### Frontend Verification

Visit these pages to see real data:

```
🏠 Homepage: /en
👥 Freelancers: /en/freelancers
💼 Jobs: /en/jobs  
📊 Dashboard: /en/dashboard
🎨 Portfolio: /en/portfolio
💬 Messages: /en/messages
🔔 Notifications: /en/notifications
```

## 🎮 Usage Examples

### Adding Your Own Content

```javascript
// Add a new reel with real interactions
import { ReelsService } from '@/lib/appwrite/reels';
import { InteractionsService } from '@/lib/appwrite/interactions';

const newReel = await ReelsService.createReel({
  title: "My AI Website Builder",
  description: "Creates websites in minutes",
  videoUrl: "uploaded-video-url",
  category: "website",
  creatorId: userId,
  // ... other fields
});

// Record interactions
await InteractionsService.recordView(userId, newReel.$id, 'reel');
await InteractionsService.toggleLike(userId, newReel.$id, 'reel');
```

### Uploading Media Files

```javascript
import { StorageService } from '@/lib/appwrite/storage';

// Upload avatar
const avatarResult = await StorageService.uploadAvatar(file, userId);

// Upload portfolio image
const portfolioResult = await StorageService.uploadPortfolioImage(
  file, 
  portfolioId,
  (progress) => console.log(`Upload: ${progress.percentage}%`)
);
```

### Real-time Statistics

```javascript
import { InteractionsService } from '@/lib/appwrite/interactions';

// Get real stats for any content
const stats = await InteractionsService.getInteractionStats(itemId, 'portfolio');
console.log(stats); // { views: 150, likes: 23, comments: 5, ... }

// Check user's interaction state
const userState = await InteractionsService.getUserInteractionState(
  userId, 
  itemId, 
  'portfolio'
);
console.log(userState); // { hasLiked: true, hasSaved: false, ... }
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Environment Variables Not Set
```bash
❌ NEXT_PUBLIC_APPWRITE_ENDPOINT is not set
```
**Solution**: Check your `.env.local` file and restart the development server.

#### 2. API Key Permissions
```bash
❌ Error creating bucket: missing scope
```
**Solution**: Ensure your API key has these scopes:
- `databases.read`, `databases.write`
- `files.read`, `files.write`
- `buckets.read`, `buckets.write`

#### 3. Collection Already Exists
```bash
⚠️ Collection users already exists
```
**Solution**: This is normal. The script will update existing collections.

#### 4. Storage Upload Fails
```bash
❌ Failed to upload file: File too large
```
**Solution**: Check file size limits in `src/lib/appwrite/storage.ts`

### Clean Reset

If you need to start fresh:

```bash
# Clean all data
npm run seed:clean

# Clean storage
npm run storage:clean

# Re-setup everything
npm run setup:all
```

### Debug Mode

Enable detailed logging:

```bash
# Set debug environment
export DEBUG=appwrite:*

# Run with verbose output
node scripts/seed-real-data.js seed --verbose
```

## ⚙️ Advanced Configuration

### Custom Data Configuration

Edit `src/lib/seed-real-data.ts` to customize:

```typescript
// Add your own user profiles
private getFreelancerProfiles() {
  return [
    {
      name: 'Your Name',
      email: 'your.email@example.com',
      skills: ['Your', 'Skills'],
      // ... other fields
    }
  ];
}
```

### Storage Bucket Customization

Modify `scripts/setup-storage-buckets.js`:

```javascript
const CUSTOM_BUCKET = {
  id: 'custom-bucket',
  name: 'Custom Files',
  maximumFileSize: 50 * 1024 * 1024, // 50MB
  allowedFileExtensions: ['pdf', 'doc'],
  // ... other settings
};
```

### Collection Schema Updates

After modifying schemas in `src/lib/appwrite/database.ts`:

```bash
# Update collections
npm run setup:database

# Re-seed data
node scripts/seed-real-data.js clean-seed
```

## 📊 Production Deployment

### Pre-deployment Checklist

- ✅ All environment variables set
- ✅ Storage buckets created
- ✅ Database collections configured
- ✅ Test data seeded successfully
- ✅ Admin panel accessible
- ✅ File uploads working
- ✅ Real-time interactions working

### Production Data

For production, consider:

1. **Selective Seeding**: Use `quick` mode for minimal data
2. **Real Users**: Let users create their own content
3. **Content Moderation**: Implement content review process
4. **Backup Strategy**: Regular database backups
5. **Media Optimization**: Compress images/videos

```bash
# Production-ready quick seed
node scripts/seed-real-data.js quick
```

## 🎉 Success!

Your H-AI platform is now running with:

- 📊 **Real Statistics**: All counters from database
- 🎨 **Stock Media**: Professional images and videos
- 👥 **Realistic Users**: Complete profiles with avatars
- 💼 **Active Projects**: Various statuses and budgets
- ⚡ **Live Interactions**: Real likes, views, comments
- 🔔 **Smart Notifications**: Dynamic, contextual alerts
- 📱 **Full Functionality**: Every feature works with real data

The platform now feels like a mature, actively-used service! 

## 🆘 Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review your environment variables
3. Verify Appwrite project settings
4. Check browser console for errors
5. Review server logs for API errors

## 📞 Getting Help

- 📖 [Appwrite Documentation](https://appwrite.io/docs)
- 💬 [GitHub Issues](https://github.com/your-repo/issues)
- 🔧 [Setup Videos](https://example.com/setup-videos)

---

*Built with ❤️ for the H-AI community*