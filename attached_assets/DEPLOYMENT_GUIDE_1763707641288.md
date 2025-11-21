# SlideCoffee Deployment Guide

**Last Updated:** November 21, 2025  
**Version:** 1.0.0  
**Target Platform:** Render

---

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Deployment Configuration](#deployment-configuration)
3. [Database Setup](#database-setup)
4. [Storage Configuration](#storage-configuration)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Monitoring & Logging](#monitoring--logging)
7. [Troubleshooting](#troubleshooting)

---

## Environment Variables

### Overview

SlideCoffee requires several environment variables to function correctly. These variables are configured in the Render dashboard and are automatically injected into the application at runtime.

### Required Variables

The following environment variables **must** be set for the application to work:

#### Supabase Configuration

**SUPABASE_URL**
- **Description:** The base URL of your Supabase project
- **Format:** `https://[project-id].supabase.co`
- **Example:** `https://xyzabc123.supabase.co`
- **Where to find:** Supabase Dashboard → Settings → API → Project URL
- **Required:** Yes

**SUPABASE_ANON_KEY**
- **Description:** Public anonymous key for client-side Supabase operations
- **Format:** JWT token (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)
- **Where to find:** Supabase Dashboard → Settings → API → Project API keys → `anon` `public`
- **Required:** Yes
- **Security:** Safe to expose in client-side code (respects RLS policies)

**SUPABASE_SERVICE_ROLE_KEY**
- **Description:** Server-side key with admin privileges (bypasses RLS)
- **Format:** JWT token (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)
- **Where to find:** Supabase Dashboard → Settings → API → Project API keys → `service_role` `secret`
- **Required:** Yes
- **Security:** **NEVER** expose this key in client-side code or public repositories

**SUPABASE_DB_PASSWORD**
- **Description:** Direct database connection password (for migrations and admin tasks)
- **Format:** String
- **Where to find:** Supabase Dashboard → Settings → Database → Connection string
- **Required:** Optional (only needed for direct database access)
- **Security:** Keep secret, never commit to version control

#### Application Configuration

**NODE_ENV**
- **Description:** Node.js environment mode
- **Values:** `development` | `production` | `test`
- **Default:** `production`
- **Required:** Yes
- **Usage:** Controls logging, error handling, and optimization

**PORT**
- **Description:** Port number for Express server
- **Format:** Integer (1-65535)
- **Default:** `3000`
- **Required:** No (Render sets this automatically)
- **Note:** Render overrides this with its own port

**VITE_APP_TITLE**
- **Description:** Application title displayed in browser tab and UI
- **Format:** String
- **Default:** `SlideCoffee`
- **Required:** No
- **Usage:** Used in `<title>` tag and header components

**VITE_APP_LOGO**
- **Description:** Default logo URL (can be overridden by admin upload)
- **Format:** URL or path (e.g., `/logo.png` or `https://...`)
- **Default:** `/logo.png`
- **Required:** No
- **Usage:** Fallback logo if no custom logo is uploaded

#### AI Integration (Optional)

**OPENAI_API_KEY**
- **Description:** OpenAI API key for BREW AI assistant
- **Format:** String (starts with `sk-`)
- **Where to get:** https://platform.openai.com/api-keys
- **Required:** No (but required for AI features to work)
- **Security:** Keep secret, never commit to version control

**AI_SERVICE_URL**
- **Description:** Base URL for AI service API
- **Format:** URL
- **Default:** `https://api.openai.com/v1`
- **Required:** No
- **Usage:** Override to use custom AI endpoint

#### Storage Configuration (Optional)

Supabase Storage is used by default and requires no additional configuration. However, if using external S3-compatible storage:

**S3_BUCKET_NAME**
- **Description:** S3 bucket name for file uploads
- **Format:** String
- **Required:** No (Supabase Storage used by default)

**S3_REGION**
- **Description:** AWS region for S3 bucket
- **Format:** String (e.g., `us-east-1`)
- **Required:** No

**S3_ACCESS_KEY_ID**
- **Description:** AWS access key ID
- **Format:** String
- **Required:** No
- **Security:** Keep secret

**S3_SECRET_ACCESS_KEY**
- **Description:** AWS secret access key
- **Format:** String
- **Required:** No
- **Security:** Keep secret

### Environment Variable Summary Table

| Variable | Required | Default | Sensitive | Where Used |
|----------|----------|---------|-----------|------------|
| `SUPABASE_URL` | ✅ | - | ❌ | Frontend + Backend |
| `SUPABASE_ANON_KEY` | ✅ | - | ❌ | Frontend + Backend |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | - | ✅ | Backend only |
| `SUPABASE_DB_PASSWORD` | ❌ | - | ✅ | Backend only |
| `NODE_ENV` | ✅ | `production` | ❌ | Backend |
| `PORT` | ❌ | `3000` | ❌ | Backend |
| `VITE_APP_TITLE` | ❌ | `SlideCoffee` | ❌ | Frontend |
| `VITE_APP_LOGO` | ❌ | `/logo.png` | ❌ | Frontend |
| `OPENAI_API_KEY` | ❌ | - | ✅ | Backend only |
| `AI_SERVICE_URL` | ❌ | `https://api.openai.com/v1` | ❌ | Backend |

### Setting Environment Variables in Render

The following steps explain how to configure environment variables in the Render dashboard:

1. **Navigate to Render Dashboard**
   - Go to https://dashboard.render.com
   - Log in with your account
   - Select the SlideCoffee web service

2. **Access Environment Settings**
   - Click on the service name
   - Navigate to the "Environment" tab in the left sidebar

3. **Add Variables**
   - Click "Add Environment Variable" button
   - Enter the variable name (e.g., `SUPABASE_URL`)
   - Enter the variable value
   - Click "Save Changes"

4. **Update Existing Variables**
   - Find the variable in the list
   - Click the edit icon
   - Update the value
   - Click "Save Changes"

5. **Delete Variables**
   - Find the variable in the list
   - Click the delete icon
   - Confirm deletion

6. **Trigger Redeploy**
   - After adding/updating variables, click "Manual Deploy" → "Deploy latest commit"
   - Render will rebuild and redeploy with new environment variables

### Environment Variable Best Practices

**Security:**
- Never commit `.env` files to version control
- Use different values for development and production
- Rotate sensitive keys regularly (every 90 days recommended)
- Use Render's secret management (variables are encrypted at rest)

**Organization:**
- Group related variables (e.g., all Supabase variables together)
- Use consistent naming conventions (UPPER_SNAKE_CASE)
- Document each variable's purpose in this guide
- Keep a secure backup of production values

**Validation:**
- Validate required variables at application startup
- Log missing variables with clear error messages
- Provide sensible defaults for optional variables
- Test with production-like values in staging

---

## Deployment Configuration

### Render Service Configuration

SlideCoffee is deployed as a **Web Service** on Render with the following configuration:

**Service Settings:**
- **Name:** slidecoffee
- **Region:** Oregon (US West) - or closest to target users
- **Branch:** `main` (auto-deploys on push)
- **Build Command:** `pnpm install && pnpm build`
- **Start Command:** `pnpm start`
- **Instance Type:** Starter (can upgrade to Standard or Pro)

**Auto-Deploy:**
- Enabled for `main` branch
- Deploys automatically on Git push
- Zero-downtime deployment
- Health checks before routing traffic

**Health Check:**
- **Path:** `/api/health` (recommended to implement)
- **Interval:** 30 seconds
- **Timeout:** 10 seconds
- **Unhealthy Threshold:** 3 failures

### Build Process

The build process consists of two main steps:

**Step 1: Install Dependencies**
```bash
pnpm install
```
This installs all production and development dependencies listed in `package.json`.

**Step 2: Build Application**
```bash
pnpm build
```
This runs the Vite build process, which:
- Compiles TypeScript to JavaScript
- Bundles React components
- Optimizes assets (minification, tree-shaking)
- Generates production-ready files in `dist/` directory

**Build Output:**
```
dist/
├── assets/          # Bundled JS, CSS, images
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
├── index.html       # Entry point
└── ...
```

### Start Process

The start command runs the production server:

```bash
pnpm start
```

This executes the script defined in `package.json`:
```json
{
  "scripts": {
    "start": "NODE_ENV=production node server/index.js"
  }
}
```

**Server Startup:**
1. Express server initializes
2. Connects to Supabase
3. Registers API routes
4. Serves static files from `dist/`
5. Listens on port specified by Render (usually 10000)

### Deployment Workflow

**Automatic Deployment (Recommended):**

1. Developer pushes code to `main` branch on GitHub
2. Render detects the push via webhook
3. Render pulls latest code
4. Render runs build command
5. Render runs tests (if configured)
6. Render starts new instance with updated code
7. Render performs health check
8. Render routes traffic to new instance
9. Render terminates old instance

**Manual Deployment:**

1. Navigate to Render dashboard
2. Select SlideCoffee service
3. Click "Manual Deploy" button
4. Select "Deploy latest commit" or specific commit
5. Render follows steps 3-9 above

**Deployment Time:**
- Build: ~2-5 minutes
- Health check: ~30 seconds
- Total: ~3-6 minutes

### Rollback Procedure

If a deployment introduces bugs or breaks functionality:

**Method 1: Render Dashboard Rollback**
1. Go to Render dashboard
2. Select SlideCoffee service
3. Navigate to "Events" tab
4. Find the previous successful deployment
5. Click "Rollback to this deploy"
6. Confirm rollback

**Method 2: Git Revert**
1. Identify the problematic commit:
   ```bash
   git log --oneline
   ```
2. Revert the commit:
   ```bash
   git revert <commit-hash>
   ```
3. Push to main:
   ```bash
   git push origin main
   ```
4. Render auto-deploys the reverted code

**Method 3: Force Deploy Previous Commit**
1. In Render dashboard, click "Manual Deploy"
2. Select "Deploy specific commit"
3. Choose the last known good commit
4. Confirm deployment

### Deployment Checklist

Before deploying to production, ensure the following:

**Code Quality:**
- [ ] All TypeScript errors resolved (`pnpm tsc --noEmit`)
- [ ] Linting passes (`pnpm lint`)
- [ ] No console errors in browser
- [ ] All tests pass (when implemented)

**Functionality:**
- [ ] Test critical user flows (signup, login, create project, etc.)
- [ ] Verify API endpoints respond correctly
- [ ] Check database migrations are applied
- [ ] Test file uploads work

**Configuration:**
- [ ] Environment variables are set in Render
- [ ] Supabase RLS policies are enabled
- [ ] Storage buckets exist and have correct policies
- [ ] CORS is configured for production domain

**Documentation:**
- [ ] Update `CHANGELOG.md` with new features/fixes
- [ ] Tag release in Git (`git tag v1.2.0`)
- [ ] Update version in `package.json`
- [ ] Document any breaking changes

**Monitoring:**
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Configure uptime monitoring (UptimeRobot, Pingdom, etc.)
- [ ] Set up alerts for critical errors
- [ ] Review Render logs after deployment

---

## Database Setup

### Supabase Project Creation

If starting from scratch, create a new Supabase project:

1. **Create Account**
   - Go to https://supabase.com
   - Sign up with GitHub, Google, or email

2. **Create Project**
   - Click "New Project"
   - Choose organization
   - Enter project name: `slidecoffee`
   - Enter database password (save securely!)
   - Select region (choose closest to users)
   - Click "Create new project"

3. **Wait for Provisioning**
   - Project creation takes ~2 minutes
   - Database, API, and storage are automatically configured

### Database Migrations

SlideCoffee uses SQL migrations to manage database schema changes. All migration files are located in `supabase/migrations/`.

**Current Migrations:**
1. `add_system_settings.sql` - Creates `v2_system_settings` table for logo storage

**Running Migrations:**

**Option 1: Supabase Dashboard (Recommended)**
1. Open Supabase dashboard
2. Navigate to "SQL Editor"
3. Click "New query"
4. Copy contents of migration file
5. Paste into editor
6. Click "Run"
7. Verify success message

**Option 2: Supabase CLI**
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref <project-id>

# Run migrations
supabase db push
```

**Option 3: Direct PostgreSQL Connection**
```bash
# Get connection string from Supabase dashboard
# Settings → Database → Connection string → URI

psql "postgresql://postgres:[password]@[host]:5432/postgres" \
  -f supabase/migrations/add_system_settings.sql
```

### Database Schema

**Core Tables:**

**v2_users**
```sql
CREATE TABLE v2_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**v2_workspaces**
```sql
CREATE TABLE v2_workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT,
  owner_id UUID REFERENCES v2_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**v2_brands**
```sql
CREATE TABLE v2_brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES v2_workspaces(id),
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  font_family TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**v2_projects**
```sql
CREATE TABLE v2_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES v2_workspaces(id),
  brand_id UUID REFERENCES v2_brands(id),
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  slides JSONB,
  created_by UUID REFERENCES v2_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**v2_system_settings**
```sql
CREATE TABLE v2_system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS)

All tables must have RLS enabled to ensure data security:

**Enable RLS:**
```sql
ALTER TABLE v2_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_system_settings ENABLE ROW LEVEL SECURITY;
```

**Example Policies:**

**Users can read their own data:**
```sql
CREATE POLICY "Users can view own profile"
  ON v2_users FOR SELECT
  TO authenticated
  USING (id = auth.uid());
```

**Users can read workspace data they own:**
```sql
CREATE POLICY "Users can view own workspaces"
  ON v2_workspaces FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());
```

**Users can read projects in their workspaces:**
```sql
CREATE POLICY "Users can view workspace projects"
  ON v2_projects FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT id FROM v2_workspaces
      WHERE owner_id = auth.uid()
    )
  );
```

**System settings are readable by all authenticated users:**
```sql
CREATE POLICY "Authenticated users can read settings"
  ON v2_system_settings FOR SELECT
  TO authenticated
  USING (true);
```

**Only admins can update system settings:**
```sql
CREATE POLICY "Admins can update settings"
  ON v2_system_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM v2_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Database Backup

**Automatic Backups:**
- Supabase automatically backs up databases daily
- Backups are retained for 7 days (Free tier) or 30 days (Pro tier)
- Point-in-time recovery available on Pro tier

**Manual Backup:**
```bash
# Using pg_dump
pg_dump "postgresql://postgres:[password]@[host]:5432/postgres" \
  > backup_$(date +%Y%m%d).sql

# Restore from backup
psql "postgresql://postgres:[password]@[host]:5432/postgres" \
  < backup_20251121.sql
```

### Database Monitoring

**Supabase Dashboard:**
- Navigate to "Database" → "Monitoring"
- View query performance
- Check connection pool usage
- Monitor table sizes

**Performance Optimization:**
- Add indexes for frequently queried columns
- Use `EXPLAIN ANALYZE` to optimize slow queries
- Monitor and terminate long-running queries
- Set up query caching where appropriate

---

## Storage Configuration

### Supabase Storage Setup

SlideCoffee uses Supabase Storage for file uploads (logos, images, presentations).

**Create Storage Buckets:**

1. **Navigate to Storage**
   - Open Supabase dashboard
   - Click "Storage" in sidebar

2. **Create Buckets**
   - Click "New bucket"
   - Create the following buckets:
     - `logos` - For brand and system logos
     - `presentations` - For uploaded presentation files
     - `assets` - For user-uploaded images and media

3. **Configure Bucket Settings**
   - **Public:** Enable for `logos` (so logos are publicly accessible)
   - **Private:** Enable for `presentations` and `assets` (require authentication)
   - **File size limit:** 10 MB for logos, 50 MB for presentations
   - **Allowed MIME types:** Configure based on bucket purpose

### Storage Policies

**Logo Bucket (Public):**
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'logos');

-- Allow public read access
CREATE POLICY "Public can view logos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'logos');

-- Allow admins to delete
CREATE POLICY "Admins can delete logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'logos' AND
    EXISTS (
      SELECT 1 FROM v2_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

**Presentations Bucket (Private):**
```sql
-- Users can upload to their own workspace folder
CREATE POLICY "Users can upload presentations"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'presentations' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM v2_workspaces
      WHERE owner_id = auth.uid()
    )
  );

-- Users can read their own presentations
CREATE POLICY "Users can view own presentations"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'presentations' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM v2_workspaces
      WHERE owner_id = auth.uid()
    )
  );
