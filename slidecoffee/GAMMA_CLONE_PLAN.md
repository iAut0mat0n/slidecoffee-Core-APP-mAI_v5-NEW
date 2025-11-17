# SlideCoffee: Gamma UI Clone + AI-First Experience

## 🎯 Vision
Clone Gamma's polished UI/UX while integrating SlideCoffee's AI-first chat experience and live preview features to create a magical presentation creation tool.

---

## 📋 Complete User Journey

### Journey 1: New User Onboarding
1. **User lands on app** → AI chat greeting appears immediately
2. **AI asks about brand** → Conversational brand setup (already implemented)
3. **AI suggests first project** → "Let's create your first presentation!"
4. **Seamless transition** → Moves to Dashboard with AI guidance

### Journey 2: Creating a Presentation (Generate Mode)
1. **Dashboard** → User clicks "Create new" button with AI badge
2. **Create with AI page** → 4 modes displayed (Paste, Generate, Import, Remix)
3. **User selects Generate** → Type selector appears (Presentation/Webpage/Document/Social)
4. **Suggested prompts** → AI shows example prompts with shuffle button
5. **User enters prompt** → AI chat sidebar opens, starts conversation
6. **Live preview** → Slides appear in real-time as AI generates
7. **AI asks clarifications** → "Want more slides about X?" in chat
8. **Final review** → User approves, project saved

### Journey 3: Import & Enhance
1. **User clicks Import** → File upload zone appears
2. **Drag PowerPoint/PDF** → AI analyzes in real-time
3. **AI chat feedback** → "I found 10 slides with your brand colors!"
4. **Enhancement suggestions** → AI suggests improvements in chat
5. **Live preview** → Shows original vs enhanced side-by-side
6. **User approves** → Enhanced version saved

### Journey 4: Paste & Transform
1. **User selects Paste mode** → Large textarea with instructions
2. **Pastes outline/notes** → AI chat activates
3. **AI asks questions** → "What style? How many slides?"
4. **Card-by-card control** → User can specify slide content with ---
5. **Live preview** → Slides build in real-time
6. **AI refines** → Suggests improvements via chat

---

## 🎨 Phase 1: Gamma Dashboard Clone

### Sidebar (Left)
- [ ] Workspace dropdown at top
- [ ] Jump to search (Ctrl+K)
- [ ] **Main Navigation**
  - [ ] Gammas (Projects)
  - [ ] Shared with you
  - [ ] Sites
  - [ ] AI Images
- [ ] **Folders Section**
  - [ ] "+ Create or join a folder" link
  - [ ] Collapsible folder list
- [ ] **Bottom Section**
  - [ ] Templates
  - [ ] Themes
  - [ ] Custom fonts
  - [ ] Trash
  - [ ] Settings & members
  - [ ] Contact support
  - [ ] Share feedback

### Top Bar
- [ ] "Create new" button with AI badge (gradient blue)
- [ ] "+ New gamma" button
- [ ] "Import" dropdown button
- [ ] Grid/List toggle (right side)
- [ ] User avatar (right side)
- [ ] Notifications icon

### Filters Bar
- [ ] All (default)
- [ ] Recently viewed
- [ ] Created by you
- [ ] Favorites (star icon)

### Project Grid
- [ ] Card layout with thumbnails
- [ ] Project title below thumbnail
- [ ] Creator avatar + "Created by you"
- [ ] "Last viewed X months ago"
- [ ] Three-dot menu (duplicate, move, delete)
- [ ] Hover effects and shadows

---

## 🚀 Phase 2: Create with AI Page

### Layout
- [ ] Centered content with gradient background
- [ ] "Create with AI" large heading
- [ ] "How would you like to get started?" subheading

### 4 Creation Modes (Cards)
1. **Paste in text**
   - [ ] Icon: "Aa" on gradient background
   - [ ] Title: "Paste in text"
   - [ ] Description: "Create from notes, an outline, or existing content"
   
2. **Generate**
   - [ ] Icon: Sparkles on gradient background
   - [ ] Title: "Generate"
   - [ ] Description: "Create from a one-line prompt in a few seconds"
   
3. **Import file or URL**
   - [ ] Icon: Upload arrow on gradient background
   - [ ] Title: "Import file or URL"
   - [ ] Description: "Enhance existing docs, presentations, or webpages"
   - [ ] "LAST USED" badge
   
4. **Remix a template** (NEW badge, BETA)
   - [ ] Icon: Layers on gradient background
   - [ ] Title: "Remix a template"
   - [ ] Description: "Fill in and customize your structured content templates"

### Recent Prompts Section
- [ ] "Your recent prompts" heading
- [ ] List of previous prompts with timestamps
- [ ] Click to reuse prompt

---

## ✨ Phase 3: Generate Mode

### Header
- [ ] Back button (← Back)
- [ ] "Generate" large heading
- [ ] "What would you like to create today?" subheading

### Type Selector (4 buttons)
- [ ] Presentation (default selected, blue)
- [ ] Webpage
- [ ] Document
- [ ] Social

### Configuration Bar
- [ ] Slide count selector (- 10 cards +)
- [ ] Style dropdown (Default)
- [ ] Language dropdown (English US)

### Main Input
- [ ] Large textarea: "Describe what you'd like to make"
- [ ] Placeholder text
- [ ] Auto-resize as user types

### Example Prompts (6 cards)
- [ ] Icon + Title for each prompt
- [ ] "+ Add" button on hover
- [ ] Shuffle button at bottom
- [ ] Examples:
  - "Mentorship: a secret weapon for workplace diversity and inclusion initiatives"
  - "How to make sushi, a guide for beginners"
  - "Science fair project guidance"
  - "The most beautiful day hikes in the world"
  - "A guide to investing in real estate"
  - "Industrial revolution lesson"

