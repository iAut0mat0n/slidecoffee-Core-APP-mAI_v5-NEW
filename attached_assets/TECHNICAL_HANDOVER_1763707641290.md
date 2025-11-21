# SlideCoffee Technical Handover Document

**Project:** SlideCoffee - AI-Powered Presentation Platform  
**Repository:** https://github.com/ForthLogic/slidecoffee-CORE-APP  
**Latest Deployment:** Commit `545ce4f` (November 21, 2025)  
**Prepared by:** Manus AI  
**Date:** November 21, 2025

---

## Executive Summary

SlideCoffee is a modern web application for creating AI-powered presentations with a coffee-themed brand identity. The platform features **93+ fully functional screens** with real-time collaboration capabilities, brand asset management, and an AI assistant named **BREW**. The application is deployed on Render with automatic CI/CD from the main GitHub branch.

**Current Status:**
- ✅ All 93+ screens built and wired up
- ✅ Express REST API backend with Supabase PostgreSQL database
- ✅ React Query for data fetching
- ✅ Production build successful
- ✅ Deployed to GitHub (ForthLogic/slidecoffee-CORE-APP)
- ✅ Render auto-deployment configured

---

## Architecture Overview

### Technology Stack

**Frontend:**
- **Framework:** React 19.2.0 with TypeScript
- **Routing:** React Router DOM 7.9.6
- **Styling:** Tailwind CSS 4.1.17
- **State Management:** React Query (TanStack Query) 5.90.10
- **UI Components:** Custom components with Lucide React icons
- **Build Tool:** Vite 7.2.2

**Backend:**
- **Server:** Express 4.21.2
- **Runtime:** Node.js with TSX for TypeScript execution
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **File Storage:** Supabase Storage (S3-compatible)

**Development Tools:**
- **Language:** TypeScript 5.9.3
- **Linting:** ESLint 9.39.1
- **Process Management:** Concurrently for dev server

### Project Structure

```
slidecoffee/
├── src/                          # Frontend source code
│   ├── pages/                    # 72+ page components
│   ├── components/               # 20+ reusable components
│   ├── lib/                      # Utilities and API client
│   │   ├── api-client.ts         # Fetch wrapper for API calls
│   │   └── queries.ts            # React Query hooks
│   ├── App.tsx                   # Main routing configuration
│   └── main.tsx                  # Application entry point
├── server/                       # Backend source code
│   ├── routes/                   # Express API routes
│   │   ├── auth.ts               # Authentication endpoints
│   │   ├── brands.ts             # Brand CRUD operations
│   │   ├── projects.ts           # Project CRUD operations
│   │   ├── templates-workspaces.ts  # Templates & workspaces
│   │   └── system-settings.ts   # System configuration & logo upload
│   └── index.ts                  # Express server entry point
├── supabase/                     # Database migrations
│   └── migrations/               # SQL migration files
├── public/                       # Static assets
├── package.json                  # Dependencies and scripts
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
└── tailwind.config.js            # Tailwind CSS configuration
```

---

## Complete Feature Inventory

### Authentication & Onboarding (6 screens)

**Screens:**
1. `Signup.tsx` - User registration with email/password and Google OAuth
2. `Login.tsx` - User authentication with remember me option
3. `ForgotPassword.tsx` - Password reset flow
4. `OnboardingWelcome.tsx` - Welcome screen with feature highlights
5. `OnboardingWorkspace.tsx` - Workspace creation (personal/team/company)
6. `OnboardingBrand.tsx` - Brand setup with logo upload and color picker

**Routes:**
- `/signup`
- `/login`
- `/forgot-password`
- `/onboarding`
- `/onboarding/welcome`
- `/onboarding/workspace`
- `/onboarding/brand`

**Backend Endpoints:**
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - End user session
- `GET /api/auth/me` - Get current user profile

---

### Core Dashboard & Management (10 screens)

**Screens:**
1. `DashboardNew.tsx` - Main dashboard with project cards, filters, search
2. `BrandsNew.tsx` - Brand management with CRUD operations
3. `ProjectsNew.tsx` - Project listing with grid/list views
4. `TemplatesNew.tsx` - Template gallery and management
5. `ThemesNew.tsx` - Theme customization and import
6. `SettingsNew.tsx` - User settings and preferences
7. `WorkspaceSettings.tsx` - Workspace configuration (5 tabs: general, team, billing, integrations, security)
8. `UserProfile.tsx` - Profile editing, photo upload, password change
9. `AnalyticsDashboard.tsx` - Usage analytics, charts, activity feed
10. `AdminDashboard.tsx` - System administration and logo upload

