# SlideCoffee - Replit Project Documentation

## Overview

SlideCoffee is an AI-first presentation platform designed to enable users to generate, manage, and collaborate on presentations efficiently. It offers AI-powered slide generation, brand management, real-time collaboration, and various export options. The project aims to provide a comprehensive, AI-driven solution for creating high-quality presentations for individuals and teams, with over 93 functional screens.

## User Preferences

I prefer concise and direct communication. When making changes, prioritize iterative development with clear explanations for each step. Please ask for confirmation before implementing major architectural changes or significant code refactors. I value clean, readable code with a focus on maintainability. Do not make changes to the `supabase/migrations` folder without explicit instruction.

**Required Fix Workflow (Nov 24, 2025):**
All bug fixes and changes MUST follow this workflow to prevent breaking production:
1. **Investigate** - Check logs, errors, screenshots to understand what's actually happening
2. **Call Architect** - Use architect tool to analyze root cause before making any code changes
3. **Determine Fix** - Work with architect to identify the proper solution (no workarounds)
4. **Implement** - Make changes only after architect approves the approach
5. **Test** - Restart workflows and verify fixes work in development before deploying to production

This workflow prevents introducing new bugs and ensures stable deployments.

## System Architecture

SlideCoffee is a full-stack application with a clear separation between frontend and backend.

**UI/UX Decisions:** The application features 93+ functional screens with a consistent design language. Tailwind CSS is used for styling, and Lucide React provides icons. A brand-consistent logo and favicon system is implemented, allowing admin-managed customizations.

**Technical Implementations:**
-   **Frontend:** React 19, TypeScript, Vite, React Query for server state, and React Router for routing.
-   **Backend:** Express.js (Node.js) with TSX for API handling.
-   **AI Integration:** Primarily uses Claude Haiku 4.5 (Oct 2025 release) via Anthropic API for fast and cost-effective slide generation. Supports database-driven switching between multiple AI models (Claude Haiku 4.5, Claude Sonnet, Manus/Gemini, GPT-4) and features real streaming AI integration with structured JSON output for slide plans. Includes AI research capabilities via DuckDuckGo HTML search and user-specific AI learning through a `v2_user_context` database table for personalized responses.
    - **True Streaming Slide Generation:** Server-Sent Events (SSE) endpoint `/api/generate-slides-stream` provides real-time magic - users watch research sources appear, outlines form, and slides generate one-by-one as they're created (no fake delays). Visual research panel shows sources with URLs, outline preview displays before generation, and progress bar tracks completion in real-time.
    - **PPTX Support:** PptxGenJS library installed for PowerPoint file generation. Python 3.12 with python-pptx ready for template extraction microservice (extract colors, fonts, layouts from user PPTX uploads).
-   **Authentication & Authorization:** **Supabase Auth (Nov 25, 2025)** - Reverted from Replit Auth back to Supabase Auth after testing showed UX issues. Supabase handles all authentication (email/password, Google OAuth, email verification). JWT tokens extracted from Authorization headers or cookies, validated via `supabase.auth.getUser()` in backend middleware. Row Level Security (RLS) applied across all database tables for data isolation. Frontend uses Supabase SDK for auth flows (signup, login, password reset). User records stored in Replit PostgreSQL database after Supabase auth succeeds.
-   **Stripe Billing:** Integrated for subscription management (Pro & Enterprise plans) with secure webhooks and a customer portal. Features an in-app upgrade system with plan pre-selection during onboarding.
-   **Database:** **Replit PostgreSQL (Production)** - Complete migration from Supabase storage to Replit PostgreSQL completed. All data (users, workspaces, presentations, etc.) now stored in Replit DB. Drizzle ORM with @neondatabase/serverless handles all database operations. Schema defined in shared/schema.ts. Supabase is ONLY used for authentication, not data storage.
-   **Onboarding Flow:** Production-ready onboarding experience with workspace creation, brand setup, and plan selection. Email verification intelligently adapts to Supabase configuration (auto-detects if confirmation is required). OnboardingRoute component enforces verification gates while preventing redirect loops. Features coffee-themed icons (☕) matching the SlideCoffee brand aesthetic.
-   **Project Editor:** Includes a full slide editor with debounced autosave.
-   **Real-Time Collaboration:** **PRODUCTION-READY** complete collaboration suite with v2_comments (threaded comments), v2_presence (live heartbeat tracking with 10s intervals/30s auto-expire), v2_notifications (@mentions system with smart parser), and v2_presentation_views (viral analytics). All powered by Supabase Realtime for instant updates. Comprehensive RLS policies enforce workspace isolation with admin moderation support (see supabase/migrations/add_collaboration_rls_policies.sql - **ARCHITECT APPROVED**).
-   **Deployment:** **PRODUCTION LIVE at app.slidecoffee.ai** - Configured for Replit Autoscale with custom domain verified. Frontend on port 5000, backend on localhost:3001. CORS configured for production domain (app.slidecoffee.ai) and Replit development domains. Staging available at slidecoffeev3.replit.app.
-   **Input Validation:** Comprehensive backend and frontend input validation across all text fields to ensure data integrity and security.
-   **Support Ticket System:** Integrated system with `v2_support_tickets` and `v2_support_ticket_replies` tables, API endpoints, and an admin panel for management.
-   **AI Chatbot:** A floating chat widget ("Brew AI") provides streaming AI conversations with history, research mode, and quick support contact.
-   **UI Redesign (Nov 2025):** Complete 4-phase UI refresh matching Gamma.app experience:
    - Phase 1-3: Core Layout, Dashboard, AI Agent Experience (Complete)
    - Phase 4: Paste Mode and Import Mode (Complete)
      - Multi-step wizards with draft persistence via v2_outline_drafts table
      - URL-based draft recovery (?draft=xxx) for page refresh resilience
      - Debounced PATCH saves for outline editing, step changes, and theme selection
      - Backend endpoints: /api/brews/analyze-content (paste mode), /api/brews/import-file (import mode)
    - **Unified Layout (Nov 26, 2025):** All dashboard pages now use a single CollapsibleSidebar component. The dual-layout system (DashboardLayout + CollapsibleSidebar) has been consolidated into a unified pattern:
      ```jsx
      <div className="flex h-screen bg-gray-50">
        <CollapsibleSidebar />
        <div className="flex-1 overflow-y-auto">{content}</div>
      </div>
      ```
      - CollapsibleSidebar handles workspace fetching, navigation, and user menu
      - All pages migrated: Dashboard, Brews, TemplatesNew, Settings, SubscriptionBilling, ImportMode, PasteMode
      - DashboardLayout.tsx has been removed
      - Sidebar navigation now shows: Dashboard, Brews, Templates, Themes (Brands and Settings removed from main nav; Settings accessible via user profile menu)
    - **AI Brew Conversational Mode (Nov 26, 2025):** AIAgentCreate now has intent detection to distinguish between casual chat and presentation creation. Only triggers full AI slide generation when message contains BOTH an action verb (create, make, build, generate, design, prepare, draft, write) AND a presentation noun (presentation, pitch deck, slides, deck, proposal, report, training, module, ppt, powerpoint). Otherwise uses conversational chat mode via `/api/ai-chat-stream` endpoint.
    - **Navigation Fixes (Nov 26, 2025):**
      - Dashboard "Create your first presentation" button now navigates to /create/generate (AIAgentCreate) instead of deprecated /editor/new
      - Brews page "Create Brew" button navigates to /create/generate instead of showing old CreateBrewWizard modal
      - CreateBrewWizard component is now deprecated (no longer used in primary flows)
    - **Workspace Management (Nov 26, 2025):**
      - Create workspace now uses inline modal in CollapsibleSidebar instead of navigating to /onboarding/workspace
      - Workspace switching persists selection via workspacesAPI.switch() backend call
      - Modal closes gracefully and keeps user on current page
    - **UX Polish (Nov 26, 2025):** Added cursor-pointer styling to Upgrade button and workspace items. Removed mock payment method and billing history from SubscriptionBilling (now shows proper empty states).

