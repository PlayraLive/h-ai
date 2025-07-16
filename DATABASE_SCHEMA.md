# 🗄️ AI Freelance Platform - Database Schema

## 📊 Overview

Полная схема базы данных для AI фриланс платформы с 12 коллекциями и всеми необходимыми атрибутами.

**Database ID**: `687796e3001241f7de17`  
**Project ID**: `687759fb003c8bd76b93`

---

## 📋 Collections Summary

| Collection | Purpose | Key Features |
|------------|---------|--------------|
| **users** | User profiles & auth | Ratings, skills, portfolio, availability |
| **projects** | Job postings | Budget, skills, deadlines, status |
| **proposals** | Freelancer bids | Cover letter, bid amount, milestones |
| **contracts** | Active work agreements | Payment terms, milestones, status |
| **reviews** | Ratings & feedback | Multi-criteria ratings, recommendations |
| **messages** | Direct messaging | Real-time chat, attachments, read status |
| **notifications** | User notifications | Type-based, priority levels, actions |
| **payments** | Payment processing | Transactions, fees, refunds |
| **portfolio** | Work showcase | Images, files, project details |
| **conversations** | Chat management | Participants, unread counts, archiving |
| **skills** | Skills database | Categories, popularity, rates |
| **categories** | Project categories | Hierarchical structure, icons |

---

## 👥 Users Collection

**Purpose**: User profiles, authentication, and freelancer/client data

### Key Attributes:
- **userId** (string) - Unique user identifier
- **name** (string) - Full name
- **email** (email) - Email address
- **userType** (string) - "freelancer" or "client"
- **avatar** (url) - Profile picture URL
- **bio** (string) - User description
- **location** (string) - Geographic location
- **timezone** (string) - User timezone
- **verified** (boolean) - Account verification status
- **online** (boolean) - Current online status
- **lastSeen** (datetime) - Last activity timestamp
- **rating** (double) - Average rating (0-5)
- **reviewCount** (integer) - Total reviews received
- **completedJobs** (integer) - Completed projects count
- **totalEarnings** (double) - Total earnings
- **successRate** (double) - Success percentage (0-100)
- **responseTime** (string) - Average response time
- **memberSince** (datetime) - Registration date
- **skills** (array[string]) - User skills
- **languages** (array[string]) - Spoken languages
- **badges** (array[string]) - Achievement badges
- **portfolioItems** (array[string]) - Portfolio item IDs
- **hourlyRate** (double) - Hourly rate
- **currency** (string) - Preferred currency
- **availability** (string) - "available", "busy", "unavailable"
- **workingHours** (string) - JSON working schedule
- **socialLinks** (string) - JSON social media links
- **preferences** (string) - JSON user preferences

---

## 📋 Projects Collection

**Purpose**: Job postings and project management

### Key Attributes:
- **title** (string) - Project title
- **description** (string) - Detailed description
- **clientId** (string) - Client user ID
- **freelancerId** (string) - Assigned freelancer ID
- **category** (string) - Project category
- **subcategory** (string) - Project subcategory
- **skills** (array[string]) - Required skills
- **budget** (double) - Project budget
- **currency** (string) - Budget currency
- **budgetType** (string) - "fixed" or "hourly"
- **duration** (string) - Expected duration
- **urgency** (string) - "low", "medium", "high", "urgent"
- **status** (string) - "open", "in_progress", "completed", "cancelled"
- **attachments** (array[string]) - File attachments
- **proposals** (integer) - Number of proposals
- **views** (integer) - View count
- **featured** (boolean) - Featured project flag
- **remote** (boolean) - Remote work allowed
- **location** (string) - Required location
- **experienceLevel** (string) - "entry", "intermediate", "expert"
- **createdAt** (datetime) - Creation timestamp
- **updatedAt** (datetime) - Last update timestamp
- **deadline** (datetime) - Project deadline
- **startDate** (datetime) - Start date
- **completedAt** (datetime) - Completion timestamp
- **tags** (array[string]) - Project tags
- **requirements** (string) - Detailed requirements
- **deliverables** (string) - Expected deliverables