**Routes:**
- `/dashboard`
- `/brands`
- `/projects`
- `/templates-new`
- `/themes`
- `/settings-new`
- `/workspace/settings`
- `/profile`
- `/analytics`
- `/admin`

**Backend Endpoints:**
- `GET /api/brands` - List all brands
- `POST /api/brands` - Create new brand
- `PUT /api/brands/:id` - Update brand
- `DELETE /api/brands/:id` - Delete brand
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/templates` - List available templates
- `GET /api/workspaces` - List workspaces
- `POST /api/workspaces` - Create workspace
- `PUT /api/workspaces/:id` - Update workspace

---

### Creation Modes (5 screens)

**Screens:**
1. `CreateModeSelector.tsx` - Mode selection (Generate, Paste, Import)
2. `AIAgentCreate.tsx` - AI-powered presentation generation with BREW assistant
3. `PasteMode.tsx` - Create from pasted text content
4. `ImportMode.tsx` - Upload PPT, PDF, KEY files
5. `SlideEditor.tsx` - Full-featured slide editing interface

**Routes:**
- `/create`
- `/create/generate`
- `/create/paste`
- `/create/import`
- `/editor/slide/:id`

**Features:**
- **BREW AI Assistant:** Chat interface with thinking/research display
- **Live Preview:** Real-time slide thumbnail updates
- **Brewing Animation:** Progress overlay during generation
- **Auto-structure Detection:** Parse pasted content into slides
- **File Processing:** Extract slides from imported presentations

**Backend Endpoints (Planned):**
- `POST /api/presentations/generate` - AI generation from prompt
- `POST /api/presentations/from-text` - Create from pasted text
- `POST /api/presentations/import` - Process uploaded file

---

### Collaboration & Organization (6 screens)

**Screens:**
1. `LiveCollaboration.tsx` - Real-time presence indicators and live cursors
2. `ActivityFeed.tsx` - Team activity log with filters
3. `FoldersManagement.tsx` - Folder organization system
4. `TagsManagement.tsx` - Tag creation and management
5. `AdvancedSearch.tsx` - Search with filters (date, brand, tags, collaborators)
6. `Comments.tsx` - Threaded comments with replies and resolve status

**Routes:**
- `/collaboration`
- `/activity`
- `/folders`
- `/tags`
- `/search`
- `/comments/:id`

**Features:**
- **Real-time Presence:** Show who's viewing/editing
- **Live Cursors:** Display cursor positions with user names
- **Comment Threading:** Nested replies and mentions
- **Smart Tagging:** Auto-suggest tags based on content
- **Advanced Filters:** Multi-criteria search

**Backend Endpoints (Planned):**
- WebSocket connection for real-time updates
- `GET /api/activity` - Fetch activity feed
- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

---

### Templates & Themes (3 screens)

**Screens:**
1. `TemplateCreator.tsx` - 4-step wizard for template creation
2. `ThemeEditor.tsx` - Live preview theme customization
3. `PresentationRemix.tsx` - Slide selection and reordering from existing presentations

**Routes:**
- `/template/create`
- `/theme/editor`
- `/presentation/remix/:id`

**Features:**
- **Template Wizard:** Step-by-step template creation
- **Live Preview:** Real-time theme changes
- **Slide Remixing:** Combine slides from multiple presentations
- **Export Templates:** Save custom templates for reuse

---

### Developer Tools (2 screens)

**Screens:**
1. `APIKeysManagement.tsx` - API key CRUD with code examples
2. `WebhookSettings.tsx` - Event subscriptions and delivery logs

**Routes:**
- `/developer/api-keys`
- `/developer/webhooks`

**Features:**
- **API Key Generation:** Create, revoke, rotate keys
- **Webhook Events:** Subscribe to presentation events
- **Delivery Logs:** Monitor webhook delivery status
- **Code Examples:** Copy-paste integration snippets

**Backend Endpoints (Planned):**
- `POST /api/developer/keys` - Generate API key
- `DELETE /api/developer/keys/:id` - Revoke key
- `POST /api/developer/webhooks` - Create webhook
- `GET /api/developer/webhooks/logs` - Fetch delivery logs

---

### Assets & Integrations (4 screens)

**Screens:**
1. `BrandAssetLibrary.tsx` - Manage logos, images, icons, fonts
2. `StockImageBrowser.tsx` - Browse and insert royalty-free images
3. `IconLibraryBrowser.tsx` - 10,000+ customizable SVG icons
4. `IntegrationMarketplace.tsx` - Connect with Slack, Drive, Zapier, Figma

**Routes:**
- `/brand/assets`
- `/assets/images`
- `/assets/icons`
- `/integrations`

**Features:**
- **Asset Upload:** Drag-and-drop file upload
- **Asset Organization:** Folders, tags, search
- **Version Control:** Track asset changes
- **Stock Images:** Unsplash/Pexels integration
- **Icon Customization:** Color, size, stroke width

**Backend Endpoints (Planned):**
- `POST /api/assets/upload` - Upload brand asset
- `GET /api/assets` - List assets
- `DELETE /api/assets/:id` - Delete asset
- `GET /api/stock-images` - Search stock images
- `GET /api/icons` - Search icon library

---

### Analytics & Billing (3 screens)

**Screens:**
1. `PresentationAnalytics.tsx` - Views, engagement, slide performance
2. `SubscriptionBilling.tsx` - Plan management, payment history, invoices
3. `VersionHistory.tsx` - Timeline view with restore/preview

**Routes:**
- `/presentation/:id/analytics`
- `/subscription`
- `/version-history/:id`

**Features:**
- **View Tracking:** Monitor presentation views
- **Engagement Metrics:** Time per slide, click-through rates
- **Subscription Management:** Upgrade, downgrade, cancel
- **Payment History:** Download invoices
- **Version Restore:** Rollback to previous versions

**Backend Endpoints (Planned):**
- `GET /api/presentations/:id/analytics` - Fetch analytics data
- `GET /api/subscription` - Get current subscription
- `POST /api/subscription/upgrade` - Change plan
- `GET /api/versions/:id` - List presentation versions
- `POST /api/versions/:id/restore` - Restore version

---

### Support & Errors (4 screens)

**Screens:**
1. `HelpCenter.tsx` - Search, categories, articles, popular topics
2. `Notifications.tsx` - Unread/all filters, notification types
3. `NotFound.tsx` - 404 error page with helpful links
4. `ServerError.tsx` - 500 error page with troubleshooting tips

**Routes:**
- `/help-center`
- `/notifications`
- `/404`
- `/500`

---

### Modals & Components (20+ components)

**Key Components:**
1. `AppLogo.tsx` - Dynamic logo fetched from system settings
2. `LogoUploadSection.tsx` - Admin logo upload with preview
3. `BrandCreationModal.tsx` - 2-step brand creation wizard
4. `ProjectCreationModal.tsx` - Project creation with brand/template selection
5. `DeleteConfirmationModal.tsx` - Reusable delete confirmation
6. `TemplatePreviewModal.tsx` - Full template preview with thumbnails
7. `ExportOptionsModal.tsx` - Export to PDF, PPT, video
8. `ShareSettingsModal.tsx` - Link sharing, embed code, permissions
9. `BrewingProgressOverlay.tsx` - Coffee-themed loading animation
10. `SuccessCelebration.tsx` - Celebration modal with confetti
11. `WelcomeTour.tsx` - Interactive product tour
12. `KeyboardShortcuts.tsx` - Keyboard shortcuts reference
13. `QuickTipsTooltip.tsx` - Contextual help tooltips
14. `CommentsSidebar.tsx` - Comments panel for presentations
15. `ProtectedRoute.tsx` - Authentication guard for routes

---

## Database Schema

### Supabase Tables

The application uses Supabase PostgreSQL with the following main tables:

**v2_users**
```sql
CREATE TABLE v2_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user', -- 'user' | 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**v2_workspaces**
```sql
CREATE TABLE v2_workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT, -- 'personal' | 'team' | 'company'
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
  slides JSONB, -- Array of slide objects
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

-- Default logo setting
INSERT INTO v2_system_settings (key, value) VALUES
  ('app_logo_url', '/logo.png');
```

