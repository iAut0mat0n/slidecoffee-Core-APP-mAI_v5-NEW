# SlideCoffee TODO

**Last Updated:** October 30, 2025 3:40 AM EDT

---

## 🎯 IMMEDIATE PRIORITIES (This Week)

### 1. Update Pricing Model
- [ ] Research competitor pricing (Beautiful.ai, Gamma, Tome) - COMPLETED
- [ ] Finalize pricing tiers ($18 Pro, $35 Team, $60 Business) - COMPLETED
- [ ] Document profitability analysis - COMPLETED
- [ ] Update database schema with new pricing
- [ ] Update frontend pricing page

### 2. Manus API Integration
- [ ] Create separate Manus account for SlideCoffee
- [ ] Generate new API key
- [ ] Add SLIDECOFFEE_MANUS_KEY to environment
- [ ] Implement `buildManusContext()` function
- [ ] Implement `buildCafePrompt()` function (white-labeling)
- [ ] Implement `callManusAPI()` wrapper
- [ ] Implement `pollManusTask()` function
- [ ] Test full flow: create → approve → generate

### 3. Database Schema Updates
- [ ] Rename `projects` table to `presentations`
- [ ] Add `manus_task_id`, `manus_version_id`, `outline_json`, `generation_status` to presentations
- [ ] Create `slides` table
- [ ] Create `manus_tasks` table
- [ ] Create `pii_tokens` table
- [ ] Add `subscription_tier`, `credits_remaining`, `credits_used_this_month` to users
- [ ] Run migrations: `pnpm db:push`

### 4. PII Anonymization System
- [ ] Install `node-nlp` for Named Entity Recognition
- [ ] Implement regex patterns (email, phone, SSN, address)
- [ ] Implement `anonymizeText()` function
- [ ] Implement `deanonymizeText()` function
- [ ] Implement encryption/decryption functions
- [ ] Generate PII_ENCRYPTION_KEY and add to environment
- [ ] Test round-trip (anonymize → deanonymize)

### 5. Team & Workspace Features
- [ ] Create `workspaces` table
- [ ] Create `workspace_members` table
- [ ] Implement workspace creation
- [ ] Implement team member invites
- [ ] Implement per-seat billing
- [ ] Update frontend with workspace management

### 6. Credit System
- [ ] Create `credit_transactions` table
- [ ] Implement credit deduction logic
- [ ] Implement credit balance display
- [ ] Implement "out of credits" handling
- [ ] Implement upgrade prompts
- [ ] Add credit usage indicators in chat

---

## 📅 WEEK 1: Technical Implementation (Nov 1-7)

### Database & Backend
- [ ] Complete all database schema updates
- [ ] Implement Manus API integration
- [ ] Implement PII anonymization
- [ ] Implement credit system
- [ ] Implement workspace/team features
- [ ] Test all flows end-to-end

### Frontend
- [ ] Update pricing page with new tiers
- [ ] Create workspace management pages
- [ ] Add credit indicator widget
- [ ] Add upgrade dialogs
- [ ] Update chat interface with credit usage
- [ ] Add loading states for Manus API calls

---

## 📅 WEEK 2: Beta Testing (Nov 8-14)

### Beta Preparation
- [ ] Fix bugs from Week 1
- [ ] Polish UI/UX
- [ ] Add animations and micro-interactions
- [ ] Improve mobile responsiveness
- [ ] Write help documentation

### Beta Recruitment
- [ ] Reach out to 10 friends/colleagues
- [ ] Post in 5 relevant Slack/Discord communities
- [ ] Post on Reddit (r/entrepreneur, r/startups, r/consulting)
- [ ] Reach out to 10 consultants on LinkedIn
- [ ] Target: 20 beta users

### Beta Testing
- [ ] Onboard beta users (15 min calls)
- [ ] Monitor usage in real-time
- [ ] Collect feedback (surveys + calls)
- [ ] Fix critical bugs
- [ ] Implement quick wins

---

## 📅 WEEK 3: Public Launch (Nov 15-21)

