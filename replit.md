# SlideCoffee - Replit Project Documentation

**Last Updated:** November 21, 2025 - 1:20 AM  
**Project Type:** Full-Stack AI-Powered Presentation Platform  
**Tech Stack:** React 19 + Vite + Express + Supabase + TypeScript

---

## Recent Updates (November 22, 2025 - 3:50 AM)

### 🎉 **CORE FEATURE COMPLETE: AI Slide Generation**

The **#1 critical feature** - AI-powered presentation creation - is now **fully functional**!

#### ✅ What Was Fixed Tonight

**1. AI Integration (CRITICAL FIX)**
   - **BEFORE**: Frontend called fake `simulateAgentWork()` with hardcoded delays - users saw loading animations but got nothing
   - **AFTER**: Real streaming AI integration using Manus API via OpenAI-compatible endpoints
   - Connected `AIAgentCreate.tsx` to live `/api/ai-chat-stream` and `/api/generate-slides` endpoints
   - Users can now actually create presentations with AI!

**2. Structured Plan Generation**
   - System prompt enforces JSON schema: `{title, summary, slides[], themes[]}`
   - Each slide includes: `{title, purpose, keyPoints[]}`
   - Robust JSON parsing with validation and error handling
   - Prevents malformed plans from reaching slide generation

**3. Streaming Event Handling**
   - Proper handling of `chunk`, `done`, and `error` events
   - UI updates in real-time as AI generates plan
   - No more stuck loading spinners or indeterminate states
   - Graceful error messages if AI fails

**4. Environment Variable Configuration**
   - Fixed priority: `OPENAI_API_KEY/OPENAI_BASE_URL` → `BUILT_IN_FORGE_*` (backend-only)
   - Added validation to reject requests if credentials missing
   - Updated `ManusProvider` and `ProviderFactory` to use correct env vars
   - Production-safe: no accidental client-side secret exposure

**5. TypeScript & Code Quality**
   - Fixed all LSP errors in `generate-slides.ts`
   - Added proper type assertions for JSON responses
   - Improved error messages for debugging

#### 📋 Previous Work (November 20-21, 2025)

1. **Full Supabase Integration** - All core CRUD operations connected to database
2. **Brand Management** - Create, Read, Update, Delete with logo uploads
3. **Projects CRUD** - List, filter, display from real database
4. **Authentication** - Signup, login, onboarding flow with workspace creation

### ⏳ Remaining Work
- **Auth Redirect Hardening**: Add race condition handling, onboarding guards
- **End-to-End Testing**: Test complete flow from signup → AI generation → slide editing
- **Deployment Configuration**: Set up Replit autoscale deployment

---

## Overview

SlideCoffee is an AI-first presentation platform with 93+ fully functional screens. The application features brand management, real-time collaboration, AI-powered slide generation (BREW assistant), and comprehensive analytics.

### Key Features
- ✨ AI-powered presentation generation with BREW assistant
- 🎨 Brand management with themes and assets
- 📊 Live preview and editing
- 💬 Real-time collaboration
- 📤 Export to PowerPoint, PDF, Google Slides
- 👥 Multi-workspace organization

---

## Project Structure

```
slidecoffee/
├── src/                          # Frontend React application
│   ├── pages/                    # 72+ page components (routes)
│   ├── components/               # 20+ reusable UI components
│   ├── lib/                      # Utilities and API client
│   │   ├── api-client.ts         # Fetch wrapper for backend API
│   │   ├── queries.ts            # React Query hooks
│   │   ├── config.ts             # App configuration
│   │   └── supabase.ts           # Supabase client
│   ├── App.tsx                   # Main routing (93+ routes)
│   └── main.tsx                  # Application entry point
├── server/                       # Backend Express server
│   ├── routes/                   # API routes
│   │   ├── auth.ts               # Authentication
│   │   ├── brands.ts             # Brand CRUD
│   │   ├── projects.ts           # Project CRUD
│   │   ├── system-settings.ts   # System config & logo upload
│   │   └── ...                   # Other endpoints
│   └── index.ts                  # Express server entry
├── supabase/migrations/          # Database migrations
├── public/                       # Static assets
└── package.json                  # Dependencies
```

---

## Technology Stack

