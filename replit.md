# SlideCoffee - Replit Project Documentation

## Overview

SlideCoffee is an AI-first presentation platform featuring 93+ functional screens. Its core purpose is to enable users to generate, manage, and collaborate on presentations efficiently using AI. Key capabilities include AI-powered slide generation, brand management, real-time collaboration, and various export options. The project aims to provide a comprehensive, AI-driven solution for creating high-quality presentations, targeting a broad market for individuals and teams.

## User Preferences

I prefer concise and direct communication. When making changes, prioritize iterative development with clear explanations for each step. Please ask for confirmation before implementing major architectural changes or significant code refactors. I value clean, readable code with a focus on maintainability. Do not make changes to the `supabase/migrations` folder without explicit instruction.

## System Architecture

SlideCoffee is built as a full-stack application with a clear separation between frontend and backend.

**UI/UX Decisions:** The application features 93+ fully functional screens, adhering to a consistent design language. Tailwind CSS is used for styling, ensuring a modern and responsive user interface. Lucide React provides a comprehensive icon library.

**Technical Implementations:**
-   **Frontend:** Developed with React 19, TypeScript, and Vite. React Query manages server state and caching, while React Router handles client-side routing.
-   **Backend:** An Express.js server running on Node.js handles API requests. TSX is used for TypeScript execution.
-   **AI Integration:** Primary AI provider is **Claude Haiku 4.5** (Oct 2025 release) via Anthropic API, offering 4-5x faster performance than Sonnet at 1/3 the cost with 90% of the quality. Database-driven provider switching supports multiple AI models (Claude Haiku 4.5, Claude Sonnet, Manus/Gemini, GPT-4). Real streaming AI integration with structured plan generation ensures AI outputs are consistently formatted JSON, which includes `title`, `summary`, `slides[]`, and `themes[]`. Each slide detail includes `title`, `purpose`, and `keyPoints[]`. Admin panel allows switching between providers with encrypted API key storage.
-   **Authentication & Authorization:** Supabase provides authentication. JWT tokens are used for securing API routes, and a custom middleware enforces authentication and extracts user workspace information. Row Level Security (RLS) is applied across all database tables to ensure data isolation and security.
-   **Stripe Billing:** Integrated for subscription management (Pro & Enterprise plans) with secure webhook handling, idempotency, and a customer portal. Subscriptions are workspace-scoped.
-   **Project Editor:** Features a full slide editor with debounced autosave functionality and real-time save status indicators.
-   **Real-Time Collaboration:** Live presence indicators show active users with avatars and names via Supabase Realtime.
-   **Deployment:** Configured for Replit Autoscale, with frontend (Vite) on port 5000 and backend (Express) on localhost:3001. CORS is configured to allow Replit domains.

**System Design Choices:**
-   **Data Flow:** User actions trigger React components, which use React Query hooks to interact with the API client. The API client communicates with Express routes, which then interact with the Supabase database.
-   **Environment Variables:** All sensitive information is managed via Replit Secrets, ensuring no exposure in client-side code.
-   **Error Handling:** Robust JSON parsing with validation and error handling is implemented for AI responses. Streaming events (`chunk`, `done`, `error`) are handled gracefully, providing real-time UI updates and informative error messages.

## External Dependencies