---

## 💼 Proposals Collection

**Purpose**: Freelancer bids on projects

### Key Attributes:
- **projectId** (string) - Related project ID
- **freelancerId** (string) - Bidding freelancer ID
- **coverLetter** (string) - Proposal cover letter
- **bidAmount** (double) - Bid amount
- **currency** (string) - Bid currency
- **deliveryTime** (string) - Estimated delivery time
- **status** (string) - "pending", "accepted", "rejected", "withdrawn"
- **attachments** (array[string]) - Proposal attachments
- **milestones** (string) - JSON milestone breakdown
- **createdAt** (datetime) - Proposal timestamp
- **updatedAt** (datetime) - Last update timestamp

---

## 📄 Contracts Collection

**Purpose**: Active work agreements between clients and freelancers

### Key Attributes:
- **projectId** (string) - Related project ID
- **clientId** (string) - Client user ID
- **freelancerId** (string) - Freelancer user ID
- **proposalId** (string) - Accepted proposal ID
- **title** (string) - Contract title
- **description** (string) - Work description
- **amount** (double) - Contract amount
- **currency** (string) - Payment currency
- **paymentType** (string) - "fixed", "hourly", "milestone"
- **status** (string) - "active", "completed", "cancelled", "disputed"
- **startDate** (datetime) - Contract start date
- **endDate** (datetime) - Contract end date
- **deadline** (datetime) - Delivery deadline
- **milestones** (string) - JSON milestone details
- **terms** (string) - Contract terms
- **createdAt** (datetime) - Contract creation
- **updatedAt** (datetime) - Last update
- **completedAt** (datetime) - Completion timestamp

---

## ⭐ Reviews Collection

**Purpose**: Ratings and feedback system

### Key Attributes:
- **contractId** (string) - Related contract ID
- **projectId** (string) - Related project ID
- **reviewerId** (string) - Review author ID
- **revieweeId** (string) - Review target ID
- **rating** (double) - Overall rating (1-5)
- **comment** (string) - Review comment
- **skills** (array[string]) - Reviewed skills
- **skillRatings** (string) - JSON skill-specific ratings
- **communication** (double) - Communication rating (1-5)
- **quality** (double) - Quality rating (1-5)
- **timeliness** (double) - Timeliness rating (1-5)
- **wouldRecommend** (boolean) - Recommendation flag
- **isPublic** (boolean) - Public visibility
- **createdAt** (datetime) - Review timestamp

---

## 💬 Messages Collection

**Purpose**: Direct messaging system

### Key Attributes:
- **senderId** (string) - Message sender ID
- **receiverId** (string) - Message receiver ID
- **conversationId** (string) - Conversation ID
- **content** (string) - Message content
- **messageType** (string) - "text", "file", "image", "system"
- **attachments** (array[string]) - File attachments
- **isRead** (boolean) - Read status
- **readAt** (datetime) - Read timestamp
- **createdAt** (datetime) - Message timestamp
- **editedAt** (datetime) - Edit timestamp
- **isDeleted** (boolean) - Deletion flag

---

## 🔔 Notifications Collection

**Purpose**: User notification system

### Key Attributes:
- **userId** (string) - Target user ID
- **title** (string) - Notification title
- **message** (string) - Notification content
- **type** (string) - "project", "proposal", "contract", "payment", "system"
- **relatedId** (string) - Related object ID
- **relatedType** (string) - Related object type
- **isRead** (boolean) - Read status
- **readAt** (datetime) - Read timestamp
- **actionUrl** (string) - Action URL
- **priority** (string) - "low", "normal", "high", "urgent"
- **createdAt** (datetime) - Creation timestamp

---

## 💳 Payments Collection

