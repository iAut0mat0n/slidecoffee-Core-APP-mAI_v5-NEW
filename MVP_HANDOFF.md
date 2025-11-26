# SlideCoffee MVP - Greenfield Development Guide

## What We're Building

**SlideCoffee** is an AI-powered presentation generator. Users chat with an AI agent called "Brew" to create professional slide decks. The AI researches topics, creates outlines, and generates slides in real-time.

**One Sentence:** "Describe what you want, watch your presentation appear."

---

## Core MVP Features (Build These Only)

### 1. AI Agent Chat Interface (PRIMARY FEATURE)
A conversational UI where users interact with "Brew" - the AI presentation partner.

**User Flow:**
1. User types: "Create a pitch deck for my AI startup"
2. AI responds conversationally, asks clarifying questions
3. User confirms direction
4. AI researches the topic (shows sources)
5. AI creates outline (user can edit)
6. AI generates slides one-by-one with real-time streaming
7. User views/edits the finished presentation

**Key UI Components:**
- Chat message list (user messages + AI responses)
- Text input with send button
- Task progress indicator (Research → Outline → Generate → Complete)
- Live preview panel showing slides as they generate
- Source citations from research

### 2. Slide Generation Engine
Real-time streaming slide generation using Server-Sent Events (SSE).

**Generation Phases:**
1. **Research** - Search the web for topic information
2. **Outline** - Create slide structure with titles and key points
3. **Generate** - Create each slide with full content
4. **Save** - Store presentation in database

### 3. Presentation Viewer
Simple viewer to display generated presentations.

**Features:**
- Slide navigation (prev/next)
- Slide thumbnails
- Full-screen mode
- Export to PowerPoint (.pptx)

### 4. Basic Auth & Workspace
- Email/password login (use Supabase Auth)
- User has one workspace
- Workspace contains presentations

---

## AI Integration (Critical)

### Primary: Claude API (Anthropic)
**Model:** `claude-3-5-haiku-20241022` (fast, cost-effective for presentations)

```javascript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Generate outline
const response = await anthropic.messages.create({
  model: 'claude-3-5-haiku-20241022',
  max_tokens: 2000,
  temperature: 0.7,
  messages: [{
    role: 'user',
    content: `Create a presentation outline for: "${topic}"
    
Return JSON with this structure:
{
  "title": "Presentation Title",
  "summary": "Brief description",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Slide Title",
      "type": "title",
      "keyPoints": ["Main point"]
    }
  ]
}`
  }]
});
```

### Alternative: Manus API (OpenAI-compatible)
For chat conversations or if Claude is unavailable.