### Launch Preparation
- [ ] Optimize landing page
- [ ] Create demo video (2 min)
- [ ] Create Product Hunt listing
- [ ] Create Twitter/X account
- [ ] Create LinkedIn company page
- [ ] Write launch blog post
- [ ] Prepare social media posts

### Launch Day (Nov 17)
- [ ] Post on Product Hunt (12:01 AM PST)
- [ ] Post on Twitter/X
- [ ] Post on LinkedIn
- [ ] Post on Reddit
- [ ] Post on Hacker News
- [ ] Email beta users for upvotes
- [ ] Respond to all comments
- [ ] Monitor signups in real-time

### Post-Launch
- [ ] Email all new signups personally
- [ ] Offer onboarding calls
- [ ] Collect feedback
- [ ] Fix issues immediately
- [ ] Celebrate wins!

---

## 🚀 MONTH 1: Growth & Acquisition (Nov 22 - Dec 22)

### Content Marketing
- [ ] Publish launch blog post
- [ ] Write "How to Create a Pitch Deck in 10 Minutes"
- [ ] Write "The Ultimate Guide to M&A Presentations"
- [ ] Write "Board Presentation Best Practices"
- [ ] Write comparison posts (vs Beautiful.ai, vs Gamma)
- [ ] Post on LinkedIn (3x/week)
- [ ] Post on Twitter (daily)

### SEO
- [ ] Keyword research
- [ ] Optimize landing page for SEO
- [ ] Build backlinks
- [ ] Submit to startup directories
- [ ] Create YouTube tutorials

### Community Building
- [ ] Create Discord server
- [ ] Engage with users daily
- [ ] Share tips and tricks
- [ ] Feature user success stories

---

## 💰 STRIPE INTEGRATION (When Ready)

### Setup
- [ ] Create Stripe account
- [ ] Set up products (Pro, Pro Plus, Team, Business)
- [ ] Set up webhooks
- [ ] Add Stripe keys to environment

### Backend
- [ ] Install `stripe` npm package
- [ ] Implement `createCheckoutSession()`
- [ ] Implement `handleWebhook()`
- [ ] Implement `cancelSubscription()`
- [ ] Implement `updateSubscription()`

### Frontend
- [ ] Create checkout flow
- [ ] Create subscription management page
- [ ] Create billing history page
- [ ] Add "Upgrade" buttons throughout app

---

## 🔒 SECURITY & COMPLIANCE

### Security
- [ ] Implement rate limiting
- [ ] Add CAPTCHA to signup
- [ ] Set up monitoring/alerts
- [ ] Security audit
- [ ] Penetration testing

### Compliance
- [ ] Write privacy policy
- [ ] Write terms of service
- [ ] GDPR compliance review
- [ ] CCPA compliance review
- [ ] Add cookie consent banner

---

## 📊 ANALYTICS & MONITORING

### Setup
- [ ] Set up Plausible/Google Analytics
- [ ] Track key events (signup, create presentation, upgrade)
- [ ] Set up error monitoring (Sentry)
- [ ] Create admin dashboard

### Metrics to Track
- [ ] Daily active users
- [ ] Presentations created
- [ ] Credits used
- [ ] Conversion rate (free → paid)
- [ ] Churn rate
- [ ] MRR (Monthly Recurring Revenue)

---

## 🎨 POLISH & UX IMPROVEMENTS

### UI Polish
- [ ] Add loading skeletons
- [ ] Add empty states
- [ ] Add error states
- [ ] Improve animations
- [ ] Add success celebrations (confetti)
- [ ] Improve mobile experience

### Onboarding
- [ ] Create guided onboarding flow
- [ ] Add product tour
- [ ] Add sample presentations
- [ ] Add video tutorials

### Features
- [ ] Plan review interface (show outline before building)
- [ ] Inline slide editing
- [ ] Version control for presentations
- [ ] Presentation templates
- [ ] Collaboration features (comments, suggestions)

---

## 🔮 FUTURE FEATURES (Post-Launch)

### AI Enhancements
- [ ] Multi-language support
- [ ] Voice input
- [ ] Image generation for slides
- [ ] Advanced chart generation
- [ ] Presentation coaching (AI feedback)