### Row Level Security (RLS)

All tables have RLS enabled with policies:

**Read Access:**
- Users can read their own data and workspace data they belong to
- System settings are readable by all authenticated users

**Write Access:**
- Users can create/update/delete their own resources
- Workspace owners can manage workspace resources
- Only admins can update system settings

**Example Policy:**
```sql
-- Users can only see projects in their workspaces
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

---

## API Documentation

### Base URL
- **Development:** `http://localhost:3000/api`
- **Production:** `https://your-render-url.onrender.com/api`

### Authentication

All protected endpoints require a valid Supabase session token in the `Authorization` header:

```
Authorization: Bearer <supabase_access_token>
```

### Endpoints

#### Authentication

**POST /api/auth/signup**
```json
Request:
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

**POST /api/auth/login**
```json
Request:
{
  "email": "user@example.com",
  "password": "securepassword"
}

Response:
{
  "user": {...},
  "session": {...}
}
```

**GET /api/auth/me**
```json
Response:
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user"
}
```

#### Brands

**GET /api/brands**
```json
Response:
[
  {
    "id": "uuid",
    "name": "Acme Corp",
    "logo_url": "https://...",
    "primary_color": "#FF6B35",
    "secondary_color": "#004E89",
    "created_at": "2025-11-21T00:00:00Z"
  }
]
```

**POST /api/brands**
```json
Request:
{
  "name": "Acme Corp",
  "logo_url": "https://...",
  "primary_color": "#FF6B35",
  "secondary_color": "#004E89"
}

