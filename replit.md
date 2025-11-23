# SlideCoffee - Replit Project Documentation

## Overview

SlideCoffee is an AI-first presentation platform designed to enable users to generate, manage, and collaborate on presentations efficiently. It offers AI-powered slide generation, brand management, real-time collaboration, and various export options. The project aims to provide a comprehensive, AI-driven solution for creating high-quality presentations for individuals and teams, with over 93 functional screens.

## User Preferences

I prefer concise and direct communication. When making changes, prioritize iterative development with clear explanations for each step. Please ask for confirmation before implementing major architectural changes or significant code refactors. I value clean, readable code with a focus on maintainability. Do not make changes to the `supabase/migrations` folder without explicit instruction.

## System Architecture

SlideCoffee is a full-stack application with a clear separation between frontend and backend.

**UI/UX Decisions:** The application features 93+ functional screens with a consistent design language. Tailwind CSS is used for styling, and Lucide React provides icons. A brand-consistent logo and favicon system is implemented, allowing admin-managed customizations.

**Technical Implementations:**
-   **Frontend:** React 19, TypeScript, Vite, React Query for server state, and React Router for routing.
-   **Backend:** Express.js (Node.js) with TSX for API handling.
-   **AI Integration:** Primarily uses Claude Haiku 4.5 (Oct 2025 release) via Anthropic API for fast and cost-effective slide generation. Supports database-driven switching between multiple AI models (Claude Haiku 4.5, Claude Sonnet, Manus/Gemini, GPT-4) and features real streaming AI integration with structured JSON output for slide plans. Includes AI research capabilities via DuckDuckGo HTML search and user-specific AI learning through a `v2_user_context` database table for personalized responses.
-   **Authentication & Authorization:** Supabase handles authentication. JWT tokens secure API routes, custom middleware enforces authentication, and Row Level Security (RLS) is applied across all database tables for data isolation.
-   **Stripe Billing:** Integrated for subscription management (Pro & Enterprise plans) with secure webhooks and a customer portal. Features an in-app upgrade system with plan pre-selection during onboarding.
-   **Project Editor:** Includes a full slide editor with debounced autosave.
-   **Real-Time Collaboration:** Live presence indicators are powered by Supabase Realtime.
-   **Deployment:** Configured for Replit Autoscale, with frontend on port 5000 and backend on localhost:3001. CORS is configured for Replit domains.
-   **Input Validation:** Comprehensive backend and frontend input validation across all text fields to ensure data integrity and security.
-   **Support Ticket System:** Integrated system with `v2_support_tickets` and `v2_support_ticket_replies` tables, API endpoints, and an admin panel for management.
-   **AI Chatbot:** A floating chat widget ("Brew AI") provides streaming AI conversations with history, research mode, and quick support contact.

**System Design Choices:**
-   **Data Flow:** React components interact with an API client via React Query, which then communicates with Express routes and the Supabase database.
-   **Environment Variables:** Sensitive information is managed via Replit Secrets.
-   **Error Handling:** Robust JSON parsing with validation and graceful handling of streaming AI events.
-   **Security:** Focus on RLS for tenant isolation, authenticated Supabase client helper, server-side plan limit enforcement, and comprehensive input validation to prevent common vulnerabilities.

## External Dependencies

-   **Supabase:** PostgreSQL database, authentication, file storage, and real-time features.
-   **Anthropic (Claude):** Primary AI provider (Claude Haiku 4.5) for slide generation and AI chat.
-   **Manus AI:** Alternative AI provider, offering OpenAI-compatible API endpoints (Gemini-powered).
-   **Manus Analytics:** For tracking application usage.
-   **Forge API:** For additional functionalities and integrations.
-   **Stripe:** Billing and subscription management.
-   **Voyage AI:** Used for embeddings when Claude is the active AI provider.