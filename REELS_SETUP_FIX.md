# 🛠️ Fix: "Failed to fetch top reels" Error

## 🔍 Problem Analysis

The error occurs because your Appwrite database is missing the required collections for the Reels functionality:

```
Error: Failed to fetch top reels
    at ReelsService.getTopReels (ReelsService.getTopReels:118-122)
    at async loadReels (MobileReelsViewer.loadReels:57-59)
```

**Root Cause**: The `reels`, `reel_interactions`, and other AI solution collections don't exist in your Appwrite database.

## 🎯 Complete Solution

### Step 1: Set Up Environment Variables

You need an **Appwrite API Key** to create collections. Add this to your `.env.local` file:

```env
# Existing variables (keep these)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=687759fb003c8bd76b93
NEXT_PUBLIC_APPWRITE_DATABASE_ID=y687796e3001241f7de17
NEXT_PUBLIC_APPWRITE_BUCKET_ID=687796f2002638a8a945

# ADD THIS - API Key for collection creation
APPWRITE_API_KEY=your_api_key_here
```

### Step 2: Get Your API Key

1. Go to [Appwrite Console](https://cloud.appwrite.io)
2. Select your project
3. Go to **Settings** → **API Keys**
4. Click **Create API Key**
5. Name: `Collections Setup`
6. Expiration: Never (or set a long date)
7. Scopes: Select **All Scopes** or at minimum:
   - `databases.read`
   - `databases.write` 
   - `collections.read`
   - `collections.write`
   - `attributes.read`
   - `attributes.write`
8. Copy the API key and add it to `.env.local`

### Step 3: Run the Collections Setup

```bash
cd H-Ai
node scripts/setup-reels-collections.js
```

**Expected Output:**
```
🚀 Setting up AI Solutions & Reels collections...
📱 Creating reels collection...
✅ Added reels attribute: title
✅ Added reels attribute: description
✅ Added reels attribute: videoUrl
... (more attributes)
📦 Creating solution packages collection...
... (more collections)
🎉 All AI Solutions & Reels collections created successfully!
```

### Step 4: Verify the Fix

1. **Check Appwrite Console**:
   - Go to **Databases** → Your Database
   - Verify these collections exist:
     - `reels`
     - `solution_packages`
     - `freelancer_setups`
     - `reel_interactions`
     - `user_projects`
     - `ai_service_orders`

2. **Test the Application**:
   ```bash
   npm run dev
   ```
   - Go to `http://localhost:3000`
   - Check if reels load without errors
   - Open browser console - should see no "Failed to fetch" errors

## 🔧 Alternative Solutions

### Option 1: Manual Collection Creation

If the script fails, create collections manually in Appwrite Console:

#### Create `reels` Collection:
1. **Database** → **Create Collection**
2. **Collection ID**: `reels`
3. **Name**: `Reels`
4. **Add Attributes**:
   - `title` - String (255) - Required
   - `description` - String (1000) - Optional
   - `videoUrl` - String (500) - Required
   - `thumbnailUrl` - String (500) - Optional
   - `category` - String (100) - Required
   - `tags` - String (1000) - Optional
   - `creatorId` - String (255) - Required
   - `creatorName` - String (255) - Required
   - `isPremium` - Boolean - Default: false
   - `views` - Integer - Default: 0
   - `likes` - Integer - Default: 0
   - `rating` - Float - Default: 0
   - `duration` - Integer - Optional

### Option 2: Mock Data Fallback

If you want to test without setting up collections, modify the ReelsService:

```javascript
// In src/lib/appwrite/reels.ts - line ~118
static async getTopReels(limit: number = 4): Promise<Reel[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.REELS,
      [
        Query.orderDesc("rating"),
        Query.orderDesc("views"),
        Query.limit(limit),
      ],
    );

    return response.documents.map((doc) => ({
      ...doc,
      tags: doc.tags ? JSON.parse(doc.tags) : [],
    })) as Reel[];
  } catch (error) {
    console.error("Error fetching top reels:", error);
    
    // FALLBACK: Return mock data instead of throwing error
    return [
      {
        $id: "mock-1",
        title: "AI Website Builder",
        description: "Create stunning websites with AI",
        videoUrl: "/videos/demo.mp4",
        thumbnailUrl: "/images/thumb1.jpg",
        category: "website",
        creatorId: "mock-creator",
        creatorName: "AI Assistant",
        isPremium: false,
        views: 1500,
        likes: 89,
        rating: 4.8,
        tags: ["AI", "Website", "React"]
      },
      // Add more mock items as needed
    ] as Reel[];
  }
}
```

## ✅ Verification Steps

After implementing the fix:

1. **No Console Errors**: Browser console should be clean
2. **Reels Load**: Homepage should show reels grid
3. **Database Populated**: Collections visible in Appwrite
4. **Full Functionality**: Can create, view, and interact with reels

## 🚨 Common Issues

### Issue: "Collection not found"
**Solution**: Wait 1-2 minutes after creating collections, then refresh

### Issue: "Permission denied"
**Solution**: Check API key permissions include database write access

### Issue: "Attribute creation failed"
**Solution**: Delete collection and recreate, or create attributes manually

### Issue: Script hangs
**Solution**: Check internet connection and Appwrite endpoint URL

## 🎯 Next Steps

Once reels are working:

1. **Add Sample Data**: Create some test reels through the UI
2. **Test All Features**: Verify likes, views, categories work
3. **Set Up File Storage**: For video uploads (if needed)
4. **Configure Permissions**: Fine-tune collection access rules

## 📞 Need Help?

If you're still having issues:

1. Check the Appwrite Console for any error messages
2. Verify all environment variables are set correctly
3. Ensure your Appwrite project is active and accessible
4. Try creating one collection manually to test connectivity

---

**After following this guide, your reels should load successfully! 🎉**