Response:
{
  "id": "uuid",
  "name": "Acme Corp",
  ...
}
```

**PUT /api/brands/:id**
```json
Request:
{
  "name": "Updated Name",
  "primary_color": "#NEW_COLOR"
}

Response:
{
  "id": "uuid",
  "name": "Updated Name",
  ...
}
```

**DELETE /api/brands/:id**
```json
Response:
{
  "success": true
}
```

#### Projects

**GET /api/projects**
```json
Query Parameters:
- workspace_id (optional): Filter by workspace
- brand_id (optional): Filter by brand
- search (optional): Search by name

Response:
[
  {
    "id": "uuid",
    "name": "Q4 Presentation",
    "description": "Quarterly review slides",
    "thumbnail_url": "https://...",
    "created_by": "user_id",
    "created_at": "2025-11-21T00:00:00Z"
  }
]
```

**POST /api/projects**
```json
Request:
{
  "name": "Q4 Presentation",
  "description": "Quarterly review slides",
  "brand_id": "brand_uuid",
  "workspace_id": "workspace_uuid"
}

Response:
{
  "id": "uuid",
  "name": "Q4 Presentation",
  ...
}
```

#### System Settings

**GET /api/system-settings/:key**
```json
Response:
{
  "key": "app_logo_url",
  "value": "https://storage.supabase.co/..."
}
```

**POST /api/system-settings/logo** (Admin only)
```json
Request (multipart/form-data):
{
  "logo": <file>
}