**System Design Choices:**
-   **Data Flow:** React components interact with an API client via React Query, which then communicates with Express routes and the Supabase database.
-   **Environment Variables:** Sensitive information is managed via Replit Secrets.
-   **Error Handling:** Robust JSON parsing with validation and graceful handling of streaming AI events. Generic error messages are returned to clients while detailed errors are logged server-side only.
-   **Testing:** Comprehensive automated test suite using Vitest + Supertest with 100% pass rate (18/18 tests). Tests exercise real Express routes with intelligent Supabase mocking (`server/tests/setup.ts`) that handles auth, database queries (with .in() filtering), and storage operations. Test coverage includes authentication, authorization, MFA enforcement, file upload security, rate limiting, and admin endpoints.
-   **Security:** Production-ready security implementation including:
    - **MFA Enforcement:** All admin routes verify Authenticator Assurance Level (AAL2) using authenticated Supabase client. Soft enforcement by default (logs warnings), strict enforcement via `REQUIRE_ADMIN_MFA=true` environment variable.
    - **RLS Enforcement:** Row Level Security applied across all 24 v2_* database tables (82 active policies) for multi-tenant data isolation. All legacy pre-v2 tables removed. Production database hardened and architect-approved (Nov 2025).
    - **File Upload Security:** Multi-layer validation including strict MIME validation (PNG/JPEG/WEBP/GIF only), SVG blocking to prevent XSS, filename normalization, 1MB size limit, buffer validation, and magic-byte verification using `file-type` library to prevent disguised file uploads. Detects and blocks MIME type mismatches between declared and actual file types.
    - **System Settings Protection:** Two-tier access control model - public branding endpoint (`/system/public-branding`) is intentionally unauthenticated for login page display, exposing only whitelisted keys (app_logo_url, app_favicon_url, app_title). Admin settings endpoint (`/system/settings`) requires authentication, admin role, and MFA to access ALL system configuration.
    - **Rate Limiting:** Express-rate-limit middleware protects endpoints - 60 requests/min for public branding, 10 uploads per 15min per IP.
    - **Security Logging:** Structured Pino-based logging system (`server/utils/security-logger.ts`) tracks security events (MFA failures, MIME mismatches, rate limit violations, unauthorized access) with severity levels (low/medium/high/critical) and automated alerting on critical events.
    - **CORS Configuration:** Production domain (app.slidecoffee.ai) whitelisted alongside Replit development domains.
    - **Input Validation:** Comprehensive server-side validation across all endpoints to prevent injection attacks and data corruption.
-   **Branding Assets:** Organized in `public/branding/` directory (logo.png, logo.svg, favicon.png) and exposed via database settings. Frontend components (`AppLogo.tsx`, `FaviconLoader.tsx`) dynamically load branding from system settings. Brew AI chat widget uses custom avatar assets (brew-avatar.png and variants).

## External Dependencies

-   **Supabase:** PostgreSQL database, authentication, file storage, and real-time features.
-   **Anthropic (Claude):** Primary AI provider (Claude Haiku 4.5) for slide generation and AI chat.
-   **Manus AI:** Alternative AI provider, offering OpenAI-compatible API endpoints (Gemini-powered).
-   **Manus Analytics:** For tracking application usage.
-   **Forge API:** For additional functionalities and integrations.
-   **Stripe:** Billing and subscription management.
-   **Voyage AI:** Used for embeddings when Claude is the active AI provider.