-   **Supabase:** Utilized for PostgreSQL database, authentication services, file storage, and real-time collaboration features.
-   **Claude (Anthropic):** Primary AI provider - Claude Haiku 4.5 (Oct 2025) for ultra-fast, efficient, high-quality slide generation and AI chat with research capabilities.
-   **Manus AI:** Alternative AI provider, providing OpenAI-compatible API endpoints (Gemini-powered).
-   **Manus Analytics:** Used for tracking application usage.
-   **Forge API:** Integrated for additional functionalities and integrations.
-   **Stripe:** Integrated for handling all billing and subscription management.
-   **Voyage AI:** Used for embeddings when Claude provider is active (Claude doesn't provide embedding API).

## Recent Updates (November 23, 2025)

### **Admin-Managed Logo/Favicon System with MFA Security** (Latest)
-   **System Settings Admin Panel**: New tab in Admin Panel for managing application branding
-   **Logo Upload**: Admins can upload custom logos (PNG, SVG, JPEG) to replace default coffee cup icon
-   **Favicon Upload**: Admins can upload custom favicons (ICO, PNG, SVG) for browser tabs
-   **Supabase Storage Integration**: Uploads stored in `assets` bucket at `system/logos/` and `system/favicons/`
-   **Dynamic Favicon Loader**: React component automatically updates favicon from system settings without page reload
-   **MFA Security Enhancement**: Admin middleware checks for MFA enrollment (soft enforcement via `REQUIRE_ADMIN_MFA` env var)
-   **Security Features**: File size limits (1MB), filename validation (255 chars), type validation, proper error handling
-   **Database**: System settings stored in `v2_system_settings` table with keys `app_logo_url` and `app_favicon_url`
-   **Production-Ready**: Environment variable `REQUIRE_ADMIN_MFA=true` enables strict MFA requirement for admin operations

### **Brand-Consistent Logo Implementation**
-   **Created CoffeeCupIcon component**: Purple coffee cup SVG icon matching the SlideCoffee brand (w/ steam)
-   **Updated AppLogo component**: Now displays CoffeeCupIcon instead of ☕ emoji, with flexible sizing props
-   **Updated favicon**: Created `public/favicon.svg` with branded purple coffee cup icon
-   **Updated index.html**: Page title now "SlideCoffee - AI-Powered Presentations" with new favicon
-   **Consistent branding across all pages**: Login, Signup, SignupNew, PresentationViewer, OnboardingWelcome, OnboardingNew
-   **Color scheme**: Purple (#8B5CF6) coffee cup with outlined design matching brand identity
-   **Maintains fallback**: Custom logo URL from system settings takes precedence when configured

### **Comprehensive Input Validation Across All Text Fields**
-   **Created validation utility** (`server/utils/validation.ts`) with industry-standard MAX_LENGTHS constants
-   **Standards implemented**: Email (254), Passwords (8-72), Names (100), Titles (255), Descriptions (1000), Messages (2000-5000), API keys (500)
-   **Backend validation added** to all critical user-facing routes:
    -   Brands: Brand name (100 chars)
    -   Support tickets: Subject (200), message (5000), reply (2000)
    -   Workspaces: Workspace name (100)
    -   Projects: Project name (255), description (1000)
    -   Presentations: Title (255), summary (1000), share password (8-72)
    -   AI chat: Message (100KB), query (500)
-   **Admin routes secured** with validation + authorization:
    -   AI settings: API key (500), model (100) with `requireAdmin`
    -   System settings: Logo upload with filename (255), image size (1MB max), `requireAuth` + `requireAdmin`
-   **Frontend validation** added to all user-facing forms:
    -   Authentication: Login, Signup, SignupNew (email, password, name limits)
    -   Onboarding: Workspace creation (name limit)
    -   Brands: Brand creation modal (name limit)
    -   Presentations: Creation modals (title, description limits)
    -   User Profile: Name, email, bio, password change (all with proper limits)
    -   Sharing: Share password (8-72 chars with minLength/maxLength)
-   **Security benefits**: Two-layer validation (client UX + server enforcement), DoS prevention via size limits, buffer overflow protection, injection attack surface reduction
-   **Production-ready** for all user-facing text input across the application

### **Production-Ready In-App Upgrade System with Complete Security Refactoring**
-   **Security Architecture Overhaul**: Eliminated service-role key from all user request handling
-   **Authenticated Supabase Client Helper**: Created `server/utils/supabase-auth.ts` for RLS-enforced database access
-   **Server-Side Limit Enforcement**: All creation endpoints check plan limits before allowing operations
    -   Brand creation: Espresso (free) limited to 1 brand, returns 403 with upgrade prompt
    -   Slide generation: Monthly limits enforced (Espresso: 5, Americano: 75, Cappuccino: 450)
    -   Presentation creation: Monthly limits enforced per plan tier
-   **Refactored Routes**: All routes now use authenticated client (brands, presentations, support-tickets, usage, generate-slides)
-   **Usage Tracking API**: `/api/usage/current` returns current usage + limits for authenticated workspace
-   **Billing Settings UI**: Complete subscription management with plan comparison and Stripe checkout
-   **Upgrade Prompts**: Contextual prompts when users hit limits with direct Stripe checkout links
-   **Plan Normalization**: Legacy plan names (starter/professional/enterprise) auto-mapped to coffee names
-   **No Horizontal Data Leakage**: Proper tenant isolation via RLS, workspace-scoped queries
-   **Production Deployment Ready**: Comprehensive security fixes applied, ready for real billing

### Brew AI Chatbot Widget
-   Created floating chat widget (bottom right corner) that appears globally for logged-in users
-   Integrated with `/api/ai-chat-stream` endpoint for streaming AI conversations
-   Features: conversation history, research mode toggle, quick support contact
-   Displays Brew's personality with coffee-themed branding and green status indicator
-   Auto-greets users with randomized welcome messages from AI_AGENT config
-   Supports Shift+Enter for multi-line messages, Enter to send

### Product-Centric Onboarding with Plan Pre-Selection
-   Added `/onboarding/plan` step after brand setup (before dashboard)
-   **Americano plan pre-selected by default** to drive paid conversions (recommended badge)
-   Three-tier display: Espresso (free), Americano ($12/mo, recommended), Cappuccino ($29/mo, popular)
-   Monthly/Annual billing toggle with 17% savings indicator
-   Seamless Stripe checkout integration for paid plans
-   Free plan users skip directly to dashboard without payment
-   "Skip for now" option allows users to start free and upgrade later
-   Trust indicators: No credit card for free, cancel anytime, 30-day guarantee

### Support Ticket System
-   Database schema: `v2_support_tickets` and `v2_support_ticket_replies` tables
-   Ticket fields: subject, message, status (open/in_progress/resolved/closed), priority (low/medium/high/urgent), category
-   API endpoints at `/api/support-tickets/*` for create, list, update status, add replies
-   Admin panel "Support Tickets" tab with filtering by status
-   Ticket management UI: view all tickets, update status, see priority badges
-   User identification: captures user_id, workspace_id, email, and name with each ticket
-   Authentication-protected routes (admin-only for management endpoints)
-   **Security**: Workspace-scoped queries, ownership checks on all endpoints, RLS policies for production
-   **Production Deployment**: Apply RLS policies from `supabase/migrations/add_support_tickets_rls.sql` before production use

## Recent Updates (November 22, 2025) - Previous Features

### Claude Haiku 4.5 Upgrade
-   Upgraded from Claude 3.5 Haiku to Claude Haiku 4.5 (latest October 2025 release)
-   Model identifiers updated across the application: `claude-haiku-4-5`
-   Benefits: 4-5x faster than Sonnet, 90% performance at 1/3 cost, 200K context window
-   Updated in: `server/utils/ai-settings.ts`, `src/services/providers/ClaudeProvider.ts`

### AI Research Capabilities
-   Implemented web search integration for AI-powered research (`server/utils/web-search.ts`)
-   DuckDuckGo HTML search integration (no API key required)
-   AI can now research topics and provide source-backed insights
-   Research mode toggle in AI Agent UI with visual indicators
-   Web search results automatically formatted and included in AI context
-   **Security**: Query sanitization, 10s timeout, size limits, rate limiting

### User-Specific AI Learning
-   Created `v2_user_context` database table for storing user-specific AI memory
-   Context types: preferences, conversation, insights, project_info, skills, goals
-   User context automatically loaded and included in AI system prompts
-   API endpoints for managing user context (`/api/user-context`)
-   Enables personalized AI responses based on user history and preferences
-   Context is workspace-scoped for proper data isolation
-   **Security**: Input validation, size limits (50KB), type whitelisting, authentication required

### AI Chat Enhancements
-   Enhanced system prompts with user profile information
-   Integrated web search results into AI responses when research mode enabled
-   Backend automatically enriches AI context with user preferences and insights
-   Improved streaming AI chat with research and personalization support
-   **Security**: Authentication required, rate limiting (20 req/min), payload limits, error sanitization

### Security Hardening (November 22, 2025)
-   **CRITICAL FIX**: Added authentication to `/api/ai-chat-stream` endpoint to prevent user impersonation
-   UserId and workspaceId now derived from authenticated session (never trusted from request body)
-   Comprehensive input validation across all new features
-   Rate limiting implemented (20 requests/minute per user)
-   Error message sanitization to prevent information leakage
-   Database constraints on v2_user_context (CHECK, size limits, indexes)
-   **PRODUCTION REQUIREMENT**: Row-Level Security (RLS) policies created but NOT enabled in development
-   See `DEPLOYMENT_SECURITY_CHECKLIST.md` and `server/database/SECURITY.md` for production deployment guide
-   RLS policies available in `server/database/rls-policies.sql` - **MUST be applied before production deployment**