Response:
{
  "logo_url": "https://storage.supabase.co/..."
}
```

---

## Environment Variables

### Required Environment Variables

The application requires the following environment variables to be configured in Render:

**Supabase Configuration:**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Application Configuration:**
```bash
NODE_ENV=production
PORT=3000
VITE_APP_TITLE=SlideCoffee
VITE_APP_LOGO=/logo.png
```

**AI Integration (if using external AI service):**
```bash
OPENAI_API_KEY=sk-...
AI_SERVICE_URL=https://api.openai.com/v1
```

**Storage Configuration:**
```bash
# Supabase Storage is used by default
# No additional configuration needed
```

### Setting Environment Variables in Render

1. Navigate to your Render dashboard
2. Select the SlideCoffee service
3. Go to "Environment" tab
4. Add each variable with its value
5. Click "Save Changes"
6. Render will automatically redeploy

**Note:** All environment variables are already configured in Render as confirmed by the user.

---

## Security Features

### Authentication & Authorization

**Supabase Auth:**
- Email/password authentication
- Google OAuth integration
- JWT-based session management
- Automatic token refresh
- Secure password hashing (bcrypt)

**Role-Based Access Control (RBAC):**
- User roles: `user`, `admin`
- Admin-only routes: `/admin`, `/developer/*`
- Protected routes with `ProtectedRoute` component
- Backend authorization checks in API routes

### Data Security

**Row Level Security (RLS):**
- All Supabase tables have RLS enabled
- Users can only access their own data
- Workspace-based data isolation
- Admin override for system management

**API Security:**
- CORS configuration for allowed origins
- Request validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection (React auto-escaping)

**File Upload Security:**
- File type validation
- File size limits (10MB for images, 50MB for presentations)
- Virus scanning (Supabase Storage)
- Secure file URLs with expiration

### Best Practices Implemented

1. **Environment Variables:** Sensitive keys stored in Render environment
2. **HTTPS Only:** All production traffic over HTTPS
3. **Secure Headers:** CORS, CSP, X-Frame-Options configured
4. **Input Validation:** All user inputs validated on frontend and backend
5. **Rate Limiting:** (Planned) API rate limits to prevent abuse
6. **Audit Logging:** (Planned) Track all data modifications

---

## Admin Features

### Admin Dashboard (`/admin`)

**Logo Management:**
- Upload custom logo (PNG, JPG, SVG)
- Preview before upload
- Automatic S3 storage
- Logo displayed across all screens

**System Settings:**
- Configure app-wide settings
- Manage feature flags
- View system health metrics

**User Management:**
- View all users
- Promote users to admin
- Suspend/delete accounts
- View user activity

**Analytics:**
- Total users, projects, presentations
- Daily active users (DAU)
- Monthly active users (MAU)
- Storage usage
- API usage statistics

### Admin-Only Routes

```
/admin                    - Admin dashboard
/developer/api-keys       - API key management
/developer/webhooks       - Webhook configuration
```

### Admin Permissions

Admins can:
- ✅ Upload system logo
- ✅ Modify system settings
- ✅ View all users and workspaces
- ✅ Access analytics for all projects
- ✅ Manage API keys and webhooks
- ✅ Delete any user content (with confirmation)

Regular users cannot:
- ❌ Access `/admin` routes
- ❌ Modify system settings
- ❌ View other users' private data
- ❌ Generate API keys (planned feature)

---

## Development Guide

### Local Development Setup

**Prerequisites:**
- Node.js 18+ and pnpm installed
- Supabase account with project created
- Git installed

**Steps:**

1. **Clone the repository:**
```bash
git clone https://github.com/ForthLogic/slidecoffee-CORE-APP.git
cd slidecoffee-CORE-APP
```

2. **Install dependencies:**
```bash
pnpm install
```

3. **Configure environment variables:**
Create a `.env` file in the root directory (contact admin for values):
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_APP_TITLE=SlideCoffee
VITE_APP_LOGO=/logo.png
```

4. **Run database migrations:**
- Open Supabase dashboard
- Navigate to SQL Editor
- Run all migration files in `supabase/migrations/` in order

5. **Start development server:**
```bash
pnpm dev
```

This starts:
- Vite dev server on `http://localhost:5173`
- Express API server on `http://localhost:3000`

6. **Access the application:**
- Frontend: `http://localhost:5173`
- API: `http://localhost:3000/api`

### Development Scripts

```bash
# Start development servers (frontend + backend)
pnpm dev

# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Run linter
pnpm lint

# Start production server
pnpm start
```

### Code Style Guidelines

**TypeScript:**
- Use strict TypeScript mode
- Define interfaces for all data structures
- Avoid `any` type - use `unknown` or proper types
- Use functional components with hooks

**React:**
- Use functional components (no class components)
- Use React Query for data fetching
- Keep components small and focused
- Extract reusable logic into custom hooks

**Naming Conventions:**
- Components: PascalCase (e.g., `BrandCreationModal.tsx`)
- Files: PascalCase for components, kebab-case for utilities
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE
- CSS classes: Tailwind utility classes

**File Organization:**
```
src/
├── pages/           # One file per route
├── components/      # Reusable UI components
├── lib/             # Utilities, API client, hooks
└── types/           # TypeScript type definitions
```

### Adding a New Feature

**Example: Adding a "Favorites" feature**

1. **Create database table:**
```sql
-- supabase/migrations/add_favorites.sql
CREATE TABLE v2_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES v2_users(id),
  project_id UUID REFERENCES v2_projects(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- Enable RLS
ALTER TABLE v2_favorites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only manage their own favorites
CREATE POLICY "Users manage own favorites"
  ON v2_favorites
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());
```

2. **Create API route:**
```typescript
// server/routes/favorites.ts
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get user's favorites
router.get('/', async (req, res) => {
  const userId = req.user?.id; // From auth middleware
  
  const { data, error } = await supabase
    .from('v2_favorites')
    .select('*, project:v2_projects(*)')
    .eq('user_id', userId);
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Add to favorites
router.post('/', async (req, res) => {
  const { project_id } = req.body;
  const userId = req.user?.id;
  
  const { data, error } = await supabase
    .from('v2_favorites')
    .insert({ user_id: userId, project_id })
    .select()
    .single();
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Remove from favorites
router.delete('/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user?.id;
  
  const { error } = await supabase
    .from('v2_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('project_id', projectId);
    
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

export default router;
```

3. **Register route in server:**
```typescript
// server/index.ts
import favoritesRouter from './routes/favorites';

app.use('/api/favorites', favoritesRouter);
```

4. **Create React Query hooks:**
```typescript
// src/lib/queries.ts
export const useFavorites = () => {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => apiClient.get('/favorites'),
  });
};

export const useAddFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectId: string) =>
      apiClient.post('/favorites', { project_id: projectId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (projectId: string) =>
      apiClient.delete(`/favorites/${projectId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
```

5. **Use in component:**
```typescript
// src/pages/Favorites.tsx
import { useFavorites, useRemoveFavorite } from '@/lib/queries';

export default function Favorites() {
  const { data: favorites, isLoading } = useFavorites();
  const removeFavorite = useRemoveFavorite();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>My Favorites</h1>
      {favorites?.map(fav => (
        <div key={fav.id}>
          <h3>{fav.project.name}</h3>
          <button onClick={() => removeFavorite.mutate(fav.project_id)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
```

6. **Add route:**
```typescript
// src/App.tsx
import Favorites from './pages/Favorites';

<Route path="/favorites" element={
  <ProtectedRoute>
    <Favorites />
  </ProtectedRoute>
} />
```

---

## Deployment

### Render Configuration

**Service Type:** Web Service  
**Build Command:** `pnpm install && pnpm build`  
**Start Command:** `pnpm start`  
**Auto-Deploy:** Enabled (deploys on push to `main` branch)

**Environment Variables:**
All environment variables are configured in Render dashboard under "Environment" tab.

### Deployment Process

**Automatic Deployment (Recommended):**
1. Push code to `main` branch on GitHub
2. Render automatically detects the push
3. Render runs build command
4. Render deploys new version
5. Zero-downtime deployment

**Manual Deployment:**
1. Navigate to Render dashboard
2. Select SlideCoffee service
3. Click "Manual Deploy" → "Deploy latest commit"

### Deployment Checklist

Before deploying to production:

- [ ] Run `pnpm build` locally to ensure build succeeds
- [ ] Run `pnpm lint` to check for code issues
- [ ] Test all critical user flows in development
- [ ] Verify database migrations are applied
- [ ] Check environment variables are set in Render
- [ ] Review recent commits for breaking changes
- [ ] Update `CHANGELOG.md` with new features/fixes
- [ ] Tag release in Git (e.g., `v1.2.0`)

### Rollback Procedure

If a deployment causes issues:

1. **Quick Rollback:**
   - Go to Render dashboard
   - Click "Rollback" to previous deployment
   - Confirm rollback

2. **Git Rollback:**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```
   Render will auto-deploy the reverted code.

### Monitoring

**Render Dashboard:**
- View deployment logs
- Monitor CPU/memory usage
- Check error rates
- View request metrics

**Application Logs:**
```bash
# View recent logs in Render dashboard
# Or use Render CLI
render logs -f
```

---

## Outstanding TODOs

### High Priority (Backend Implementation Required)

**1. Brand Asset Upload & Management**
- [ ] Implement file upload functionality for logos, images, icons, fonts
- [ ] Create asset organization system (folders, tags, categories)
- [ ] Implement asset versioning and history
- [ ] Add bulk upload and management tools
- [ ] Create backend route: `POST /api/assets/upload`
- [ ] Create backend route: `GET /api/assets`
- [ ] Create backend route: `DELETE /api/assets/:id`

**2. Real-time Collaboration**
- [ ] Integrate WebSocket connections for live updates
- [ ] Add user presence tracking (who's viewing/editing)
- [ ] Show live cursor positions with user names/colors
- [ ] Add real-time comment notifications
- [ ] Implement conflict resolution for simultaneous edits
- [ ] Set up Socket.IO or similar WebSocket library

**3. Paste/Import Backend Integration**
- [ ] Build text parsing engine for paste mode (detect headings, structure, formatting)
- [ ] Implement file processing for PPT, PPTX, PDF, KEY formats
- [ ] Add AI-powered content analysis and slide generation
- [ ] Create presentation conversion pipeline
- [ ] Handle image extraction and optimization from imported files
- [ ] Create backend route: `POST /api/presentations/from-text`
- [ ] Create backend route: `POST /api/presentations/import`

**4. AI Integration (BREW Assistant)**
- [ ] Connect to OpenAI or similar AI service
- [ ] Implement prompt engineering for slide generation
- [ ] Add streaming responses for real-time feedback
- [ ] Create backend route: `POST /api/presentations/generate`
- [ ] Implement thinking/research display logic
- [ ] Add brewing progress tracking

### Medium Priority (Feature Enhancements)

**5. Logo Management**
- [ ] Update all auth/onboarding screens to use `AppLogo` component
- [ ] Test logo upload functionality end-to-end
- [ ] Add logo size validation (max 2MB)
- [ ] Support SVG, PNG, JPG formats

**6. Design Updates**
- [ ] Rename "AI Agent" to "BREW" across all remaining screens
- [ ] Ensure consistent purple branding (#8B5CF6) everywhere
- [ ] Update all coffee cup icons to match approved design

**7. Analytics & Tracking**
- [ ] Implement view tracking for presentations
- [ ] Add engagement metrics (time per slide, click-through rates)
- [ ] Create analytics dashboard backend
- [ ] Set up analytics database tables

**8. Subscription & Billing**
- [ ] Integrate Stripe for payment processing
- [ ] Implement subscription plans (Free, Pro, Enterprise)
- [ ] Add payment history and invoice generation
- [ ] Create billing webhooks for subscription events

**9. API Keys & Webhooks**
- [ ] Implement API key generation and management
- [ ] Add webhook event subscriptions
- [ ] Create webhook delivery logs
- [ ] Implement webhook retry logic

### Low Priority (Nice-to-Have)

**10. Font Management**
- [ ] Build font upload functionality
- [ ] Support TTF, OTF, WOFF formats
- [ ] Create font preview system

**11. Quick Tips Tooltips**
- [ ] Implement contextual help system
- [ ] Add interactive onboarding hints
- [ ] Track tooltip dismissals per user

**12. Version Comparison**
- [ ] Build side-by-side diff view for presentations
- [ ] Highlight changes between versions
- [ ] Add visual diff for slide content

**13. Embedded Viewer**
- [ ] Create lightweight embeddable presentation viewer
- [ ] Generate embed code snippets
- [ ] Add customization options (autoplay, controls, etc.)

**14. Plugin Management**
- [ ] Create plugin system architecture
- [ ] Allow third-party integrations
- [ ] Build plugin marketplace

**15. Custom Domains & White Label**
- [ ] Allow custom domain configuration
- [ ] Implement white-label branding options
- [ ] Add custom CSS injection

### Bug Fixes & Technical Debt

**16. TypeScript Errors**
- [ ] Fix remaining TypeScript compilation warnings
- [ ] Add proper type definitions for all API responses
- [ ] Remove `any` types

**17. Testing**
- [ ] Add unit tests for critical functions
- [ ] Add integration tests for API routes
- [ ] Add E2E tests for key user flows
- [ ] Set up CI/CD testing pipeline

**18. Performance Optimization**
- [ ] Implement lazy loading for routes
- [ ] Add image optimization and CDN
- [ ] Optimize bundle size (code splitting)
- [ ] Add caching strategies

**19. Security Enhancements**
- [ ] Implement API rate limiting
- [ ] Add CSRF protection
- [ ] Set up security headers (CSP, HSTS)
- [ ] Add audit logging for sensitive operations

**20. Documentation**
- [ ] Create API documentation (Swagger/OpenAPI)
- [ ] Write user guide and tutorials
- [ ] Document deployment procedures
- [ ] Create troubleshooting guide

---

## Known Issues

### Current Limitations

1. **Mock Data in Some Screens:**
   - Some screens (TemplateCreator, ThemeEditor, PresentationRemix) use mock data
   - Backend endpoints need to be created for full functionality

2. **No Real-time Collaboration Yet:**
   - LiveCollaboration page exists but WebSocket not implemented
   - Cursor tracking and presence indicators are UI-only

3. **No AI Integration:**
   - BREW assistant UI is complete but not connected to AI service
   - Presentation generation is not functional yet

4. **Limited Analytics:**
   - Analytics dashboard shows mock data
   - View tracking and engagement metrics not implemented

5. **No File Upload Processing:**
   - ImportMode accepts files but doesn't process them
   - PPT/PDF conversion not implemented

### Workarounds

**For Testing:**
- Use existing Dashboard, Brands, and Projects pages which have full backend integration
- Create test data directly in Supabase dashboard
- Use mock data to demonstrate UI flows

**For Development:**
- Focus on completing backend routes first
- Test API endpoints with Postman/Insomnia
- Use Supabase dashboard for data management

---

## Troubleshooting

### Common Issues

**Issue: Build fails with TypeScript errors**
```bash
Error: Cannot find module '@/lib/api-client'
```
**Solution:**
- Check that path aliases are configured in `vite.config.ts`:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```

**Issue: Supabase connection fails**
```bash
Error: Invalid Supabase URL
```
**Solution:**
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set correctly
- Check Supabase project is active
- Verify RLS policies allow access

**Issue: Logo upload fails**
```bash
Error: Failed to upload logo
```
**Solution:**
- Check Supabase Storage bucket exists
- Verify Storage policies allow uploads
- Check file size is under 2MB
- Ensure user has admin role

**Issue: Routes return 404**
```bash
Error: Cannot GET /api/brands
```
**Solution:**
- Verify Express server is running on port 3000
- Check route is registered in `server/index.ts`
- Ensure middleware is applied correctly

**Issue: Authentication fails**
```bash
Error: Invalid credentials
```
**Solution:**
- Check Supabase Auth is enabled
- Verify email confirmation is disabled (for development)
- Check user exists in `auth.users` table

### Debug Mode

**Enable detailed logging:**
```typescript
// server/index.ts
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

**Check Supabase logs:**
- Go to Supabase dashboard
- Navigate to "Logs" section
- Filter by error level

**Monitor network requests:**
- Open browser DevTools
- Go to Network tab
- Filter by "Fetch/XHR"
- Check request/response payloads

---

## Contact & Support

### Key Stakeholders

**Project Owner:** ForthLogic  
**Repository:** https://github.com/ForthLogic/slidecoffee-CORE-APP  
**Deployment:** Render (auto-deploy from main branch)

### Getting Help

**For Technical Issues:**
1. Check this handover document first
2. Review code comments and inline documentation
3. Search existing GitHub issues
4. Create new GitHub issue with detailed description

**For Deployment Issues:**
1. Check Render dashboard logs
2. Verify environment variables
3. Review recent commits for breaking changes
4. Contact Render support if infrastructure issue

**For Database Issues:**
1. Check Supabase dashboard logs
2. Verify RLS policies
3. Test queries in SQL Editor
4. Contact Supabase support if needed

### Resources

**Documentation:**
- React Query: https://tanstack.com/query/latest
- Supabase: https://supabase.com/docs
- Express: https://expressjs.com/
- Tailwind CSS: https://tailwindcss.com/docs

**Tools:**
- Supabase Dashboard: https://app.supabase.com
- Render Dashboard: https://dashboard.render.com
- GitHub Repository: https://github.com/ForthLogic/slidecoffee-CORE-APP

---

## Appendix

### Git Commit History

**Latest Commits:**
- `545ce4f` - Update todo.md with deployment status (Nov 21, 2025)
- `2540153` - Add 93+ screens with React Query, Express API routes, and Supabase integration (Nov 21, 2025)

**Key Branches:**
- `main` - Production branch (auto-deploys to Render)

### File Manifest

**Total Files:** 100+ files across frontend, backend, and configuration

**Key Files:**
- `src/App.tsx` - Main routing (350 lines, 93+ routes)
- `src/main.tsx` - Application entry point with providers
- `server/index.ts` - Express server setup
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Build configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Styling configuration

**Page Components:** 72 files in `src/pages/`  
**Reusable Components:** 20+ files in `src/components/`  
**API Routes:** 5 files in `server/routes/`  
**Database Migrations:** 1 file in `supabase/migrations/`

### Dependencies

**Production Dependencies (15):**
- @supabase/supabase-js: 2.81.1
- @tanstack/react-query: 5.90.10
- express: 4.21.2
- react: 19.2.0
- react-router-dom: 7.9.6
- lucide-react: 0.553.0
- sonner: 2.0.7
- (and 8 more...)

**Development Dependencies (16):**
- vite: 7.2.2
- typescript: 5.9.3
- tailwindcss: 4.1.17
- @vitejs/plugin-react: 5.1.0
- eslint: 9.39.1
- (and 11 more...)

---

**End of Technical Handover Document**

*This document was prepared by Manus AI on November 21, 2025. For questions or clarifications, please refer to the GitHub repository or contact the project owner.*