**Purpose**: Payment processing and transaction history

### Key Attributes:
- **contractId** (string) - Related contract ID
- **payerId** (string) - Payer user ID
- **payeeId** (string) - Payee user ID
- **amount** (double) - Payment amount
- **currency** (string) - Payment currency
- **paymentMethod** (string) - "card", "paypal", "bank", "crypto"
- **status** (string) - "pending", "processing", "completed", "failed", "refunded"
- **transactionId** (string) - External transaction ID
- **gatewayResponse** (string) - JSON gateway response
- **description** (string) - Payment description
- **milestoneId** (string) - Related milestone ID
- **platformFee** (double) - Platform commission
- **netAmount** (double) - Net amount after fees
- **createdAt** (datetime) - Payment initiation
- **processedAt** (datetime) - Processing completion
- **refundedAt** (datetime) - Refund timestamp

---

## 🎨 Portfolio Collection

**Purpose**: Freelancer work showcase

### Key Attributes:
- **userId** (string) - Portfolio owner ID
- **title** (string) - Portfolio item title
- **description** (string) - Project description
- **category** (string) - Project category
- **skills** (array[string]) - Skills demonstrated
- **images** (array[string]) - Project images
- **files** (array[string]) - Project files
- **projectUrl** (url) - Live project URL
- **clientName** (string) - Client name
- **completionDate** (datetime) - Project completion
- **duration** (string) - Project duration
- **budget** (double) - Project budget
- **currency** (string) - Budget currency
- **featured** (boolean) - Featured item flag
- **isPublic** (boolean) - Public visibility
- **views** (integer) - View count
- **likes** (integer) - Like count
- **tags** (array[string]) - Project tags
- **createdAt** (datetime) - Creation timestamp
- **updatedAt** (datetime) - Last update

---

## 💬 Conversations Collection

**Purpose**: Chat conversation management

### Key Attributes:
- **participants** (array[string]) - Participant user IDs
- **projectId** (string) - Related project ID
- **contractId** (string) - Related contract ID
- **title** (string) - Conversation title
- **lastMessage** (string) - Last message preview
- **lastMessageAt** (datetime) - Last message timestamp
- **lastMessageBy** (string) - Last message sender ID
- **unreadCount** (string) - JSON unread counts per user
- **isArchived** (boolean) - Archive status
- **createdAt** (datetime) - Creation timestamp
- **updatedAt** (datetime) - Last update

---

## 🛠️ Skills Collection

**Purpose**: Available skills database

### Key Attributes:
- **name** (string) - Skill name
- **category** (string) - Skill category
- **subcategory** (string) - Skill subcategory
- **description** (string) - Skill description
- **isActive** (boolean) - Active status
- **popularity** (integer) - Usage popularity
- **averageRate** (double) - Average hourly rate
- **createdAt** (datetime) - Creation timestamp

---

## 📂 Categories Collection

**Purpose**: Project categorization system

### Key Attributes:
- **name** (string) - Category name
- **slug** (string) - URL-friendly slug
- **description** (string) - Category description
- **icon** (string) - Category icon
- **parentId** (string) - Parent category ID
- **isActive** (boolean) - Active status
- **sortOrder** (integer) - Display order
- **projectCount** (integer) - Number of projects
- **createdAt** (datetime) - Creation timestamp

---

## 🚀 Setup Commands

```bash
# Create all collections
node scripts/setup-full-database.js
node scripts/setup-additional-collections.js
node scripts/setup-final-collections.js

# List existing databases
node scripts/list-databases.js
```

---

## ✅ Status

**Database Status**: ✅ **FULLY CONFIGURED**  
**Collections**: ✅ **12/12 CREATED**  
**Attributes**: ✅ **200+ ATTRIBUTES CONFIGURED**  
**Ready for Production**: ✅ **YES**

🎉 **Your AI Freelance Platform database is ready for development!**
