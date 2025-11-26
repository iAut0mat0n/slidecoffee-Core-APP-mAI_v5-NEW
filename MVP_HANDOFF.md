# SlideCoffee MVP Handoff Document

## Overview

SlideCoffee is an AI-powered presentation platform that enables users to generate professional slide decks through conversational AI. The core value proposition is the "AI Brew" experience - users describe what they want, and the AI researches, outlines, and generates a complete presentation.

**Production URL:** app.slidecoffee.ai  
**Staging URL:** slidecoffeev3.replit.app

---

## Core MVP Features (Priority Order)

### 1. AI Brew Experience (HIGHEST PRIORITY)
The central feature of SlideCoffee. Users chat with an AI that:
- Detects intent (casual conversation vs. presentation creation)
- Researches the topic using DuckDuckGo search
- Creates an outline with slide structure
- Generates slides one-by-one with real-time streaming
- Saves the final presentation to the database

**Key Files:**
- `src/pages/AIAgentCreate.tsx` - Main AI chat interface
- `src/lib/api-slides-stream.ts` - SSE client for streaming generation
- `server/routes/generate-slides-stream.ts` - Backend SSE endpoint
- `server/services/ai-service.ts` - AI provider abstraction (Anthropic Claude)

**Intent Detection Logic:**
```javascript
// Only trigger full generation when message has BOTH:
// 1. Action verb: create, make, build, generate, design, prepare, draft, write
// 2. Presentation noun: presentation, slides, deck, pitch, proposal, report
```

### 2. Authentication & User Management
- **Provider:** Supabase Auth (email/password, Google OAuth)
- **Session:** JWT tokens validated via `supabase.auth.getUser()`
- **Database:** User records stored in Replit PostgreSQL after Supabase auth

**Key Files:**
- `src/contexts/AuthContext.tsx` - Frontend auth context
- `server/middleware/auth.ts` - Backend JWT validation
- `src/pages/Login.tsx`, `src/pages/Signup.tsx` - Auth pages

### 3. Workspace & Project Management
- Users belong to workspaces
- Projects contain presentations
- Workspace switching should persist selection

**Key Files:**
- `src/components/CollapsibleSidebar.tsx` - Sidebar with workspace switcher
- `server/routes/workspaces.ts` - Workspace CRUD endpoints

### 4. Presentation Viewer/Editor
- View generated presentations
- Edit slide content
- Export to PowerPoint (pptxgenjs library installed)

**Key Files:**
- `src/pages/PresentView.tsx` - Presentation viewer
- `server/routes/presentations.ts` - Presentation endpoints

### 5. Subscription & Billing
- Stripe integration for Pro/Enterprise plans
- Credit-based usage system (75 credits for free tier)

**Key Files:**
- `src/pages/SubscriptionBilling.tsx` - Billing UI
- `server/routes/stripe.ts` - Stripe webhook handlers

---

## Tech Stack

### Frontend
- **Framework:** React 19 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (v4)
- **State:** React Query (TanStack Query)
- **Routing:** React Router v7
- **Icons:** Lucide React
- **Toasts:** Sonner

### Backend
- **Runtime:** Node.js with TSX
- **Framework:** Express.js
- **Database:** Replit PostgreSQL (Neon-backed)
- **ORM:** Drizzle ORM
- **Auth:** Supabase Auth (JWT validation)
- **AI:** Anthropic Claude API (Claude Haiku 4.5)
- **Payments:** Stripe

### Key Dependencies
```json
{
  "@anthropic-ai/sdk": "^0.71.0",
  "@supabase/supabase-js": "^2.81.1",
  "@neondatabase/serverless": "^1.0.2",
  "drizzle-orm": "^0.44.7",
  "stripe": "^20.0.0",
  "pptxgenjs": "^4.0.1"
}
```

---

## Color Scheme & Branding

### Primary Colors
- **Primary Purple:** `#7C3AED` (purple-600)
- **Primary Hover:** `#6D28D9` (purple-700)
- **Primary Light:** `#EDE9FE` (purple-100)

### Secondary Colors
- **Success Green:** `#10B981`
- **Error Red:** `#EF4444`
- **Warning Yellow:** `#F59E0B`

### Neutrals
- **Background:** `#F9FAFB` (gray-50)
- **Card Background:** `#FFFFFF`
- **Border:** `#E5E7EB` (gray-200)
- **Text Primary:** `#111827` (gray-900)
- **Text Secondary:** `#6B7280` (gray-500)

### Typography
- **Font Family:** Inter (Google Fonts)
- **Headings:** Bold, gray-900
- **Body:** Regular, gray-700

---

## Database Schema (v2_* Tables)

### Core Tables

```sql
-- Users (synced from Supabase Auth)
v2_users: id, email, name, role, credits, plan, default_workspace_id

-- Workspaces (multi-tenant)
v2_workspaces: id, name, owner_id

-- Workspace Members
v2_workspace_members: id, workspace_id, user_id, role

-- Projects (containers for presentations)
v2_projects: id, workspace_id, name, description, brand_id

-- Presentations
v2_presentations: id, workspace_id, project_id, title, slides_json, status

-- Outline Drafts (intermediate state during generation)
v2_outline_drafts: id, workspace_id, topic, outline_json, theme_id, status

-- Themes/Templates
v2_theme_profiles: id, workspace_id, name, palette_json, typography_json
```

