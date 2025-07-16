# 🚀 Deployment Guide for AI Freelance Platform

## Deploy to Vercel (Recommended)

### 1. Prerequisites
- GitHub account with the repository: `https://github.com/sacralpro/h-ai`
- Vercel account (free tier available)
- Appwrite account with configured project
- Stripe account (for payments)

### 2. Vercel Deployment Steps

#### Step 1: Connect GitHub Repository
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import from GitHub: `sacralpro/h-ai`
4. Select the `ai-freelance-platform` folder as root directory

#### Step 2: Configure Environment Variables
In Vercel dashboard, add these environment variables:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id

# Collection IDs (replace with your actual IDs from Appwrite Console)
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=6877a2f3002047dcde9e
NEXT_PUBLIC_APPWRITE_PROJECTS_COLLECTION_ID=your_projects_collection_id
NEXT_PUBLIC_APPWRITE_PROPOSALS_COLLECTION_ID=your_proposals_collection_id
NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID=your_messages_collection_id
NEXT_PUBLIC_APPWRITE_CONVERSATIONS_COLLECTION_ID=your_conversations_collection_id
NEXT_PUBLIC_APPWRITE_PAYMENTS_COLLECTION_ID=your_payments_collection_id
NEXT_PUBLIC_APPWRITE_MILESTONES_COLLECTION_ID=your_milestones_collection_id
NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID=your_reviews_collection_id
NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID=your_notifications_collection_id
NEXT_PUBLIC_APPWRITE_DISPUTES_COLLECTION_ID=your_disputes_collection_id
NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID=your_categories_collection_id
NEXT_PUBLIC_APPWRITE_SKILLS_COLLECTION_ID=your_skills_collection_id

# Payment Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_CRYPTO_WALLET_ADDRESS=your_crypto_wallet_address
NEXT_PUBLIC_SERVICE_FEE_PERCENTAGE=10
```

#### Step 3: Deploy
1. Click "Deploy"
2. Wait for build to complete (should take 2-3 minutes)
3. Your app will be available at `https://your-project-name.vercel.app`

### 3. Post-Deployment Setup

#### Configure Appwrite
1. In Appwrite Console, go to Auth → Settings
2. Add your Vercel domain to "Allowed Origins":
   - `https://your-project-name.vercel.app`
   - `https://your-custom-domain.com` (if using custom domain)

#### Configure Google OAuth (Optional)
1. In Google Cloud Console, add redirect URIs:
   - `https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/your_project_id`
2. Update Appwrite OAuth settings with your Google credentials

#### Configure Stripe Webhooks
1. In Stripe Dashboard, create webhook endpoint:
   - URL: `https://your-project-name.vercel.app/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
2. Copy webhook secret to `STRIPE_WEBHOOK_SECRET` environment variable

### 4. Custom Domain (Optional)
1. In Vercel dashboard, go to Project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update Appwrite allowed origins with new domain

### 5. Performance Optimization

#### Enable Analytics
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

#### Enable Speed Insights
```bash
npm install @vercel/speed-insights
```

### 6. Monitoring & Maintenance

#### Environment Variables Management
- Use Vercel CLI for bulk environment variable updates
- Keep production and preview environments in sync

#### Database Backups
- Set up regular Appwrite database backups
- Monitor collection sizes and performance

#### Error Monitoring
- Configure Sentry or similar error tracking
- Set up alerts for critical errors

### 7. Troubleshooting

#### Build Errors
- Check environment variables are correctly set
- Verify all collection IDs are valid
- Review build logs in Vercel dashboard

#### Runtime Errors
- Check Appwrite project status
- Verify API keys and permissions
- Monitor function logs

#### Performance Issues
- Enable Vercel Analytics
- Optimize images and assets
- Review database query performance

### 8. Security Checklist

- [ ] All environment variables are set correctly
- [ ] Appwrite permissions are properly configured
- [ ] Stripe is in live mode with proper keys
- [ ] CORS origins are restricted to your domains
- [ ] Rate limiting is enabled in Appwrite
- [ ] SSL/TLS is properly configured

### 9. Scaling Considerations

#### Database
- Monitor Appwrite usage limits
- Consider upgrading Appwrite plan for production
- Implement proper indexing for large datasets

#### CDN & Caching
- Vercel automatically handles CDN
- Configure proper cache headers
- Use Vercel Edge Functions for dynamic content

#### Monitoring
- Set up uptime monitoring
- Configure performance alerts
- Monitor user analytics

---

## 🎉 Your AI Freelance Platform is now live!

Visit your deployed application and start connecting AI specialists with clients worldwide.

For support, check the [GitHub repository](https://github.com/sacralpro/h-ai) or create an issue.
