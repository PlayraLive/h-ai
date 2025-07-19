# 📱 Messages System Setup Guide

## 🎯 Quick Setup Instructions

To enable the messaging system, you need to create two collections in your Appwrite Console:

### 1. Create "messages" Collection

1. Go to your Appwrite Console → Database → Create Collection
2. **Collection ID**: `messages`
3. **Collection Name**: `Messages`

**Attributes to add:**
- `text` (String, 2000 chars, Required)
- `sender_id` (String, 50 chars, Required)
- `receiver_id` (String, 50 chars, Required)
- `conversation_id` (String, 50 chars, Required)
- `timestamp` (DateTime, Required)
- `read` (Boolean, Required, Default: false)
- `message_type` (Enum: text,file,image, Required, Default: text)
- `file_url` (String, 500 chars, Optional)
- `file_name` (String, 255 chars, Optional)
- `project_id` (String, 50 chars, Optional)

**Permissions:**
- Read: Any
- Create: Users
- Update: Users
- Delete: Users

### 2. Create "conversations" Collection

1. Go to your Appwrite Console → Database → Create Collection
2. **Collection ID**: `conversations`
3. **Collection Name**: `Conversations`

**Attributes to add:**
- `participants` (String Array, 50 chars each, Required)
- `last_message` (String, 500 chars, Optional)
- `last_message_time` (DateTime, Required)
- `unread_count` (String, 1000 chars, Optional) - stores JSON
- `project_id` (String, 50 chars, Optional)
- `project_title` (String, 255 chars, Optional)
- `created_at` (DateTime, Required)
- `updated_at` (DateTime, Required)

**Permissions:**
- Read: Any
- Create: Users
- Update: Users
- Delete: Users

### 3. Create Indexes (Optional but Recommended)

**For messages collection:**
- Index: `conversation_messages` → Key: conversation_id, timestamp
- Index: `sender_messages` → Key: sender_id, timestamp
- Index: `unread_messages` → Key: receiver_id, read

**For conversations collection:**
- Index: `user_conversations` → Key: participants, updated_at
- Index: `project_conversations` → Key: project_id

## 🚀 Testing the System

1. **Create Collections** as described above
2. **Go to Dashboard** → Click "Setup Collections" to verify
3. **Create Demo Messages** → Click "Create Demo Messages"
4. **Test Messaging** → Go to Messages page and start chatting!

## 🔧 Environment Variables

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID=messages
NEXT_PUBLIC_APPWRITE_CONVERSATIONS_COLLECTION_ID=conversations
```

## 📊 Features Available

✅ **Real-time messaging** between users
✅ **Conversation management** with participants
✅ **Unread message counters**
✅ **Search users** to start new conversations
✅ **Message history** with timestamps
✅ **Online status** indicators
✅ **Project-linked conversations** (optional)

## 🐛 Troubleshooting

**"Collection not found" errors:**
- Make sure collection IDs match exactly: `messages` and `conversations`
- Check that collections are created in the correct database
- Verify permissions are set correctly

**Messages not sending:**
- Check browser console for detailed error messages
- Ensure user is authenticated
- Verify collection permissions allow Create/Update for Users

**Demo data not creating:**
- Make sure you have at least 2 users in the users collection
- Check that both collections exist before creating demo data
- Look at browser console for specific error details

## 💡 Tips

- **Start simple**: Create collections manually first, then test with demo data
- **Check permissions**: Make sure Users can Create/Read/Update documents
- **Use indexes**: They significantly improve query performance
- **Monitor console**: All operations log detailed information for debugging

Happy messaging! 🎉