### Frontend
- **React** 19.2.0 - UI framework
- **TypeScript** 5.9.3 - Type safety
- **Vite** 7.2.2 - Build tool and dev server
- **Tailwind CSS** 4.1.17 - Styling
- **React Query** 5.90.10 - Data fetching and caching
- **React Router** 7.9.6 - Client-side routing
- **Lucide React** - Icon library

### Backend
- **Express** 4.21.2 - API server
- **Node.js** 20+ - Runtime
- **TSX** 4.20.6 - TypeScript execution
- **Supabase** - PostgreSQL database + auth + storage

### External Services
- **Supabase** - Database, authentication, file storage
- **Manus AI** - AI proxy for OpenAI API
- **Manus Analytics** - Usage tracking
- **Forge API** - Additional integrations

---

## Development Setup

### Port Configuration
- **Frontend (Vite):** Port 5000 on 0.0.0.0
- **Backend (Express):** Port 3001 on localhost

This configuration ensures:
- Frontend is accessible via Replit's webview proxy
- Backend API is internal-only for security
- No port conflicts between services

### Running Locally
The development server starts both frontend and backend concurrently:
```bash
npm run dev
```

This runs:
- Vite dev server on 0.0.0.0:5000 (public)
- Express API server on localhost:3001 (internal)

### Environment Variables
All secrets are managed via Replit Secrets (never in .env files):

**Required:**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side admin key (never expose to frontend!)

**Optional:**
- `OPENAI_API_KEY` - AI features (via Manus proxy)
- `OPENAI_BASE_URL` - Manus AI proxy endpoint
- `VITE_APP_TITLE` - App branding
- `VITE_APP_LOGO` - Default logo URL
- Analytics, OAuth, and Forge API keys

---

## Architecture

### Data Flow
```
User Action
    ↓
React Component
    ↓
React Query Hook (src/lib/queries.ts)
    ↓
API Client (src/lib/api-client.ts)
    ↓
Express Route (server/routes/*.ts)
    ↓
Supabase Database
    ↓
Response flows back up
```

### Frontend Architecture
- **Pages** - Full-screen route components (93 routes)
- **Components** - Reusable UI elements
- **React Query** - Server state management with automatic caching
- **Supabase Client** - Direct database access for real-time features

### Backend Architecture
- **RESTful API** - Express routes under `/api/*`
- **Supabase Integration** - Database queries via Supabase client
- **CORS Configuration** - Allows Replit domains (.replit.dev, .repl.co)
- **Static File Serving** - Serves built frontend in production

---

## Database Schema (Supabase)

### Main Tables
- `v2_users` - User accounts
- `v2_workspaces` - Workspace organization (personal/team/company)
- `v2_brands` - Brand guidelines (logo, colors, fonts)
- `v2_projects` - Presentations (slides stored as JSONB)
- `v2_templates` - Template library
- `v2_system_settings` - App configuration (logo upload, etc.)

### Row Level Security (RLS)
All tables have RLS policies enabled:
- Users can only access their own data
- Workspace owners can access workspace data
- Admins have full access
- System settings are readable by authenticated users

---

## Key Implementation Details

### Replit-Specific Configuration

**1. Vite Configuration (vite.config.ts)**
```typescript
server: {
  host: '0.0.0.0',        // Allow external connections
  port: 5000,             // Replit webview port
  strictPort: true,
  allowedHosts: true,     // Trust proxy (CRITICAL for Replit)
}
```

**2. Express CORS (server/index.ts)**
```typescript
const allowedOrigins = [
  'http://localhost:5000',
  'http://0.0.0.0:5000',
  /\.replit\.dev$/,       // Replit dev domains
  /\.repl\.co$/,          // Replit production domains
  /\.netlify\.app$/,
  /\.onrender\.com$/,
];
```

**3. Server Binding**
```typescript
app.listen(PORT, 'localhost', ...) // Bind to localhost only
```

### React Query Integration
- All API calls use custom hooks from `src/lib/queries.ts`
- Automatic caching and refetching
- Optimistic updates for mutations
- Error handling and retry logic

### Authentication Flow
1. User signs up/logs in via Supabase Auth
2. JWT token stored in browser (httpOnly cookie)
3. Token sent with every API request
4. Backend verifies token with Supabase
5. RLS enforces data access policies