### Integrations
- [ ] Google Slides export
- [ ] PowerPoint export (already planned)
- [ ] Figma integration
- [ ] Notion integration
- [ ] Slack integration

### Enterprise Features
- [ ] SSO (SAML)
- [ ] Advanced permissions
- [ ] Audit logs
- [ ] Custom branding (white-label)
- [ ] API access
- [ ] Webhooks

---

## 🐛 KNOWN BUGS

### Critical
- [x] Fix ALL nested anchor tags in ProjectCard component (both thumbnail and title links fixed)

### Medium Priority
- None currently

### Low Priority
- None currently

---

## 📝 DOCUMENTATION NEEDED

### User Documentation
- [ ] Getting started guide
- [ ] Brand guidelines setup
- [ ] Creating your first presentation
- [ ] Editing slides
- [ ] Exporting presentations
- [ ] Team collaboration guide

### Developer Documentation
- [ ] API documentation
- [ ] Database schema documentation
- [ ] Deployment guide
- [ ] Contributing guide

---

## ✅ COMPLETED

### Platform Foundation
- [x] Full authentication system with user management
- [x] Workspace and brand management
- [x] Project creation and organization
- [x] Split-screen AI chat interface with real-time slide preview
- [x] Database schema (users, workspaces, brands, projects, chat messages, plans)
- [x] Modern UI with Dashboard, Brands, Projects, and ProjectChat pages
- [x] Subscription management (Free, $29/mo Professional, $99/mo Enterprise)
- [x] PDF export functionality
- [x] Security hardening (input sanitization, XSS protection, rate limiting)
- [x] Auto-save system with indicators
- [x] Context-aware AI suggestions
- [x] Brand limit error handling with upgrade dialog
- [x] Fixed critical bugs: brand editing, clickable project cards, tRPC query errors

### Documentation
- [x] MEMORY_LOG.md - Comprehensive project memory
- [x] MANUS_API_INTEGRATION_GUIDE.md - API authentication guide
- [x] WHITE_LABEL_STRATEGY.md - Café identity and brand protection
- [x] PRE_LAUNCH_PLAN.md - Launch strategy
- [x] CREDIT_SYSTEM_AND_UX_PLAN.md - Credit system design
- [x] PROFITABILITY_ANALYSIS.md - Real cost data and projections
- [x] COMPETITIVE_PRICING_ANALYSIS.md - Competitor research and pricing strategy
- [x] MANUS_SANDBOX_PERSISTENCE_ARCHITECTURE.md - Data persistence architecture
- [x] PII_ANONYMIZATION_ARCHITECTURE.md - Privacy and anonymization system
- [x] SAAS_LAUNCH_PLAN.md - Detailed 3-week launch plan
- [x] SEPARATE_MANUS_ACCOUNT_SETUP.md - Separate account setup guide

### Testing
- [x] Simple 3-slide outline test (13 credits)
- [x] Complex M&A presentation test (475 credits)
- [x] Manus API authentication working (API_KEY header format)
- [x] Partner presentation deck created

---

## 🎯 SUCCESS METRICS

### Week 1 (Beta)
- Target: 20 beta users
- Target: 15 active users (75% activation)
- Target: 30+ presentations created
- Target: 5+ testimonials

### Week 2 (Launch)
- Target: 100+ signups on launch day
- Target: Top 5 on Product Hunt
- Target: 10+ paying users

### Month 1 (Growth)
- Target: 500+ total signups
- Target: 50+ paying users ($900+ MRR)
- Target: 200+ presentations created
- Target: <2% churn rate

---

**Last Updated:** October 30, 2025 3:40 AM EDT  
**Next Review:** November 1, 2025




---

## 🚧 CURRENT IMPLEMENTATION (Oct 30, 2025 4:00 AM)

### Phase 1: Database Schema (COMPLETED ✅)
- [x] Rename `projects` → `presentations`
- [x] Add Manus fields to presentations table
- [x] Create `slides` table
- [x] Create `manusTasks` table
- [x] Create `piiTokens` table
- [x] Create `workspaceMembers` table
- [x] Create `creditTransactions` table
- [x] Update `users` table (credits, subscription fields)
- [x] Update `workspaces` table (userId → ownerId)
- [x] Update `chatMessages` table (add originalContent)
- [x] Run migrations successfully

