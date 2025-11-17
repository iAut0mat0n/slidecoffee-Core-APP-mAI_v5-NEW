# SlideCoffee v2 - Completion Plan

**Current Status:** App structure exists, needs backend + UI polish
**Goal:** Deploy full working app to Netlify
**Architecture:** Vite + React + Netlify Functions + Supabase

---

## ✅ What's Already Done

- [x] Landing page (deployed to Netlify)
- [x] Project structure (components, pages, routing)
- [x] Supabase integration (database + auth)
- [x] AuthContext with sign in/up/out
- [x] Protected routes
- [x] Dashboard page (basic structure)
- [x] Editor page (split-screen structure)
- [x] Brands page (basic structure)
- [x] Onboarding page (basic structure)
- [x] Settings page (basic structure)
- [x] Admin panel (basic structure)
- [x] 20 mockups copied to project

---

## 🎯 Phase 1: Compare UI to Mockups
- [ ] Review mockup 05 (Dashboard) vs current Dashboard.tsx
- [ ] Review mockup 02/10 (Split-screen Editor) vs current Editor.tsx
- [ ] Review mockup 07/08/09 (Onboarding) vs current Onboarding.tsx
- [ ] Review mockup 15 (Brands) vs current Brands.tsx
- [ ] Review mockup 13/19 (Sidebar Navigation) - check if exists
- [ ] Document all UI gaps in a comparison file

## 🎯 Phase 2: Fix UI to Match Mockups
- [x] Update Dashboard to match mockup 05
  - [x] Workspace switcher at top
  - [x] Recent projects grid
  - [x] Empty state with purple star
  - [x] Sidebar navigation
- [x] Create DashboardLayout component with sidebar
- [x] Update Editor to match mockup 02/10
  - [x] 40/60 split layout
  - [x] Chat interface styling
  - [x] Slide preview grid with thumbnails
  - [x] Plan approval UI
  - [x] Progress indicator with coffee animation
  - [x] Zoom controls and navigation
- [ ] Update Onboarding to match mockup 07/08/09
  - [ ] Step 1: Welcome + workspace
  - [ ] Step 2: Brand setup
  - [ ] Step 3: First project
- [ ] Create DashboardLayout component with sidebar

## 🎯 Phase 3: Create Netlify Functions
- [x] Set up netlify/functions directory
- [x] Create ai-chat.ts function
  - [x] Accept message + conversation history
  - [x] Call Manus LLM API
  - [x] Return AI response
- [x] Create generate-slides.ts function
  - [x] Accept approved plan
  - [x] Generate actual slide content
  - [x] Return slides array
- [x] Add environment variables handling

## 🎯 Phase 4: Wire Frontend to Backend
- [x] Create API client in lib/api.ts
- [x] Update Editor.tsx to call ai-chat function
- [x] Update Editor.tsx to call generate-slides function
- [x] Add loading states
- [x] Add error handling
- [x] Save messages to database

## 🎯 Phase 5: Local Testing
- [ ] Install Netlify CLI
- [ ] Run `netlify dev` locally
- [ ] Test authentication flow
- [ ] Test onboarding flow
- [ ] Test dashboard navigation
- [ ] Test AI chat in editor
- [ ] Test plan generation
- [ ] Test slide generation
- [ ] Fix any bugs found

## 🎯 Phase 6: Deploy to Netlify
- [ ] Create netlify.toml configuration
- [ ] Set up build command
- [ ] Configure redirects for SPA
- [ ] Push to GitHub
- [ ] Connect to Netlify
- [ ] Set environment variables in Netlify dashboard
  - [ ] VITE_SUPABASE_URL
  - [ ] VITE_SUPABASE_ANON_KEY
  - [ ] MANUS_API_KEY (for functions)
- [ ] Deploy and get production URL

## 🎯 Phase 7: Production Testing
- [ ] Test landing page → sign up flow
- [ ] Test onboarding completion
- [ ] Test dashboard loads correctly
- [ ] Test creating new presentation
- [ ] Test AI chat works
- [ ] Test slide generation works
- [ ] Test brands management
- [ ] Test settings pages
- [ ] Verify all features work in production

---

## Technical Notes

**Netlify Functions Structure:**
```
netlify/
  functions/
    ai-chat.ts          # Chat with AI
    generate-plan.ts    # Create slide outline
    generate-slides.ts  # Generate actual slides
```

**Environment Variables Needed:**
- `VITE_SUPABASE_URL` - Frontend (Vite)
- `VITE_SUPABASE_ANON_KEY` - Frontend (Vite)
- `MANUS_API_KEY` - Backend (Netlify Functions)
- `MANUS_API_URL` - Backend (Netlify Functions)

**Deployment URLs:**
- Landing page: https://slidecoffee-v2.netlify.app (already live)
- Full app: Will be same domain, different routes

---

## Current Phase: 1 - Compare UI to Mockups
**Next Action:** Review mockups and document UI gaps




## 🔍 Critical Audit & Fixes
- [x] Fix all navigation buttons (Get Started, Sign In, etc.)
- [x] Add Supabase Auth signup to onboarding flow (Google OAuth + Email/Password)
- [x] Verify admin panel exists and works
- [x] Check if AI provider can be changed in admin settings (Yes - Manus AI, Claude, GPT-4)
- [x] Verify Manus API is configured in Netlify Functions (ai-chat.ts + generate-slides.ts using gemini-2.0-flash-exp)
- [ ] Test complete user flow: signup → onboarding → dashboard → create presentation




## 🖼️ Replace Copyrighted Images
- [ ] Replace slide1.jpg (Slide Salad branding)
- [ ] Replace slide7.jpg (Gamma AI Review)
- [ ] Replace slide8.jpg (copyrighted content)

## 📄 Footer & Pages
- [ ] Update footer with 4 columns (Product, Company, Social, Privacy)
- [ ] Create Pricing page
- [ ] Create Templates page
- [ ] Create Inspiration page
- [ ] Create Insights page
- [ ] Create About page
- [ ] Create Careers page
- [ ] Create Team page
- [ ] Create Help page
- [ ] Create Community page
- [ ] Create Contact page
- [ ] Create Terms of Service page
- [ ] Create Privacy Policy page
- [ ] Create Cookie Notice page
- [ ] Create Cookie Preferences page




---

## 🚨 NEW CRITICAL ISSUES (Sprint 1 Follow-up)

### AI Chat Broken
- [ ] Debug ai-chat-stream Netlify function (returning errors)
- [ ] Check Netlify function logs for stack traces
- [ ] Verify Manus API credentials in Netlify env
- [ ] Test ManusProvider embeddings endpoint
- [ ] Test ManusProvider chat completions endpoint

### UI/UX Fixes Needed
- [ ] Redesign Settings page (currently old blog-style, needs modern SaaS tabs)
- [ ] Build Projects page (currently blank, needs grid/list view)
- [ ] Build Recent page (currently blank, needs recent presentations list)
- [ ] Build Favorites page (currently blank, needs favorited items)
- [ ] Complete Brands page (has empty state but missing "Create Brand" button)

### Completed in Sprint 1 ✅
- [x] AI agent branding (Brew ☕ with purple coffee icon)
- [x] Provider-agnostic architecture (Manus default, Claude switchable)
- [x] ChatMessage component with markdown rendering
- [x] ThinkingIndicator component
- [x] SuggestedFollowups component
- [x] Memory system infrastructure (EmbeddingService, VectorMemoryService, RAGService)
- [x] Supabase pgvector setup with memories table