```javascript
const MANUS_API_URL = process.env.BUILT_IN_FORGE_API_URL;
const MANUS_API_KEY = process.env.BUILT_IN_FORGE_API_KEY;

const response = await fetch(`${MANUS_API_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${MANUS_API_KEY}`
  },
  body: JSON.stringify({
    model: 'gemini-2.0-flash-exp',
    messages: [
      { role: 'system', content: systemPrompt },
      ...userMessages
    ],
    temperature: 0.7,
    max_tokens: 1000
  })
});
```

### AI Provider Configuration
Store in database for easy switching:
```javascript
// v2_ai_settings table
{
  provider: 'claude-haiku', // or 'manus', 'claude-sonnet', 'gpt-4'
  model: 'claude-3-5-haiku-20241022',
  apiUrl: 'https://api.anthropic.com',
  apiKey: process.env.ANTHROPIC_API_KEY
}
```

---

## Tech Stack (Recommended)

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Query** - Server state
- **React Router** - Navigation
- **Lucide React** - Icons
- **Sonner** - Toast notifications

### Backend
- **Node.js + Express** - API server
- **Drizzle ORM** - Database queries
- **PostgreSQL** - Database (Replit built-in)

### External Services
- **Supabase** - Authentication only
- **Anthropic** - AI (Claude API)
- **Manus/Forge** - Alternative AI (built into Replit)

---

## Color Scheme

```css
/* Primary - Purple */
--primary: #7C3AED;
--primary-hover: #6D28D9;
--primary-light: #EDE9FE;

/* Backgrounds */
--bg-primary: #FFFFFF;
--bg-secondary: #F9FAFB;

/* Text */
--text-primary: #111827;
--text-secondary: #6B7280;

/* Borders */
--border: #E5E7EB;

/* Status */
--success: #10B981;
--error: #EF4444;
```

---

## Database Schema (Minimal)

```sql
-- Users (synced from Supabase Auth)
CREATE TABLE v2_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspaces
CREATE TABLE v2_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES v2_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Presentations
CREATE TABLE v2_presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES v2_workspaces(id),
  title TEXT NOT NULL,
  slides_json JSONB, -- Array of slide objects
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Outline Drafts (intermediate state during generation)
CREATE TABLE v2_outline_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES v2_workspaces(id),
  topic TEXT NOT NULL,
  outline_json JSONB,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints to Build

### Authentication
```
GET  /api/auth/me          → Get current user
POST /api/auth/logout      → Logout
```

### Presentations
```
GET  /api/presentations         → List user's presentations
POST /api/presentations         → Create presentation
GET  /api/presentations/:id     → Get single presentation
PUT  /api/presentations/:id     → Update presentation
```

### AI Generation (SSE Streaming)
```
POST /api/generate-slides-stream
Body: { topic: string, enableResearch: boolean }
Response: Server-Sent Events stream

Events emitted:
- start
- research_start
- research_source (url, title, snippet)
- research_complete
- outline_start
- outline_complete (outline JSON)
- slide_start
- slide_generated (slide data, progress %)
- slides_complete
- complete (presentation ID)
- error
```

### AI Chat (Conversational)
```
POST /api/ai-chat-stream
Body: { messages: Array<{role, content}> }
Response: SSE stream of chat tokens
```

---

## Key Files to Create

```
/
├── src/
│   ├── App.tsx                    # Routes
│   ├── pages/
│   │   ├── Login.tsx              # Auth
│   │   ├── Dashboard.tsx          # Home
│   │   ├── AIAgentCreate.tsx      # Main AI chat interface
│   │   └── PresentationView.tsx   # View slides
│   ├── components/
│   │   ├── Sidebar.tsx            # Navigation
│   │   ├── ChatMessage.tsx        # AI chat bubbles
│   │   ├── SlidePreview.tsx       # Live slide preview
│   │   └── TaskProgress.tsx       # Generation progress
│   ├── lib/
│   │   ├── api-client.ts          # API helpers
│   │   └── api-slides-stream.ts   # SSE client
│   └── contexts/
│       └── AuthContext.tsx        # Auth state
│
├── server/
│   ├── index.ts                   # Express server
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── presentations.ts
│   │   └── generate-slides-stream.ts  # AI generation
│   ├── middleware/
│   │   └── auth.ts                # JWT validation
│   └── services/
│       └── web-search.ts          # Research functionality
│
└── shared/
    └── schema.ts                  # Drizzle schema
```

---

## AI Agent Personality

**Name:** Brew  
**Tagline:** "Crafting presentations, one slide at a time ☕"

**Personality:**
- Warm and encouraging (like a supportive colleague)
- Coffee-themed personality
- Proactive - suggests ideas, asks clarifying questions
- Expert in presentation design and storytelling

**System Prompt:**
```
You are Brew, an AI presentation partner for SlideCoffee. You're warm, supportive, and genuinely excited to help users create amazing presentations.

Your Approach:
1. Listen First - Understand what the user wants
2. Research Actively - Gather insights on the topic
3. Suggest Ideas - Provide concrete suggestions
4. Ask Smart Questions - Help refine ideas
5. Guide to Action - Move toward creating slides

When users ask to create a presentation:
1. Acknowledge their request enthusiastically
2. Ask 1-2 clarifying questions if needed
3. Begin research and outline generation
4. Stream slides as they're created
```

---

## Intent Detection (Important)

Not every message should trigger slide generation. Detect intent:

```javascript
function isCreationIntent(message) {
  const lower = message.toLowerCase();
  
  const actionVerbs = ['create', 'make', 'build', 'generate', 'design', 'prepare', 'draft'];
  const presentationNouns = ['presentation', 'slides', 'deck', 'pitch', 'proposal', 'report'];
  
  const hasAction = actionVerbs.some(v => lower.includes(v));
  const hasPresentation = presentationNouns.some(n => lower.includes(n));
  
  return hasAction && hasPresentation;
}

// "hello" → conversational chat
// "create a sales deck" → trigger slide generation
```

---

## PowerPoint Export

Use `pptxgenjs` library to generate .pptx files:

```javascript
import pptxgen from 'pptxgenjs';

function generatePPTX(presentation) {
  const pptx = new pptxgen();
  
  presentation.slides.forEach(slide => {
    const pptSlide = pptx.addSlide();
    pptSlide.addText(slide.title, { x: 0.5, y: 0.5, fontSize: 24, bold: true });
    
    slide.content.points.forEach((point, i) => {
      pptSlide.addText(point, { x: 0.5, y: 1.5 + (i * 0.5), fontSize: 14 });
    });
  });
  
  return pptx.write('blob');
}
```

---

## Environment Variables

```bash
# Database (auto-provided by Replit)
DATABASE_URL=

# Supabase Auth
SUPABASE_URL=
SUPABASE_ANON_KEY=

# AI - Primary
ANTHROPIC_API_KEY=

# AI - Alternative (Replit built-in)
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
```

---

## MVP Success Criteria

1. **User can sign up/login** with email
2. **User can chat** with AI agent naturally
3. **AI researches topics** and shows sources
4. **AI generates outlines** user can review
5. **Slides stream in real-time** as they're created
6. **Presentations are saved** and viewable later
7. **Export to PowerPoint** works

---

## What NOT to Build for MVP

- ❌ Teams/collaboration
- ❌ Brand management
- ❌ Theme/template library
- ❌ Payment/subscriptions
- ❌ Admin panel
- ❌ Real-time editing
- ❌ Version history
- ❌ Comments/annotations

Focus entirely on the AI → Slides pipeline. Everything else comes later.

---

## Getting Started

1. Set up React + Vite frontend
2. Set up Express backend
3. Configure Supabase Auth
4. Add Anthropic API key
5. Create database tables
6. Build the AI chat interface
7. Implement SSE slide generation
8. Add presentation viewer
9. Add PowerPoint export

**The entire MVP should be buildable in 2-3 weeks by one developer.**

---

*Document created: November 26, 2025*