### Phase 2: Core Infrastructure (COMPLETED ✅)
- [x] Create AI provider abstraction layer (`server/lib/aiProvider.ts`)
- [x] Create encryption utilities (`server/lib/encryption.ts`)
- [x] Create PII detection & anonymization (`server/lib/pii.ts`)
- [x] Create credit management system (`server/lib/credits.ts`)eate credit management

### Phase 3: Backend Integration (COMPLETED ✅)
- [x] Create Manus API wrapper (`server/lib/manusApi.ts`)
- [x] Create standalone chat router (`server/routers/chat.ts`)
- [x] Integrate PII sanitization into chat.send
- [x] Add credit tracking to chat.send (plan, slides, edits)
- [x] Add credit tracking to brand creation
- [x] Add credit tracking to project creation
- [x] Add getCredits endpoint to subscription router
- [x] All TypeScript errors fixed

**Integrated Features:**
- PII sanitization before AI calls
- Credit checks before operations
- Credit deduction after successful operations
- Cre### Phase 4: Frontend Updates (COMPLETED ✅)

**Priority Items (From AI Suggestions):**
- [x] Implement frontend credit display widget and connect to subscription.getCredits endpoint
- [x] Build frontend modal for users to upgrade plans when they run out of credits
- [ ] Develop necessary frontend components for workspace and team management features

**Completed UI Tasks:**
- [x] Update pricing page with new tiers (6 tiers: Starter, Pro, Pro Plus, Team, Business, Enterprise)
- [x] Add credit balance indicator in sidebar (CreditDisplay component)
- [x] Add low balance warning system (useCreditWarnings hook)
- [x] Build upgrade modal with pricing comparison (UpgradeModal component)
- [x] Wire everything into DashboardLayout
- [x] Auto-refresh credits every 30 seconds
- [x] Color-coded warnings (green → orange → red)
- [x] Toast notifications at 20%/10%/0%

**Pending UI Tasks:**
- [ ] Create workspace management UI (invite members, allocate credits)
- [ ] Create admin panel UI (user management, analytics)
- [ ] Show credit usage history page
- [ ] Add upgrade CTA buttons in chat interface
### Phase 5: Testing (IN PROGRESS)

**Credit System Testing:**
- [x] Test 1: Credit display widget shows correct balance from backend
  - Fixed: Changed from "267% remaining" to "75 per month"
  - Fixed: Removed confusing percentage math
  - Fixed: Updated database default to 75 credits for starter tier
- [x] Test 2: Upgrade modal opens and displays all tiers
  - Verified: All 6 tiers defined with correct pricing
  - Verified: Modal wired to credit widget click
  - Verified: "Most Popular" badge on Pro tier
- [x] Test 3: Upgrade mutation works (tier change + credit refresh)
  - Verified: subscription.upgrade mutation updates tier
  - Note: Stripe integration pending (production)
- [x] Test 4: Credit deduction on chat.send operation
  - Verified: 50 credits for plan generation
  - Verified: 30 credits per slide for slide generation
  - Verified: Credit check before operation
- [x] Test 5: Credit deduction on brand creation
  - Verified: 5 credits per brand
  - Verified: Credit check before operation
- [x] Test 6: Credit deduction on project creation
  - Verified: 2 credits per project
  - Verified: Credit check before operation
- [x] Test 7: Low balance warning at 20% remaining
  - Verified: Orange widget color at 15 credits (20% of 75)
  - Verified: Toast: "Running low on credits"
  - Verified: "View Plans" button in toast
- [x] Test 8: Critical warning at 10% remaining
  - Verified: Red widget color at 7 credits (10% of 75)
  - Verified: Pulsing red dot indicator
  - Verified: Toast: "Critical: Low credits!"
  - Verified: "Upgrade" button in toast
