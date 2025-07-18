# 🚀 H-AI Platform - Complete AI-Powered Freelancing Platform

A modern, full-featured freelancing platform specifically designed for AI specialists, developers, and creative professionals. Built with Next.js 14, Appwrite, and Stripe.

## ✨ Features

### 🎨 **Portfolio System**
- Beautiful portfolio galleries with AI project showcases
- Integration with freelancer profiles
- Real-time portfolio viewing and sharing
- Support for images, videos, and project details
- AI service tags (OpenAI, Stable Diffusion, Midjourney, etc.)

### 💼 **Project Management**
- Complete project lifecycle: Posted → Applied → In Progress → Completed → Paid
- Smart job application system with portfolio integration
- Real-time status tracking and notifications
- Project filtering and search capabilities
- Deadline and milestone management

### 💳 **Secure Payments**
- Stripe Connect integration for secure payments
- Automatic 10% platform commission
- Escrow payment system for client protection
- Real-time payment tracking and analytics
- Support for refunds and dispute resolution

### 👑 **Admin Dashboard**
- Comprehensive platform analytics
- User management (freelancers vs clients)
- Financial reporting and revenue tracking
- Real-time metrics and KPIs
- Export capabilities for reporting

### 🔐 **Authentication & Security**
- Appwrite-powered authentication
- Role-based access control
- Secure API endpoints
- OAuth integration support
- Session management

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Appwrite (Database, Auth, Storage)
- **Payments**: Stripe Connect
- **Deployment**: Vercel
- **Icons**: Heroicons

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Appwrite account
- Stripe account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/sacralpro/h-ai.git
cd h-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create `.env.local` file:
```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
APPWRITE_API_KEY=your_api_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Setup Database**
```bash
# Run database setup scripts
node scripts/create-collections.js
node scripts/create-portfolio-collections.js
node scripts/create-project-collections.js
```

5. **Seed Data**
```bash
# Create test data
node scripts/create-test-portfolio.js
node scripts/create-user-portfolio.js
node scripts/create-test-projects.js
```

6. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the platform in action!

## 📱 Key Pages

### Public Pages
- `/` - Landing page with platform overview
- `/jobs` - Browse available projects
- `/freelancers` - Find talented freelancers
- `/portfolio` - Showcase of all portfolios
- `/demo` - Complete platform demonstration

### User Pages
- `/dashboard` - User dashboard with projects and analytics
- `/jobs/[id]/apply` - Apply to specific projects
- `/freelancer/[id]/portfolio` - Individual freelancer portfolios
- `/application-success` - Application confirmation

### Admin Pages
- `/admin` - Platform analytics and management (admin only)

## 💰 Monetization

The platform automatically generates revenue through:
- **10% commission** on all completed transactions
- **Secure escrow payments** via Stripe Connect
- **Transparent fee structure** for users
- **Detailed financial reporting** for platform owners

## 🎯 User Roles

### **Freelancers**
- Create beautiful portfolios
- Apply to AI/tech projects
- Receive secure payments
- Track project progress
- Build professional reputation

### **Clients**
- Post AI-powered projects
- Review freelancer applications
- Manage project milestones
- Make secure payments
- Access project analytics

### **Admins**
- Monitor platform metrics
- Manage users and projects
- Track financial performance
- Export data and reports
- Configure platform settings

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm start
```

## 📊 Analytics & Monitoring

The admin dashboard provides:
- **User Growth**: Registration trends and user types
- **Financial Metrics**: Revenue, commissions, transaction volume
- **Project Analytics**: Success rates, completion times
- **Platform Health**: Active users, conversion rates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact: sacralprojects8@gmail.com

## 🎉 Acknowledgments

- Built with ❤️ for the AI community
- Inspired by modern freelancing platforms
- Designed for the future of AI work

---

**Ready to revolutionize AI freelancing? Start your platform today!** 🚀✨