### Relationships
- User -> Workspaces (owner)
- Workspace -> Projects -> Presentations
- Workspace -> Themes
- User Context for AI personalization: `v2_user_context`

---

## API Endpoints

### Authentication
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Workspaces
- `GET /api/workspaces` - List user's workspaces
- `POST /api/workspaces` - Create workspace
- `POST /api/workspaces/switch` - Switch active workspace (NEEDS WORK)

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project

### Presentations
- `GET /api/presentations` - List presentations
- `POST /api/presentations` - Create presentation
- `GET /api/presentations/:id` - Get presentation
- `PUT /api/presentations/:id` - Update presentation

### AI Generation (SSE)
- `POST /api/generate-slides-stream` - Stream slide generation
- `POST /api/ai-chat-stream` - Conversational chat

### Billing
- `POST /api/stripe/create-checkout` - Create Stripe checkout
- `POST /api/stripe/webhook` - Stripe webhook handler
- `POST /api/stripe/customer-portal` - Get customer portal URL

---

## Environment Variables Required

```bash
# Database
DATABASE_URL=postgresql://...

# Supabase Auth
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI Provider
ANTHROPIC_API_KEY=sk-ant-...

# Stripe Billing
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ENTERPRISE=price_...

# App URLs
VITE_API_URL=/api
```

---

## Current Status

### Working
- Unified dashboard layout (CollapsibleSidebar)
- Authentication flow (Supabase)
- User registration and login
- Workspace creation (inline modal)
- AI conversational mode (intent detection)
- Navigation to AI Brew experience

### Needs Work (Priority Order)

1. **AI Generation Pipeline** - SSE stream errors after kickoff
   - Debug: Check `/api/generate-slides-stream` endpoint
   - Verify Anthropic API key and response handling
   - Ensure presentation persistence to database

2. **Workspace Switching** - Backend endpoint incomplete
   - Add `POST /api/workspaces/switch` route
   - Persist to user's `default_workspace_id`

3. **Brands Module Removal** - Remnants exist
   - Remove all `brand_id` references from flows
   - Delete `src/pages/Brands*.tsx` files
   - Remove `server/routes/brands.ts`

4. **Templates/Themes** - Non-functional
   - Theme picker shows empty
   - Upload/selection handlers broken

5. **Stripe Billing** - Using placeholder data
   - Wire to real Stripe customer data
   - Show actual subscription status

6. **Login Regression** - Some existing users can't login
   - Check Supabase user sync with Replit DB

---

## File Structure

```
/
├── src/                      # Frontend React app
│   ├── components/           # Reusable components
│   ├── contexts/             # React contexts (Auth, etc.)
│   ├── lib/                  # API clients, utilities
│   ├── pages/                # Route pages
│   └── App.tsx               # Route definitions
│
├── server/                   # Backend Express app
│   ├── routes/               # API route handlers
│   ├── services/             # Business logic (AI, Stripe)
│   ├── middleware/           # Auth, rate limiting
│   └── index.ts              # Server entry point
│
├── shared/                   # Shared between frontend/backend
│   └── schema.ts             # Drizzle database schema
│
├── public/                   # Static assets
│   └── branding/             # Logo, favicon
│
└── replit.md                 # Project documentation
```

---

## Running the Project

```bash
# Development (frontend + backend)
npm run dev

# Production build
npm run build
npm run start

# Database migrations
npm run db:push

# Tests
npm run test
```

---

## Key Design Decisions

1. **Unified Layout** - All pages use `CollapsibleSidebar` component
2. **AI-First UX** - Chat interface is primary interaction
3. **SSE Streaming** - Real-time slide generation feedback
4. **Multi-tenant** - Workspace isolation via RLS policies
5. **Credit System** - Usage-based with plan upgrades

---

## Immediate Next Steps for New Developer

1. **Stabilize AI Generation**
   - Test `/api/generate-slides-stream` endpoint directly
   - Add error logging and telemetry
   - Ensure presentations save to `v2_presentations`

2. **Complete Workspace Flow**
   - Implement `POST /api/workspaces/switch`
   - Update user's `default_workspace_id`
   - Ensure workspace context persists across sessions

3. **Clean Up Brand References**
   - Remove brand dropdown from any remaining UIs
   - Delete brand-related routes and pages
   - Update schema if needed

4. **Test End-to-End Flow**
   - Signup -> Create Workspace -> Generate Presentation -> View/Export

---

## Contact & Resources

- **Replit Project:** SlideCoffee v3
- **Production Domain:** app.slidecoffee.ai
- **Supabase Dashboard:** [Access via Supabase console]
- **Stripe Dashboard:** [Access via Stripe console]

---

*Document created: November 26, 2025*