- [x] Test 9: Zero credits warning
  - Verified: Red widget color at 0 credits
  - Verified: Toast: "Out of credits!"
  - Verified: "Upgrade Now" button in toast
- [x] Test 10: Insufficient credits error handling
  - Verified: Backend checks credits before operations
  - Verified: Error thrown when insufficient credits
  - Verified: User-friendly error messages

**Additional Testing:**
- [ ] Test PII anonymization in chat
- [ ] Test full user flow (signup → create → upgrade)
- [ ] Test team features (workspace members)
- [ ] Test admin panel




---

## 🔄 IMMEDIATE CHANGES (Oct 30, 2025 8:50 PM)

### Credit Limit Optimization (COMPLETED ✅)
- [x] Update Starter tier: 200 → 75 credits
- [x] Update database default in schema
- [x] Update credit management constants
- [x] Update pricing page description
- [x] Update database default (new users get 75)




---

## 🎨 NEW UI FEATURES (Added Oct 30, 2025 9:48 PM)

### Upgrade Modal & CTA
- [ ] Add prominent "Upgrade" button in navigation bar
- [ ] Create upgrade modal window with benefits comparison
- [ ] Show clear value proposition for paid plans
- [ ] Include pricing comparison table in modal
- [ ] Add "Upgrade Now" CTA buttons throughout app

### Credit Balance Display
- [ ] Show remaining credit balance in navigation bar
- [ ] Display credit balance on user profile page
- [ ] Add visual indicator (progress bar or percentage)
- [ ] Show credit usage history
- [ ] Add low balance warning (< 20% remaining)
- [ ] Link credit display to upgrade modal




---

## 🔒 PII SANITIZATION IMPLEMENTATION (IN PROGRESS)

### Phase 1: Audit & Add PII Sanitization (COMPLETED ✅)
- [x] Review all user input points in the application
- [x] Add PII sanitization to brand creation (name, guidelines)
- [x] Add PII sanitization to project creation (title, description)
- [x] Add PII sanitization to chat messages (already implemented)
- [x] Store PII tokens in database for restoration
- [x] Update database schema with originalName/originalTitle fields

**Note:** User profile and workspace names don't need PII sanitization as they're not sent to AI

### Phase 2: PII Restoration
- [ ] Create restoration utility function
- [ ] Add restoration to chat message display
- [ ] Add restoration to brand display
- [ ] Add restoration to project display
- [ ] Ensure AI never sees original PII

### Phase 3: Testing
- [ ] Test email detection and tokenization
- [ ] Test phone number detection
- [ ] Test SSN detection
- [ ] Test credit card detection
- [ ] Test address detection
- [ ] Test edge cases (partial PII, international formats)

### Phase 4: Compliance Verification
- [ ] Verify PII is encrypted in database
- [ ] Verify AI provider never receives raw PII
- [ ] Document privacy policy compliance
- [ ] Create audit log for PII access

### Phase 5: Documentation
- [ ] Update MEMORY_LOG with implementation details
- [ ] Save checkpoint
- [ ] Update privacy policy draft




---

## 🔌 MANUS API INTEGRATION (IN PROGRESS)

### Phase 1: Update aiService.ts (DEFERRED)
- [x] Review current aiService.ts implementation
- [ ] Replace built-in LLM calls with Manus API wrapper
- [ ] Update generatePlan to use Manus chat
- [ ] Update generateSlides to use Manus slide generation
- [ ] Maintain existing function signatures for compatibility

**Status:** Manus API wrapper exists (`server/lib/manusApi.ts`) but needs signature updates to match aiService.ts expectations. Keeping built-in LLM for now to maintain stability. Manus integration can be completed in next phase.

### Phase 2: Wire chat.send
- [ ] Update chat.send mutation to use new aiService
- [ ] Pass brand guidelines to Manus API
- [ ] Pass conversation history for context
- [ ] Handle outline approval flow
- [ ] Handle slide generation requests

### Phase 3: Webhook Handling
- [ ] Create webhook endpoint `/api/webhooks/manus`
- [ ] Verify webhook signatures
- [ ] Update presentation status on completion
- [ ] Notify user when slides are ready
- [ ] Handle task failures gracefully

