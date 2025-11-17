# SlideCoffee - Perpetual Memory Log

**Last Updated:** 2025-11-04 02:22 AM EST  
**Current Version:** 4ea75028  
**Project Owner:** Javian Walker (javian@forthlogic.com)

---

## 🎯 Project Vision

**SlideCoffee** is an AI-first presentation creation tool that combines:
- **Gamma's polished UI/UX** - Clean, professional, intuitive interface
- **ChatGPT-style conversational AI** - Natural language interaction throughout
- **Live preview features** - Real-time slide generation and updates
- **Coffee-themed branding** - Warm, inviting, unique personality

**Core Differentiator:** AI agent as the primary interface, not just a feature.

---

## 📊 Current State (as of Nov 4, 2025)

### ✅ Completed Features

#### Week 1 Progress
- **Day 1-2:** Grid/list toggle, three-dot menu actions (duplicate, delete), folders system
- **Day 3:** Sidebar Quick Access (Recent, Favorites with counts)
- **Day 4:** Folders implementation (database schema, CRUD, sidebar integration)

#### AI-First Onboarding
- ✅ Chat-first brand onboarding (replaced CRUD forms)
- ✅ Conversational brand building with LLM
- ✅ File upload workflow for PowerPoint/PDF
- ✅ Skip button working (no forced onboarding)
- ✅ Typing indicators in chat
- ✅ Brand analysis service (placeholder ready)

