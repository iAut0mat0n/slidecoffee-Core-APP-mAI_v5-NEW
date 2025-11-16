# SlideCoffee v2 - Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Database Setup (Supabase)

The application uses Supabase with a `v2_` prefix for all tables. You need to run the SQL schema:

```bash
# Execute the SQL in your Supabase SQL Editor
cat database-schema.sql
```

**Tables Created:**
- `v2_users` - User accounts with credits and plans
- `v2_workspaces` - User workspaces
- `v2_brands` - Brand guidelines
- `v2_presentations` - Presentation projects
- `v2_chat_messages` - AI chat history
- `v2_presentation_plans` - Human-in-the-loop approval plans
- `v2_folders` - Organization folders
- `v2_templates` - Presentation templates
- `v2_subscriptions` - Subscription management
- `v2_credit_transactions` - Credit usage tracking
- `v2_analytics` - Usage analytics
- `v2_collaborators` - Team collaboration
- `v2_ai_settings` - AI provider configuration

### 2. Environment Variables

Create a `.env` file with these variables:

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Manus AI API (for slide generation)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_manus_api_key

# Optional: For Claude/GPT-4 providers
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
```

### 3. Supabase Authentication Setup

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Email provider
3. Enable Google OAuth (optional)
4. Set redirect URLs:
   - `http://localhost:5173` (development)
   - `https://your-domain.netlify.app` (production)

### 4. Row Level Security (RLS)

The SQL schema includes RLS policies. Verify they're enabled:

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'v2_%';
```

## 🚀 Deployment to Netlify

### Option A: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

### Option B: Deploy via Git

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit - SlideCoffee v2"
git branch -M main
git remote add origin https://github.com/yourusername/slidecoffee-v2.git
git push -u origin main
```

2. Connect to Netlify:
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Configure build settings:
     - **Build command:** `pnpm run build`
     - **Publish directory:** `dist`
     - **Functions directory:** `netlify/functions`

3. Add environment variables in Netlify:
   - Go to Site settings → Environment variables
   - Add all variables from `.env`

### Build Settings

```toml
# netlify.toml (already configured)
[build]
  command = "pnpm run build"
  publish = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "22"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 🔧 Post-Deployment Configuration

### 1. Set First Admin User

After first user signs up, promote them to admin:

```sql
UPDATE v2_users 
SET role = 'admin' 
WHERE email = 'your@email.com';
```

### 2. Configure AI Provider

1. Login as admin
2. Go to Admin Panel → AI Settings
3. Activate your preferred provider (Manus/Claude/GPT-4)

### 3. Initialize AI Settings

Run this SQL to create default AI settings:

```sql
INSERT INTO v2_ai_settings (provider, is_active, model) VALUES
('manus', true, 'gemini-2.0-flash-exp'),
('claude', false, 'claude-3-5-sonnet'),
('gpt4', false, 'gpt-4-turbo');
```

## 🧪 Testing Deployment

### 1. Test Authentication
- Sign up with new account
- Verify email confirmation
- Test Google OAuth (if enabled)

### 2. Test Onboarding
- Complete 3-step onboarding
- Create workspace
- Set up brand guidelines

### 3. Test Core Features
- Create new presentation
- Chat with AI assistant
- Generate slides
- Export presentation

### 4. Test Admin Panel
- Access admin panel (admin users only)
- Switch AI providers
- View analytics

## 📊 Monitoring

### Netlify Analytics
- Enable Netlify Analytics in dashboard
- Monitor traffic and performance

### Supabase Monitoring
- Check database usage
- Monitor API requests
- Review authentication logs

### Error Tracking
Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- PostHog for product analytics

## 🔒 Security Checklist

- [x] RLS policies enabled on all tables
- [x] API keys stored in environment variables
- [x] CORS configured properly
- [x] Authentication required for protected routes
- [ ] Rate limiting on API endpoints (recommended)
- [ ] CAPTCHA on signup (recommended)

## 🚦 Performance Optimization

### Recommended Improvements

1. **Code Splitting**
   - Lazy load routes
   - Split vendor bundles

2. **Image Optimization**
   - Use WebP format
   - Implement lazy loading
   - Add CDN for assets

3. **Caching**
   - Configure Netlify cache headers
   - Enable Supabase query caching

## 📝 Maintenance

### Regular Tasks

1. **Weekly**
   - Check error logs
   - Monitor credit usage
   - Review user feedback

2. **Monthly**
   - Update dependencies
   - Review analytics
   - Backup database

3. **Quarterly**
   - Security audit
   - Performance review
   - Feature planning

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
pnpm install
pnpm run build
```

### Database Connection Issues
- Verify Supabase URL and keys
- Check RLS policies
- Review network logs

### AI Generation Fails
- Check API keys are set
- Verify AI provider is active
- Review Netlify function logs

### Authentication Issues
- Check redirect URLs in Supabase
- Verify email templates
- Test with different browsers

## 📞 Support

For issues:
1. Check Netlify deploy logs
2. Review Supabase logs
3. Check browser console
4. Review this documentation

## 🎯 Next Steps

After successful deployment:

1. **Content**
   - Add demo presentations
   - Create tutorial videos
   - Write documentation

2. **Marketing**
   - Set up landing page SEO
   - Create social media presence
   - Launch beta program

3. **Features**
   - Implement slide templates
   - Add export to PowerPoint
   - Build collaboration features

4. **Scaling**
   - Monitor performance
   - Optimize database queries
   - Consider CDN for assets

---

**Deployment Date:** [Add date]  
**Version:** 2.0.0  
**Status:** Production Ready ✅