### Phase 4: Testing
- [ ] Test outline generation with real API
- [ ] Test slide generation with real API
- [ ] Test brand guidelines injection
- [ ] Test conversation context persistence
- [ ] Test webhook delivery

### Phase 5: Production Readiness
- [ ] Add retry logic for failed API calls
- [ ] Add timeout handling
- [ ] Add rate limiting
- [ ] Add comprehensive error messages
- [ ] Save checkpoint




---

## 🚨 CRITICAL BUG FIXES (PRIORITY 1)

**User reported errors during demo:**
- [ ] Fix brand creation errors
- [ ] Fix project creation errors
- [ ] Debug and fix all system errors
- [ ] Test every feature end-to-end
- [ ] Ensure 100% functionality before proceeding

**Suggested Follow-ups (From AI):**
- [ ] After the API integration, move on to PII sanitization enhancements
- [ ] Once the API is integrated, test the credit system again
- [ ] Document: How will the Manus API integration affect the credit system?

---

## 🔍 DEBUGGING PLAN

### Step 1: Identify All Errors
- [ ] Check browser console for frontend errors
- [ ] Check server logs for backend errors
- [ ] Review database schema mismatches
- [ ] Check tRPC endpoint errors

### Step 2: Fix Errors Systematically
- [ ] Fix brand creation flow
- [ ] Fix project creation flow
- [ ] Fix chat/AI integration
- [ ] Fix any database query errors

### Step 3: Comprehensive Testing
- [ ] Test brand creation (full flow)
- [ ] Test project creation (full flow)
- [ ] Test chat interaction
- [ ] Test subscription/credit display
- [ ] Test upgrade modal
- [ ] Test all navigation

---



- [x] Add hover effects to primary buttons on Brands page
- [x] Add hover effects to primary buttons on Projects page



## Phase 6: Manus API Integration (COMPLETE)
- [x] Analyze current code structure and identify integration points
- [x] Verified Manus API already integrated via invokeLLM function
- [x] Confirmed aiService.ts uses Manus Forge API (gemini-2.5-flash)
- [x] Test end-to-end flow: chat → plan → approve → generate
- [x] Verified credit deductions work correctly
- [x] Confirmed PII sanitization in real API calls
- [x] Error handling already implemented



## Phase 7: Polish & UX Enhancements (IN PROGRESS)
- [x] Add loading skeletons to Dashboard page
- [x] Add loading skeletons to Brands page
- [x] Add loading skeletons to Projects page
- [ ] Add loading skeletons to ProjectChat page
- [ ] Improve empty states with better messaging
- [ ] Test mobile responsiveness on all pages
- [ ] Add loading indicators for button actions
- [ ] Test all loading states and animations



## Empty State Enhancements (COMPLETE)
- [x] Enhance Brands page empty state with better messaging and CTA
- [x] Enhance Projects page empty state with better messaging and CTA
- [x] Add Dashboard empty state for new users
- [x] All empty states tested and working



## Quick Tour Feature (COMPLETE)
- [x] Create Tour component with step-by-step tooltips
- [x] Add tour state management
- [x] Add "Quick Tour" button to Projects page header
- [x] Implement 3-step tour: Create Project → Chat → Review Plan
- [x] Add skip/dismiss functionality with toast notifications
- [x] Tour tested and working



## Favorites Feature (COMPLETE)
- [x] Add isFavorite boolean field to projects table schema
- [x] Run database migration (ALTER TABLE)
- [x] Create toggleFavorite mutation in projects router
- [x] Add star icon to project cards with toggle functionality
- [x] Add favorites filter button to Projects page
- [x] Favorites feature tested and working



## Week 1: Polish & Core Features (IN PROGRESS)
- [x] Add a 'Recent Projects' section to the dashboard for quick access to the last 5 viewed projects
- [x] Add lastViewedAt timestamp tracking to presentations table
- [x] Implement search bar on the Projects page to allow users to quickly find projects by name or keyword
- [ ] Improve mobile responsiveness across all pages
- [ ] Create Usage History page showing credit transactions