#### Dashboard Features
- ✅ AI-agent-first Dashboard with chat interface
- ✅ Context-aware AI (knows user's projects, brands)
- ✅ Natural language commands
- ✅ Quick action suggestions
- ✅ Recent projects display

#### Template System
- ✅ Templates page with upload UI
- ✅ Template extraction service (PowerPoint/PDF structure ready)
- ✅ Extraction results display (text/image counts)
- ✅ Backend integration with tRPC

#### Technical Infrastructure
- ✅ Database schema (users, brands, projects, folders, templates)
- ✅ tRPC API with full type safety
- ✅ LLM integration (Manus AI provider)
- ✅ S3 storage integration
- ✅ Authentication (Manus OAuth)
- ✅ DashboardLayout with sidebar navigation

### 🚧 In Progress

#### Gamma UI Clone (Current Focus)
- **Status:** Planning complete, implementation starting
- **Goal:** Clone Gamma's entire UI/UX while adding AI-first features
- **Timeline:** 10-12 hours estimated

---

## 📋 Comprehensive Implementation Plan

### Phase 1: Gamma Dashboard Clone ⏳
**Objective:** Replicate Gamma's clean, professional dashboard

**Tasks:**
- [ ] Clone sidebar navigation structure (Gammas, Shared, Sites, AI Images, Folders, Templates, Themes, Settings)
- [ ] Implement "Create new" button with AI badge (gradient blue)
- [ ] Add "Import" dropdown button
- [ ] Build filters bar (All, Recently viewed, Created by you, Favorites)
- [ ] Implement grid/list toggle (already partially done)
- [ ] Polish project cards with hover effects and shadows
- [ ] Add "Jump to" search (Ctrl+K)

**Design Reference:** Screenshot 1 (Gamma dashboard)

---

### Phase 2: Create with AI Page ⏳
**Objective:** Build the main creation hub with 4 modes

**Tasks:**
- [ ] Build centered layout with gradient background
- [ ] Create 4 mode cards:
  1. **Paste in text** - "Aa" icon, create from notes/outline
  2. **Generate** - Sparkles icon, one-line prompt creation
  3. **Import file or URL** - Upload icon, enhance existing docs
  4. **Remix a template** - Layers icon, fill in templates (BETA)
- [ ] Add icons and descriptions for each mode
- [ ] Implement "Your recent prompts" section
- [ ] Wire up navigation to each mode page

**Design Reference:** Screenshot 3 (Create with AI page)

---

### Phase 3: Generate Mode ⏳
**Objective:** Build the prompt-based generation interface

**Tasks:**
- [ ] Header with "Generate" title and "What would you like to create today?"
- [ ] Type selector buttons (Presentation/Webpage/Document/Social)
- [ ] Configuration bar:
  - Slide count selector (- 10 cards +)
  - Style dropdown (Default)
  - Language dropdown (English US)
- [ ] Large prompt textarea "Describe what you'd like to make"
- [ ] 6 suggested prompt cards with icons:
  - Mentorship initiatives
  - How to make sushi
  - Science fair project
  - Beautiful day hikes
  - Real estate investing
  - Industrial revolution lesson
- [ ] Shuffle button for prompts
- [ ] **AI chat sidebar integration** (SlideCoffee unique feature)
- [ ] **Live preview panel** (SlideCoffee unique feature)

**Design Reference:** Screenshot 4 (Generate mode)

---

### Phase 4: Paste in Text Mode ⏳
**Objective:** Build the text-to-presentation interface

**Tasks:**
- [ ] Header with "Paste in text" title and icon
- [ ] Type selector (Presentation/Webpage/Document/Social)
- [ ] Orientation dropdown (Portrait/Landscape)
- [ ] Large textarea "Type or paste in content here"
- [ ] Right sidebar: "Optional: card-by-card control"
  - Instructions on using --- to separate slides
  - Example content preview
- [ ] Bottom section: "What do you want to do with this content?"
  - Radio option 1: Generate from notes or outline
  - Radio option 2: Summarize long text or document
  - Radio option 3: Preserve this exact text
- [ ] **AI chat integration** for enhancement suggestions
- [ ] **Live preview** as user types

**Design Reference:** Screenshot 5 (Paste in text mode)

---

### Phase 5: Import Mode ⏳
**Objective:** Build the file/template import interface

**Tasks:**
- [ ] "Choose a template" heading
- [ ] Visual template cards display
- [ ] "Add your first template" card
- [ ] "+ Add a gamma" button
- [ ] File upload zone (drag-and-drop)
- [ ] **AI analysis chat during upload** (SlideCoffee unique)
- [ ] Show extraction results (text blocks, images, colors)
- [ ] Enhancement suggestions from AI
- [ ] Before/after comparison preview

**Design Reference:** Screenshot 2 (Import template page)

---

### Phase 6: Live Preview Panel 🎬
**Objective:** Add real-time slide rendering (SlideCoffee unique feature)

**Tasks:**
- [ ] Split-screen layout (input left, preview right)
- [ ] Resizable divider between input and preview
- [ ] Real-time slide rendering as AI generates
- [ ] Slide thumbnails navigation
- [ ] Zoom controls (+/-)
- [ ] Full-screen preview toggle
- [ ] Play presentation mode
- [ ] Edit slide inline
- [ ] Add/remove slides buttons
- [ ] Loading animations (shimmer effect)
- [ ] Success celebrations (confetti on completion)
- [ ] Progress indicators

**Wow Moments:**
- Smooth slide transitions
- Typewriter effect for text generation
- Fade-in animations for images
- Color palette preview
- Before/after comparisons

---

### Phase 7: AI Chat Integration Throughout 💬
**Objective:** Make AI chat persistent across all creation pages

**Tasks:**
- [ ] Persistent chat sidebar component
- [ ] Appears on all creation pages (Generate, Paste, Import)
- [ ] Collapsible with toggle button (→ ←)
- [ ] Chat history preservation across pages
- [ ] Typing indicator (animated dots)
- [ ] Suggested quick replies
- [ ] File upload in chat
- [ ] Image preview in chat
- [ ] Context-aware responses based on current mode

**AI Capabilities:**
- Asks clarifying questions during creation
- Suggests improvements to content
- Explains design choices
- Offers alternatives
- Provides tips and tricks
- References user's brand guidelines
- Learns from user preferences

---

### Phase 8: SlideCoffee Branding ☕
**Objective:** Apply unique coffee-themed branding

**Color Palette:**
- Primary: Coffee brown (#6B4423)
- Secondary: Cream (#F5E6D3)
- Accent: Espresso (#2C1810)
- AI Badge: Keep Gamma's gradient blue (professional)
- Success: Latte green (#8B7355)

**Typography:**
- Headings: Inter Bold
- Body: Inter Regular
- Monospace: JetBrains Mono (for code/technical)

**Unique Touches:**
- [ ] Coffee cup icon in logo
- [ ] "Brewing your presentation..." loading text
- [ ] "Steaming up your slides..." progress text
- [ ] Coffee-themed empty states ("No projects yet - time for a coffee break!")
- [ ] Warm, inviting tone in AI messages
- [ ] Coffee break tips in chat ("☕ Pro tip: Great presentations are like good coffee - strong start, smooth finish")

---

### Phase 9: Backend Integration 🔌
**Objective:** Connect all frontend features to working backend

**API Endpoints:**
- [ ] `POST /api/trpc/projects.create` - Create from prompt
- [ ] `POST /api/trpc/projects.paste` - Create from pasted text
- [ ] `POST /api/trpc/projects.import` - Import file
- [ ] `POST /api/trpc/projects.generate` - AI generation with streaming
- [ ] `GET /api/trpc/projects.preview` - Live preview data
- [ ] `POST /api/trpc/chat.send` - AI chat messages
- [ ] `POST /api/trpc/chat.stream` - Streaming AI responses

**Real-time Features:**
- [ ] WebSocket connection for live updates
- [ ] Server-sent events for AI streaming
- [ ] Optimistic UI updates
- [ ] Error recovery and retry logic
- [ ] Offline support with queue

---

### Phase 10: Polish & Testing ✨
**Objective:** Final polish and comprehensive testing

**Testing:**
- [ ] Test all 4 creation modes end-to-end
- [ ] Test AI chat interactions in each mode
- [ ] Test live preview updates
- [ ] Test file imports (PowerPoint, PDF)
- [ ] Test brand consistency across pages
- [ ] Test error handling and edge cases

**Performance:**
- [ ] Optimize image loading (lazy load, WebP)
- [ ] Lazy load components
- [ ] Cache API responses
- [ ] Minimize bundle size
- [ ] Code splitting by route

**Accessibility:**
- [ ] Keyboard navigation (Tab, Enter, Esc)
- [ ] Screen reader support (ARIA labels)
- [ ] Focus indicators visible
- [ ] Color contrast WCAG AA
- [ ] Skip to main content link

**Mobile Responsiveness:**
- [ ] Dashboard mobile view
- [ ] Creation modes on mobile
- [ ] Chat sidebar on mobile (bottom sheet)
- [ ] Preview panel on mobile (full screen toggle)
- [ ] Touch gestures (swipe, pinch)

---

## 🎯 User Journeys

### Journey 1: New User Onboarding
1. User lands → AI chat greeting appears
2. AI asks about brand → Conversational setup
3. AI suggests first project → "Let's create!"
4. Seamless transition → Dashboard with guidance

### Journey 2: Creating with Generate Mode
1. Dashboard → Click "Create new" with AI badge
2. Create with AI page → 4 modes shown
3. Select "Generate" → Type selector appears
4. Choose "Presentation" → Prompt textarea
5. See suggested prompts → Click or type own
6. AI chat opens → Asks clarifying questions
7. Live preview → Slides appear in real-time
8. AI suggests improvements → User approves
9. Final review → Project saved

### Journey 3: Import & Enhance
1. Click "Import" → File upload zone
2. Drag PowerPoint → AI analyzes
3. AI chat: "Found 10 slides with brand colors!"
4. Enhancement suggestions → AI offers improvements
5. Live preview → Original vs enhanced side-by-side
6. User approves → Enhanced version saved

### Journey 4: Paste & Transform
1. Select "Paste" mode → Large textarea
2. Paste outline/notes → AI chat activates
3. AI asks: "What style? How many slides?"
4. Card-by-card control → User specifies with ---
5. Live preview → Slides build in real-time
6. AI refines → Suggests improvements
7. User approves → Project saved

---

## 🔧 Technical Stack

### Frontend
- **Framework:** React 19 + TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Routing:** Wouter
- **State:** tRPC React Query
- **Forms:** React Hook Form + Zod

### Backend
- **Runtime:** Node.js 22 + Express 4
- **API:** tRPC 11 with Superjson
- **Database:** MySQL/TiDB via Drizzle ORM
- **Auth:** Manus OAuth
- **Storage:** S3 (Manus built-in)
- **AI:** Manus LLM API

### DevOps
- **Dev Server:** Vite + tsx watch
- **Type Checking:** TypeScript 5
- **Linting:** ESLint
- **Package Manager:** pnpm

---

## 📁 Project Structure

```
slidecoffee/
├── client/
│   ├── public/          # Static assets
│   └── src/
│       ├── pages/       # Page components
│       │   ├── Dashboard.tsx       # AI-first dashboard
│       │   ├── Onboarding.tsx      # Chat-based onboarding
│       │   ├── Projects.tsx        # Projects list
│       │   ├── Templates.tsx       # Template management
│       │   ├── CreateWithAI.tsx    # 4 creation modes (TO BUILD)
│       │   ├── GenerateMode.tsx    # Prompt-based creation (TO BUILD)
│       │   ├── PasteMode.tsx       # Text-to-slides (TO BUILD)
│       │   └── ImportMode.tsx      # File import (TO BUILD)
│       ├── components/  # Reusable components
│       │   ├── DashboardLayout.tsx # Main layout with sidebar
│       │   ├── ChatSidebar.tsx     # Persistent AI chat (TO BUILD)
│       │   ├── LivePreview.tsx     # Real-time preview (TO BUILD)
│       │   └── ui/                 # shadcn/ui components
│       ├── lib/         # Utilities
│       │   └── trpc.ts             # tRPC client
│       └── App.tsx      # Routes
├── server/
│   ├── routers.ts       # tRPC API routes
│   ├── db.ts            # Database queries
│   ├── services/
│   │   ├── aiService.ts            # AI command handling
│   │   ├── brandAnalysis.ts        # Brand extraction
│   │   └── templateExtraction.ts   # PowerPoint/PDF parsing
│   ├── lib/
│   │   └── aiProvider.ts           # LLM integration
│   └── _core/           # Framework code
├── drizzle/
│   └── schema.ts        # Database schema
└── shared/              # Shared types
```

---

## 🐛 Known Issues

### Critical
- None currently

### Minor
- Template extraction is placeholder (needs actual PowerPoint/PDF parsing)
- Live preview not yet implemented
- Chat sidebar not persistent across pages
- No WebSocket for real-time updates

---

## 🎯 Success Metrics

- [ ] User completes onboarding in < 2 minutes
- [ ] User creates first presentation in < 5 minutes
- [ ] 90%+ of users interact with AI chat
- [ ] Live preview loads in < 1 second
- [ ] Zero TypeScript errors ✅
- [ ] Lighthouse score > 90

---

## 📝 Important Notes

### Design Philosophy
- **AI-first, not AI-added:** Chat is the primary interface, not a sidebar feature
- **Gamma's polish + SlideCoffee's magic:** Clone the UI, add unique AI features
- **Live preview everywhere:** Users see results in real-time
- **Conversational, not transactional:** Natural language over forms

### User Feedback
- "Skip button not working" → ✅ Fixed (removed forced redirect)
- "Onboarding feels disjointed" → ✅ Fixed (chat-first flow)
- "Want to upload templates" → ✅ Implemented
- "Need typing indicator" → ✅ Already present
- "Clone Gamma's UI" → 🚧 In progress

### Next Session Priorities
1. Start with Gamma Dashboard clone
2. Build Create with AI page
3. Implement Generate mode with AI chat
4. Add live preview panel
5. Test end-to-end flow

---

## 🔄 Change Log

### 2025-11-04 02:22 AM - Comprehensive Plan Created
- Created GAMMA_CLONE_PLAN.md with 10-phase implementation
- Updated todo.md with actionable checklist
- Documented 4 complete user journeys
- Ready to start Gamma Dashboard clone

### 2025-11-04 01:54 AM - Template Extraction
- Implemented template extraction service
- Added PowerPoint/PDF extraction structure
- Integrated with upload endpoint
- UI displays extraction results

### 2025-11-04 01:37 AM - Skip Button Fix
- Removed forced onboarding redirect
- Users can now access Dashboard without brand setup
- Templates page created with upload UI

### 2025-11-04 00:28 AM - AI-First Dashboard
- Replaced traditional dashboard with chat-first interface
- Added context-aware AI (knows user's projects/brands)
- Implemented natural language commands
- Fixed React Hooks violations

### 2025-11-03 23:55 PM - Chat-First Onboarding
- Completely redesigned onboarding
- Removed CRUD forms, added conversational flow
- Implemented LLM integration for brand building
- Added file upload workflow

---

**End of Perpetual Memory Log**