---

## 📝 Phase 4: Paste in Text Mode

### Header
- [ ] Back button
- [ ] "Paste in text" heading with icon
- [ ] "What would you like to create?" subheading

### Type Selector
- [ ] Presentation / Webpage / Document / Social (radio buttons)
- [ ] Orientation dropdown (Portrait)

### Main Textarea
- [ ] Large input area
- [ ] Placeholder: "Type or paste in content here"
- [ ] Instructions: "Paste in the notes, outline or text content you'd like to use"

### Card-by-Card Control (Right sidebar)
- [ ] "Optional: card-by-card control" heading
- [ ] Instructions with example
- [ ] Shows how to use --- to separate slides
- [ ] Example content preview

### Action Options (Bottom)
- [ ] "What do you want to do with this content?" heading
- [ ] 3 radio options:
  1. Generate from notes or an outline
  2. Summarize long text or document
  3. Preserve this exact text

---

## 📤 Phase 5: Import Mode

### Header
- [ ] "Choose a template" heading
- [ ] "Select the workspace template you'd like to create from" subheading

### Template Selection
- [ ] Visual template cards (2 shown)
- [ ] "Add your first template" card
- [ ] Description: "Create once, reuse forever..."
- [ ] "+ Add a gamma" button

### Additional Info (Bottom)
- [ ] "Add from dashboard" section
- [ ] "Site templates" section (PLANNED badge)
- [ ] "Templates API support" section (PLANNED badge)
- [ ] "Share feedback" button

---

## 🎬 Phase 6: AI Chat Integration

### Chat Sidebar (Persistent)
- [ ] Appears on all creation pages
- [ ] Slides in from right side
- [ ] Collapsible with toggle button
- [ ] Chat history preserved

### Chat Features
- [ ] AI avatar and name
- [ ] User message bubbles (right-aligned)
- [ ] AI message bubbles (left-aligned)
- [ ] Typing indicator (animated dots)
- [ ] Suggested quick replies
- [ ] File upload in chat
- [ ] Image preview in chat

### AI Capabilities During Creation
- [ ] Asks clarifying questions
- [ ] Suggests improvements
- [ ] Explains design choices
- [ ] Offers alternatives
- [ ] Provides tips and tricks
- [ ] References user's brand guidelines

---

## 🖼️ Phase 7: Live Preview Panel

### Layout
- [ ] Split screen: Input (left) + Preview (right)
- [ ] Resizable divider
- [ ] Full-screen preview toggle

### Preview Features
- [ ] Real-time slide rendering
- [ ] Slide navigation (thumbnails)
- [ ] Zoom controls
- [ ] Play presentation mode
- [ ] Edit slide inline
- [ ] Add/remove slides

### Wow Moments
- [ ] Smooth slide transitions
- [ ] Loading animations (shimmer effect)
- [ ] Success celebrations (confetti)
- [ ] Progress indicators
- [ ] Before/after comparisons

---

## 🎨 Phase 8: SlideCoffee Branding

### Color Palette
- [ ] Primary: Coffee brown (#6B4423)
- [ ] Secondary: Cream (#F5E6D3)
- [ ] Accent: Espresso (#2C1810)
- [ ] AI Badge: Gradient blue (keep Gamma style)

### Typography
- [ ] Headings: Inter Bold
- [ ] Body: Inter Regular
- [ ] Monospace: JetBrains Mono (for code)

### Unique Touches
- [ ] Coffee cup icon in logo
- [ ] "Brewing your presentation..." loading text
- [ ] Coffee-themed empty states
- [ ] Warm, inviting tone in AI messages
- [ ] Coffee break tips in chat

---

## 🔌 Phase 9: Backend Integration

### API Endpoints
- [ ] POST /api/trpc/projects.create - Create from prompt
- [ ] POST /api/trpc/projects.paste - Create from pasted text
- [ ] POST /api/trpc/projects.import - Import file
- [ ] POST /api/trpc/projects.generate - AI generation
- [ ] GET /api/trpc/projects.preview - Live preview data
- [ ] POST /api/trpc/chat.send - AI chat messages

### Real-time Features
- [ ] WebSocket connection for live updates
- [ ] Server-sent events for AI streaming
- [ ] Optimistic UI updates
- [ ] Error recovery and retry logic

---

## ✅ Phase 10: Testing & Polish

### User Testing
- [ ] Test all 4 creation modes
- [ ] Test AI chat interactions
- [ ] Test live preview updates
- [ ] Test file imports
- [ ] Test brand consistency

### Performance
- [ ] Optimize image loading
- [ ] Lazy load components
- [ ] Cache API responses
- [ ] Minimize bundle size

### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Focus indicators
- [ ] ARIA labels

### Mobile Responsiveness
- [ ] Dashboard mobile view
- [ ] Creation modes on mobile
- [ ] Chat sidebar on mobile
- [ ] Preview panel on mobile

---

## 📊 Success Metrics

- [ ] User completes onboarding in < 2 minutes
- [ ] User creates first presentation in < 5 minutes
- [ ] 90%+ of users interact with AI chat
- [ ] Live preview loads in < 1 second
- [ ] Zero TypeScript errors
- [ ] Lighthouse score > 90

---

## 🚀 Deployment Checklist

- [ ] All features implemented
- [ ] All tests passing
- [ ] Performance optimized
- [ ] Accessibility verified
- [ ] Mobile responsive
- [ ] Error handling complete
- [ ] Loading states polished
- [ ] Animations smooth
- [ ] Brand guidelines followed
- [ ] User guide updated
- [ ] Checkpoint saved
- [ ] Ready for user review

---

**Estimated Timeline:** 10-12 hours of focused implementation
**Priority:** Start with Dashboard clone, then Create with AI page, then integrate AI chat

