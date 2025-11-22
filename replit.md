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
-   **AI Integration:** Primary AI provider is **Claude 3.5 Haiku** via Anthropic API, with database-driven provider switching supporting multiple AI models (Claude Haiku, Claude Sonnet, Manus/Gemini, GPT-4). Real streaming AI integration with structured plan generation ensures AI outputs are consistently formatted JSON, which includes `title`, `summary`, `slides[]`, and `themes[]`. Each slide detail includes `title`, `purpose`, and `keyPoints[]`. Admin panel allows switching between providers with encrypted API key storage.
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
-   **Claude (Anthropic):** Primary AI provider - Claude 3.5 Haiku for fast, efficient, high-quality slide generation and AI chat.
-   **Manus AI:** Alternative AI provider, providing OpenAI-compatible API endpoints (Gemini-powered).
-   **Manus Analytics:** Used for tracking application usage.
-   **Forge API:** Integrated for additional functionalities and integrations.
-   **Stripe:** Integrated for handling all billing and subscription management.
-   **Voyage AI:** Used for embeddings when Claude provider is active (Claude doesn't provide embedding API).