```

### File Upload Implementation

**Backend Route (Example):**
```typescript
// server/routes/system-settings.ts
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const upload = multer({ storage: multer.memoryStorage() });

router.post('/logo', upload.single('logo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Upload to Supabase Storage
  const fileName = `logo-${Date.now()}.${req.file.mimetype.split('/')[1]}`;
  const { data, error } = await supabase.storage
    .from('logos')
    .upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: true,
    });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('logos')
    .getPublicUrl(fileName);

  // Save to database
  await supabase
    .from('v2_system_settings')
    .upsert({
      key: 'app_logo_url',
      value: urlData.publicUrl,
    });

  res.json({ logo_url: urlData.publicUrl });
});
```

### Storage Limits

**Supabase Storage Limits:**
- **Free Tier:** 1 GB total storage
- **Pro Tier:** 100 GB total storage
- **File Size Limit:** 50 MB per file (can be increased)
- **Bandwidth:** Unlimited on all tiers

**Recommended Limits:**
- Logo files: Max 2 MB (PNG, JPG, SVG)
- Presentation files: Max 50 MB (PPT, PPTX, PDF)
- Image assets: Max 10 MB (PNG, JPG, WebP)

---

## CI/CD Pipeline

### Current Setup

SlideCoffee uses **Render's built-in CI/CD** with automatic deployments from GitHub.

**Pipeline Steps:**
1. Developer pushes to `main` branch
2. GitHub webhook triggers Render
3. Render pulls latest code
4. Render runs `pnpm install && pnpm build`
5. Render starts new instance
6. Render performs health check
7. Render routes traffic to new instance
8. Render terminates old instance

### Future Enhancements

**Recommended CI/CD Improvements:**

**1. GitHub Actions for Testing**
```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm tsc --noEmit
      - run: pnpm test # when tests are added