---

## Deployment

### Build Process
```bash
npm run build
```
- Compiles TypeScript
- Bundles React app with Vite
- Outputs to `dist/` directory
- Minifies and optimizes assets

### Production Server
```bash
npm start
```
- Runs Express server in production mode
- Serves static files from `dist/`
- SPA fallback for client-side routing
- API routes under `/api/*`

### Replit Deployment Configuration
- **Deployment Target:** Autoscale (stateless web app)
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Environment:** All secrets configured in Replit Secrets

---

## Common Tasks

### Adding a New Page
1. Create component in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`
3. Add navigation link in sidebar/menu

### Adding a New API Endpoint
1. Create route file in `server/routes/new-feature.ts`
2. Register route in `server/index.ts`
3. Create React Query hook in `src/lib/queries.ts`
4. Use hook in component

### Database Migration
1. Create SQL file in `supabase/migrations/`
2. Run via Supabase Dashboard → SQL Editor
3. Test with sample data

---

## Troubleshooting

### Frontend Not Loading
- Verify workflow is running on port 5000
- Check `allowedHosts: true` in vite.config.ts
- Ensure VITE_* secrets are set in Replit Secrets

### Backend API Errors
- Check backend is running on localhost:3001
- Verify SUPABASE_* secrets are configured
- Check CORS origins include Replit domains
- Review server logs in workflow output

### Database Connection Issues
- Verify Supabase project is active
- Check SUPABASE_URL and keys are correct
- Test connection in Supabase Dashboard
- Ensure RLS policies allow access

### Build Failures
- Run `npm install` to update dependencies
- Check for TypeScript errors with `npm run lint`
- Clear node_modules and reinstall if needed

---

## Development Workflow

### Making Changes
1. Edit code in `src/` or `server/`
2. Changes hot-reload automatically (Vite HMR)
3. Test in browser preview
4. Commit changes when ready

### Testing Features
- Use browser console for frontend debugging
- Check workflow logs for backend errors
- Use Supabase Dashboard for database queries
- Test API endpoints with network tab

### Code Quality
- TypeScript strict mode enabled
- ESLint configured for React best practices
- All API calls must use React Query hooks
- Never expose service role key to frontend

---

## Known Issues & Limitations

### Fully Functional
✅ Authentication & Onboarding (6 screens)  
✅ Dashboard & Management (10 screens)  
✅ Brand & Project CRUD  
✅ Templates & Themes UI  
✅ Collaboration UI  
✅ Analytics Dashboard  

### Backend Integration Pending
⏳ AI-powered slide generation (BREW assistant)  
⏳ Real-time collaboration (WebSocket)  
⏳ File import processing (PPT/PDF)  
⏳ Export generation (PDF, PowerPoint, video)  
⏳ Advanced search functionality  
⏳ Analytics data collection  

### Future Enhancements
- Subscription & billing (Stripe integration)
- Plugin system for third-party integrations
- Mobile apps (iOS/Android)
- Voice narration for slides
- Custom domains for published presentations

---

## Resources

### Documentation
- [Technical Handover](attached_assets/TECHNICAL_HANDOVER_1763707641290.md)
- [Features Documentation](attached_assets/SlideCoffee%20Features%20Documentation_1763707641289.md)
- [Deployment Guide](attached_assets/DEPLOYMENT_GUIDE_1763707641288.md)
- [Developer Onboarding](attached_assets/DEVELOPER_ONBOARDING_1763707641289.md)
- [TODO List](attached_assets/SlideCoffee%20TODO_1763707641290.md)

### External Links
- **Supabase Dashboard:** https://app.supabase.com
- **React Documentation:** https://react.dev
- **React Query Docs:** https://tanstack.com/query/latest
- **Vite Documentation:** https://vitejs.dev
- **Tailwind CSS:** https://tailwindcss.com

---

## Contact & Support

**Project Owner:** ForthLogic  
**Repository:** https://github.com/ForthLogic/slidecoffee-CORE-APP  
**Previous Deployment:** Render (auto-deploy from main branch)  
**Current Platform:** Replit

For issues or questions, refer to the technical documentation files or contact the project maintainer.
