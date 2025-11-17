# SlideCoffee Core Product Fixes - TODO

## CRITICAL: AI Personalization & Memory System

### Phase 1: Database Setup
- [ ] Enable pgvector extension in Supabase
- [ ] Create `memories` table with vector embeddings
- [ ] Create vector similarity index (ivfflat)
- [ ] Create metadata indexes (user_id, memory_type, created_at)
- [ ] Enable Row Level Security policies
- [ ] Create `knowledge_base` table (optional - for curated resources)

### Phase 2: Backend Services
- [ ] Create `EmbeddingService` class (OpenAI text-embedding-3-small)
- [ ] Create `VectorMemoryService` class with:
  - [ ] storeMemory() - Store user interactions as embeddings
  - [ ] searchMemories() - Semantic similarity search
  - [ ] getRecentMemories() - Time-based retrieval
  - [ ] hybridSearch() - Combine semantic + recency
  - [ ] extractInsights() - LLM-powered insight extraction
- [ ] Create `RAGService` class with:
  - [ ] generateResponse() - Memory-augmented AI responses
  - [ ] buildMemoryContext() - Format memories for LLM
- [ ] Create `KnowledgeBaseService` (optional)

### Phase 3: Integration
- [ ] Integrate memory system into chat flow
- [ ] Store every user interaction as memory
- [ ] Retrieve relevant memories before AI response
- [ ] Build personalized context for each response
- [ ] Track memory access patterns

---

## AI Agent Personality & Branding

### Agent Identity
- [ ] Name the AI agent (e.g., "Brew", "Bean", "Espresso")
- [ ] Add purple coffee logo/avatar for AI messages
- [ ] Create warm, supportive personality prompt
- [ ] Add "research partner" tone to system prompt

### Streaming Responses
- [ ] Implement SSE (Server-Sent Events) for streaming
- [ ] Add "thinking" indicator before response
- [ ] Show typing animation during streaming
- [ ] Display "Browsing pages..." when AI searches
- [ ] Stream markdown-formatted responses

### Message Formatting
- [ ] Parse markdown in AI responses (bold, lists, code blocks)
- [ ] Add syntax highlighting for code
- [ ] Format links properly
- [ ] Add proper spacing and typography

### Suggested Follow-ups
- [ ] Generate 3-4 suggested follow-up questions after each response
- [ ] Make suggestions clickable (auto-fill input)
- [ ] Base suggestions on conversation context
- [ ] Show suggestions in pill/chip UI

---

## Conversation Persistence

- [ ] Auto-save draft messages (debounced)
- [ ] Store conversation history in database
- [ ] Restore conversation when user returns
- [ ] Add "Continue where you left off" indicator
- [ ] Implement conversation threading/sessions

---

## AI Behavior Improvements

### Proactive Research
- [ ] AI should research topics autonomously
- [ ] Show "Researching..." indicator when AI searches
- [ ] Present findings with sources
- [ ] Ask clarifying questions AFTER initial research

### Guided Ideation
- [ ] When user asks open-ended question, AI suggests ideas first
- [ ] Provide 3-5 concrete suggestions
- [ ] Ask user to pick or refine
- [ ] Guide conversation toward actionable output

---

## UI/UX Fixes

### Brands Page
- [ ] Add "Create Brand" button (prominent CTA)
- [ ] Design brand creation modal/form:
  - [ ] Brand name input
  - [ ] Color picker (primary, secondary, accent)
  - [ ] Font selector (heading, body)
  - [ ] Logo upload
  - [ ] Guidelines textarea
- [ ] Show brand cards in grid layout
- [ ] Add edit/delete actions
- [ ] Empty state with illustration + CTA

### Projects Page
- [ ] Build projects list view
- [ ] Show project cards with:
  - [ ] Thumbnail/preview
  - [ ] Title
  - [ ] Last edited date
  - [ ] Status badge
- [ ] Add filters (All, Drafts, Completed, Archived)
- [ ] Add search functionality
- [ ] Empty state with "Create first project" CTA

### Recent & Favorites
- [ ] Recent: Show last 10 accessed presentations
- [ ] Favorites: Show starred presentations
- [ ] Add star/unstar functionality
- [ ] Same card layout as Projects
- [ ] Empty states for both

### Workspace Dropdown
- [ ] Add "Create Workspace" option in dropdown
- [ ] Create workspace modal:
  - [ ] Workspace name input
  - [ ] Optional description
  - [ ] Member invitation (optional)
- [ ] Show workspace switcher
- [ ] Display current workspace clearly

### Settings Page
- [ ] Redesign layout with proper tabs:
  - [ ] Profile (name, email, avatar)
  - [ ] Subscription (plan, credits, billing)
  - [ ] Team (workspace members, invitations)
  - [ ] Security (password, 2FA)
  - [ ] Notifications (email, push preferences)
- [ ] Add proper spacing and sections
- [ ] Make tabs sticky on scroll
- [ ] Add save indicators

### Dashboard AI Button
- [ ] Make AI button functional
- [ ] Open AI helper modal/panel
- [ ] Provide quick actions:
  - [ ] "Create presentation"
  - [ ] "Get inspiration"
  - [ ] "Ask a question"
- [ ] Or remove if not needed

---

## Slide Preview & Generation

### Live Slide Rendering
- [ ] Implement WebSocket connection for real-time updates
- [ ] Create slide preview component (HTML/CSS rendering)
- [ ] Show slides as they're generated
- [ ] Add slide thumbnails in sidebar
- [ ] Allow click-to-preview individual slides

### Slide Editor
- [ ] Build visual slide editor
- [ ] Allow text editing inline
- [ ] Add image upload/replacement
- [ ] Color/font customization
- [ ] Layout templates

### Export Functionality
- [ ] Export to PDF (high quality)
- [ ] Export to PPTX (PowerPoint)
- [ ] Export to Google Slides
- [ ] Download as images (PNG/JPG)

---

## Implementation Priority

### CRITICAL (Do First)
1. AI Memory System (Phases 1-3)
2. AI Agent Branding (name, logo, personality)
3. Streaming Responses
4. Conversation Persistence
5. Brands Page UI

### HIGH (Do Next)
6. Projects/Recent/Favorites Pages
7. Workspace Dropdown
8. Settings Redesign
9. Suggested Follow-ups
10. Slide Preview

### MEDIUM (After Core)
11. AI Proactive Research
12. Slide Editor
13. Export Functionality
14. Dashboard AI Button

---

## Technical Notes

### Environment Variables Needed
- `OPENAI_API_KEY` - For embeddings and LLM
- `VITE_SUPABASE_URL` - Already configured ✅
- `VITE_SUPABASE_ANON_KEY` - Already configured ✅

### Database Migrations
- Run pgvector setup SQL
- Create memories table
- Create indexes
- Set up RLS policies

### Cost Estimates
- Embedding: ~$0.00002 per memory
- Storage: ~1KB per memory
- For 10K users with 100 memories each = ~$20/month

---

## Testing Checklist

- [ ] Test memory storage and retrieval
- [ ] Verify semantic search returns relevant results
- [ ] Test streaming responses
- [ ] Verify conversation persistence
- [ ] Test all CRUD operations (brands, projects, workspaces)
- [ ] Test export functionality
- [ ] Mobile responsiveness
- [ ] Performance (load time, search speed)