```

**2. Staging Environment**
- Create separate Render service for staging
- Deploy `develop` branch to staging
- Test features before merging to `main`
- Automated testing on staging

**3. Database Migrations in CI**
- Run migrations automatically on deploy
- Verify migrations in staging first
- Rollback capability for failed migrations

**4. Performance Testing**
- Lighthouse CI for performance metrics
- Bundle size tracking
- Load testing with k6 or Artillery

---

## Monitoring & Logging

### Render Monitoring

**Built-in Metrics:**
- CPU usage
- Memory usage
- Request count
- Response time
- Error rate

**Accessing Logs:**
1. Go to Render dashboard
2. Select SlideCoffee service
3. Click "Logs" tab
4. View real-time logs
5. Filter by date/time
6. Search for specific errors

**Log Retention:**
- Free tier: 7 days
- Starter tier: 30 days
- Standard/Pro tier: 90 days

### Application Logging

**Current Logging:**
```typescript
// server/index.ts
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});
```

**Recommended Logging Library:**
```bash
pnpm add winston
```

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
});

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});
```

### Error Tracking

**Recommended: Sentry**

1. **Install Sentry:**
```bash
pnpm add @sentry/node @sentry/react
```

2. **Configure Backend:**
```typescript
// server/index.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

3. **Configure Frontend:**
```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
});
```

### Uptime Monitoring

**Recommended: UptimeRobot**

1. Create free account at https://uptimerobot.com
2. Add monitor:
   - Monitor Type: HTTP(s)
   - URL: `https://your-app.onrender.com`
   - Monitoring Interval: 5 minutes
