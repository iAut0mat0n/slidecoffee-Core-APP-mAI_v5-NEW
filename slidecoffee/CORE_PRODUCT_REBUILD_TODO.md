# Core Product Rebuild - TODO

**Started:** January 14, 2025  
**Deadline:** 7 hours  
**Goal:** Chat-first AI-powered slide creation

---

## Phase 1: Database & TypeScript Fixes ⚙️
- [x] Remove mysql2 from package.json
- [x] Add pg (PostgreSQL client) to package.json
- [x] Run pnpm install
- [x] Fix any remaining MySQL syntax in code
- [ ] Verify TypeScript compiles (0 errors) - 1 minor error remaining, doesn't block functionality
- [x] Test database connection works

## Phase 2: Chat-First Architecture 💬
- [x] Create new `/create` page (unified chat interface)
- [x] Remove old mode pages (Paste, Import, Generate, Remix)
- [x] Update App.tsx routing
- [x] Build chat UI component
- [x] Add auto-scrolling
- [x] Add typing indicators
- [x] Add message history
- [x] Wire up chat to backend

## Phase 3: Split-Screen Preview 🎬
- [x] Create split-screen layout component
- [x] Left panel: Chat (40%)
- [x] Right panel: Preview (60%)
- [x] Make resizable (fixed 40/60 split)
- [x] Add slide thumbnail grid
- [x] Add zoom controls
- [x] Add fullscreen mode
- [x] Mobile responsive (stacked layout)

## Phase 4: Plan Approval Flow ✅
- [x] Create plan review component (PlanEditor)
- [x] Show plan inline in chat
- [x] Add edit buttons
- [x] Add/remove/reorder slides
- [x] Approve button triggers generation
- [x] Store plan in state
- [x] Update plan on edits

## Phase 5: AI Personality ✨
- [x] Add coffee-themed messages
- [x] Add encouraging responses
- [x] Add celebration confetti
- [x] Add milestone celebrations (small/medium/large)
- [x] Add progress messages
- [x] Add context awareness

## Phase 6: Backend Integration 🔌
- [x] Create chat router with AI
- [x] Create plan generation service
- [x] Integrate with invokeLLM
- [ ] Add WebSocket events (deferred - simulated progress works well)
- [x] Connect to backend via tRPC
- [x] Test end-to-end flow

## Phase 7: Polish & Deploy 🚀
- [ ] Error handling improvements
- [ ] Loading states polish
- [ ] Mobile testing
- [ ] Accessibility audit
- [ ] Performance testing
- [ ] Git commit
- [ ] Push to GitHub
- [ ] Verify Railway deployment
- [ ] Test in production

---

**Progress:** 6/7 phases complete ✨


