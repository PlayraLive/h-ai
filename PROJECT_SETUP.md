# 🚨 Project Not Found Error - Quick Fix

## ❌ Current Error:
```
AppwriteException: Project with the requested ID could not be found. 
Please check the value of the X-Appwrite-Project header to ensure the correct project ID is being used.
```

## 🔧 Quick Fix (2 minutes):

### Step 1: Create Appwrite Project
1. **Go to**: https://cloud.appwrite.io
2. **Login/Register** with your account
3. **Click "Create Project"**
4. **Enter name**: "H-AI Freelance Platform"
5. **Copy the Project ID** (will be auto-generated)

### Step 2: Update Project ID
1. **Open** `.env.local` file in your project
2. **Replace** the Project ID:
   ```env
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_new_project_id_here
   ```
3. **Save** the file

### Step 3: Create Database
1. **In Appwrite Console** → Go to "Database"
2. **Click "Create Database"**
3. **Database ID**: `main_database`
4. **Database Name**: `Main Database`

### Step 4: Test Connection
1. **Go to your app** → Dashboard
2. **Click "Run Diagnostics"**
3. **Should show**: ✅ Connection: OK, ✅ Database: OK

### Step 5: Setup Collections
1. **Click "Setup Collections & Attributes"**
2. **Wait for completion** (creates all needed collections)
3. **Click "Create Demo Messages"** to add test data

## 🎯 That's it! Your messaging system should now work.

---

## 📋 Alternative: Use Existing Project

If you already have an Appwrite project:

1. **Go to your Appwrite Console**
2. **Select your project**
3. **Go to Settings** → Copy Project ID
4. **Update `.env.local`** with your Project ID
5. **Create database** with ID: `main_database`
6. **Run diagnostics** to verify

## 🔍 Troubleshooting:

- **Still getting errors?** → Run "Diagnostics" for detailed info
- **Database not found?** → Create database with ID: `main_database`
- **Collections missing?** → Click "Setup Collections & Attributes"
- **Auth issues?** → Add `localhost:3000` to allowed origins in Appwrite Console

## 💡 Pro Tip:
The diagnostics tool will tell you exactly what's wrong and how to fix it!