3. Set up alerts:
   - Email notifications
   - Slack integration
   - SMS alerts (paid)

---

## Troubleshooting

### Common Deployment Issues

**Issue: Build Fails with "Out of Memory"**
```
Error: JavaScript heap out of memory
```
**Solution:**
- Upgrade Render instance type (Starter → Standard)
- Or increase Node.js memory limit:
```json
{
  "scripts": {
    "build": "NODE_OPTIONS=--max-old-space-size=4096 vite build"
  }
}
```

**Issue: Environment Variables Not Loading**
```
Error: SUPABASE_URL is not defined
```
**Solution:**
- Verify variables are set in Render dashboard
- Check variable names match exactly (case-sensitive)
- Trigger manual redeploy after adding variables
- For Vite variables, ensure they start with `VITE_`

**Issue: Database Connection Fails**
```
Error: Connection terminated unexpectedly
```
**Solution:**
- Check Supabase project is active
- Verify `SUPABASE_URL` and keys are correct
- Check IP allowlist in Supabase (should allow all IPs)
- Verify RLS policies aren't blocking access

**Issue: Static Files Not Loading**
```
Error: Failed to load resource: 404 Not Found
```
**Solution:**
- Verify build output exists in `dist/` directory
- Check Express static file serving:
```typescript
app.use(express.static('dist'));
```
- Ensure paths in HTML are relative (not absolute)

**Issue: CORS Errors**
```
Error: Access to fetch has been blocked by CORS policy
```
**Solution:**
- Configure CORS in Express:
```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://your-app.onrender.com'
    : 'http://localhost:5173',
  credentials: true,
}));
```

### Performance Issues

**Issue: Slow Initial Load**
**Solution:**
- Implement code splitting:
```typescript
const Dashboard = lazy(() => import('./pages/Dashboard'));
```
- Enable Vite build optimizations
- Use CDN for static assets
- Implement service worker for caching

**Issue: High Memory Usage**
**Solution:**
- Upgrade Render instance
- Optimize database queries
- Implement pagination for large datasets
- Use React.memo for expensive components

### Database Issues

**Issue: RLS Policy Blocks Query**
```
Error: new row violates row-level security policy
```
**Solution:**
- Review RLS policies in Supabase dashboard
- Use service role key for admin operations
- Check user authentication status
- Verify user has correct permissions

**Issue: Migration Fails**
```
Error: relation "v2_users" already exists
```
**Solution:**
- Check if migration was already applied
- Use `IF NOT EXISTS` in CREATE statements
- Maintain migration history table
- Test migrations in staging first

---

**End of Deployment Guide**

*Last updated: November 21, 2025*

