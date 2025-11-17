# Manus Sandbox Persistence Architecture

**Last Updated:** October 30, 2025 3:20 AM EDT  
**Purpose:** Ensure user presentations persist across Manus sandbox resets

---

## 🎯 The Problem

**Issue:** Each Manus API call creates a NEW task, not continuing an existing one.

**Current Behavior:**
- User creates presentation → Task ID: ABC123
- User edits presentation → Task ID: XYZ789 (NEW task!)
- Sandbox resets → All files lost

**Required Behavior:**
- User creates presentation → Task ID: ABC123
- User edits presentation → SAME Task ID: ABC123
- Sandbox resets → Files migrated automatically by Manus

---

## 🏗️ Architecture Overview

### Core Principle: **We Store Everything in OUR Database**

**Manus is a SERVICE, not our STORAGE.**

```
┌─────────────────────────────────────────────────────────┐
│                    SlideCoffee Platform                  │
│                                                          │
│  ┌──────────────┐      ┌──────────────┐                │
│  │   Frontend   │      │   Backend    │                │
│  │   (React)    │◄────►│   (tRPC)     │                │
│  └──────────────┘      └──────┬───────┘                │
│                               │                          │
│                               ▼                          │
│                    ┌──────────────────┐                 │
│                    │   PostgreSQL DB  │                 │
│                    │                  │                 │
│                    │  - presentations │                 │
│                    │  - slides        │                 │
│                    │  - chat_history  │                 │
│                    │  - manus_tasks   │                 │
│                    └──────────────────┘                 │
│                               │                          │
│                               │ (API calls only)         │
│                               ▼                          │
│                    ┌──────────────────┐                 │
│                    │   Manus API      │                 │
│                    │                  │                 │
│                    │  - Generate      │                 │
│                    │  - Return HTML   │                 │
│                    │  - We save it    │                 │
│                    └──────────────────┘                 │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema (New Tables)

### 1. **presentations** (Already exists as `projects`)
```sql
-- Rename `projects` to `presentations` for clarity
ALTER TABLE projects RENAME TO presentations;

-- Add Manus-specific fields
ALTER TABLE presentations ADD COLUMN manus_task_id VARCHAR(255);
ALTER TABLE presentations ADD COLUMN manus_version_id VARCHAR(255);
ALTER TABLE presentations ADD COLUMN outline_json TEXT; -- Store approved outline
ALTER TABLE presentations ADD COLUMN generation_status VARCHAR(50); -- 'draft', 'generating', 'completed', 'failed'
```

### 2. **slides** (NEW)
```sql
CREATE TABLE slides (
  id SERIAL PRIMARY KEY,
  presentation_id INT NOT NULL REFERENCES presentations(id) ON DELETE CASCADE,
  slide_number INT NOT NULL,
  slide_id VARCHAR(255) NOT NULL, -- e.g., "intro", "problem_statement"
  title VARCHAR(500) NOT NULL,
  content_html TEXT, -- Full HTML content of slide
  thumbnail_url VARCHAR(1000), -- Screenshot for preview
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'generating', 'completed', 'failed'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(presentation_id, slide_number)
);

CREATE INDEX idx_slides_presentation ON slides(presentation_id);
```

### 3. **manus_tasks** (NEW - Track API calls)
```sql
CREATE TABLE manus_tasks (
  id SERIAL PRIMARY KEY,
  presentation_id INT NOT NULL REFERENCES presentations(id) ON DELETE CASCADE,
  task_id VARCHAR(255) NOT NULL, -- Manus task ID
  task_type VARCHAR(50) NOT NULL, -- 'outline', 'slide_generation', 'edit'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  request_payload TEXT, -- JSON of what we sent
  response_payload TEXT, -- JSON of what we got back
  credits_used INT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_manus_tasks_presentation ON manus_tasks(presentation_id);
CREATE INDEX idx_manus_tasks_task_id ON manus_tasks(task_id);
```

### 4. **chat_messages** (Already exists - Add context field)
```sql
ALTER TABLE chat_messages ADD COLUMN context_summary TEXT; -- Summary for Manus context
```

---

## 🔄 Data Flow: User Creates Presentation

### Step 1: User Sends Message
```typescript
// Frontend
const { mutate: sendMessage } = trpc.chat.sendMessage.useMutation();

sendMessage({
  projectId: 123,
  message: "Create a 10-slide M&A pitch deck for TechVault acquiring DataShield"
});
```

### Step 2: Backend Calls Manus API
```typescript
// server/routers/chat.ts
sendMessage: protectedProcedure
  .input(z.object({
    projectId: z.number(),
    message: z.string()
  }))
  .mutation(async ({ ctx, input }) => {
    // 1. Save user message to database
    const userMessage = await db.insert(chatMessages).values({
      projectId: input.projectId,
      role: 'user',
      content: input.message,
      userId: ctx.user.id
    });

    // 2. Get full conversation history from database
    const history = await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.projectId, input.projectId))
      .orderBy(chatMessages.createdAt);

    // 3. Get brand guidelines from database
    const project = await db.select()
      .from(presentations)
      .where(eq(presentations.id, input.projectId))
      .leftJoin(brands, eq(presentations.brandId, brands.id));

    // 4. Build context for Manus
    const context = buildManusContext(history, project.brand);

    // 5. Call Manus API
    const response = await fetch('https://api.manus.ai/v1/tasks', {
      method: 'POST',
      headers: {
        'API_KEY': process.env.SLIDECOFFEE_MANUS_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: buildCafePrompt(input.message, context),
        // NO webhook - we poll instead
      })
    });

    const { task_id } = await response.json();

    // 6. Save Manus task to database
    await db.insert(manusTasks).values({
      presentationId: input.projectId,
      taskId: task_id,
      taskType: 'outline',
      status: 'running',
      requestPayload: JSON.stringify({ message: input.message, context })
    });

    // 7. Poll for completion (async)
    pollManusTask(task_id, input.projectId);

    // 8. Return optimistic response
    return {
      message: "Café is working on your presentation...",
      taskId: task_id
    };
  })
```

### Step 3: Poll Manus Task
```typescript
async function pollManusTask(taskId: string, presentationId: number) {
  const maxAttempts = 60; // 5 minutes (5s intervals)
  let attempts = 0;

  const interval = setInterval(async () => {
    attempts++;

    // Check Manus task status
    const response = await fetch(`https://api.manus.ai/v1/tasks/${taskId}`, {
      headers: { 'API_KEY': process.env.SLIDECOFFEE_MANUS_KEY }
    });

    const task = await response.json();

    if (task.status === 'completed') {
      clearInterval(interval);

      // Extract outline from task result
      const outline = parseManusOutline(task.result);

      // Save outline to database
      await db.update(presentations)
        .set({
          outlineJson: JSON.stringify(outline),
          generationStatus: 'outline_ready',
          manusTaskId: taskId
        })
        .where(eq(presentations.id, presentationId));

      // Update manus_tasks
      await db.update(manusTasks)
        .set({
          status: 'completed',
          responsePayload: JSON.stringify(task.result),
          creditsUsed: task.credits_used,
          completedAt: new Date()
        })
        .where(eq(manusTasks.taskId, taskId));

      // Notify frontend via WebSocket or polling
      notifyFrontend(presentationId, 'outline_ready');

    } else if (task.status === 'failed' || attempts >= maxAttempts) {
      clearInterval(interval);

      await db.update(manusTasks)
        .set({
          status: 'failed',
          responsePayload: JSON.stringify(task.error)
        })
        .where(eq(manusTasks.taskId, taskId));

      notifyFrontend(presentationId, 'generation_failed');
    }
  }, 5000); // Poll every 5 seconds
}
```

### Step 4: User Approves Outline
```typescript
// Frontend
const { mutate: approveOutline } = trpc.chat.approveOutline.useMutation();

approveOutline({ projectId: 123 });
```

### Step 5: Backend Generates Slides
```typescript
// server/routers/chat.ts
approveOutline: protectedProcedure
  .input(z.object({ projectId: z.number() }))
  .mutation(async ({ ctx, input }) => {
    // 1. Get outline from database
    const project = await db.select()
      .from(presentations)
      .where(eq(presentations.id, input.projectId));

    const outline = JSON.parse(project.outlineJson);

    // 2. Create slide records in database
    for (let i = 0; i < outline.slides.length; i++) {
      await db.insert(slides).values({
        presentationId: input.projectId,
        slideNumber: i + 1,
        slideId: outline.slides[i].id,
        title: outline.slides[i].title,
        status: 'pending'
      });
    }

    // 3. Call Manus API to generate full presentation
    const response = await fetch('https://api.manus.ai/v1/tasks', {
      method: 'POST',
      headers: {
        'API_KEY': process.env.SLIDECOFFEE_MANUS_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: buildSlideGenerationPrompt(outline, project.brand),
      })
    });

    const { task_id } = await response.json();

    // 4. Save task to database
    await db.insert(manusTasks).values({
      presentationId: input.projectId,
      taskId: task_id,
      taskType: 'slide_generation',
      status: 'running'
    });

    // 5. Poll for completion
    pollSlideGeneration(task_id, input.projectId);

    return { taskId: task_id };
  })
```

### Step 6: Save Generated Slides
```typescript
async function pollSlideGeneration(taskId: string, presentationId: number) {
  // Similar polling logic...

  if (task.status === 'completed') {
    // Extract HTML for each slide
    const slidesHtml = parseManusSlides(task.result);

    // Save each slide to database
    for (const slide of slidesHtml) {
      await db.update(slides)
        .set({
          contentHtml: slide.html,
          thumbnailUrl: slide.thumbnail, // If Manus provides
          status: 'completed'
        })
        .where(and(
          eq(slides.presentationId, presentationId),
          eq(slides.slideId, slide.id)
        ));
    }

    // Update presentation status
    await db.update(presentations)
      .set({
        generationStatus: 'completed',
        manusVersionId: task.version_id
      })
      .where(eq(presentations.id, presentationId));
  }
}
```

---

## 🔄 Data Flow: User Edits Slide

### Step 1: User Requests Edit
```typescript
// Frontend
const { mutate: editSlide } = trpc.chat.editSlide.useMutation();

editSlide({
  projectId: 123,
  slideNumber: 3,
  instruction: "Add more details about the financial projections"
});
```

### Step 2: Backend Calls Manus API
```typescript
// server/routers/chat.ts
editSlide: protectedProcedure
  .input(z.object({
    projectId: z.number(),
    slideNumber: z.number(),
    instruction: z.string()
  }))
  .mutation(async ({ ctx, input }) => {
    // 1. Get current slide from database
    const slide = await db.select()
      .from(slides)
      .where(and(
        eq(slides.presentationId, input.projectId),
        eq(slides.slideNumber, input.slideNumber)
      ));

    // 2. Get full context
    const history = await getConversationHistory(input.projectId);
    const brand = await getBrandGuidelines(input.projectId);

    // 3. Call Manus API with edit instruction
    const response = await fetch('https://api.manus.ai/v1/tasks', {
      method: 'POST',
      headers: {
        'API_KEY': process.env.SLIDECOFFEE_MANUS_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: buildEditPrompt(slide, input.instruction, history, brand),
      })
    });

    const { task_id } = await response.json();

    // 4. Save task
    await db.insert(manusTasks).values({
      presentationId: input.projectId,
      taskId: task_id,
      taskType: 'edit',
      status: 'running'
    });

    // 5. Poll and update slide when done
    pollSlideEdit(task_id, input.projectId, input.slideNumber);

    return { taskId: task_id };
  })
```

---

## 🛡️ Handling Sandbox Resets

### The Key Insight: **Manus Handles File Migration**

From Manus documentation:
> "When a sandbox hibernates and resumes, Manus automatically migrates files to the new sandbox."

**What this means for us:**
- We DON'T need to worry about file persistence
- Manus will handle it
- BUT we still need to store everything in our database as backup

### Our Strategy: **Database as Source of Truth**

```typescript
// If Manus sandbox resets, we can regenerate everything from our database

async function regeneratePresentation(presentationId: number) {
  // 1. Get presentation from database
  const presentation = await db.select()
    .from(presentations)
    .where(eq(presentations.id, presentationId));

  // 2. Get all slides from database
  const slides = await db.select()
    .from(slides)
    .where(eq(slides.presentationId, presentationId))
    .orderBy(slides.slideNumber);

  // 3. If we have HTML, we're good!
  if (slides.every(s => s.contentHtml)) {
    return {
      status: 'ready',
      slides: slides.map(s => s.contentHtml)
    };
  }

  // 4. If not, regenerate from Manus
  // (This should rarely happen since we save everything)
  const taskId = presentation.manusTaskId;
  if (taskId) {
    // Fetch from Manus task history
    const task = await fetchManusTask(taskId);
    return parseAndSaveSlides(task, presentationId);
  }

  // 5. Worst case: regenerate from scratch
  return regenerateFromOutline(presentation);
}
```

---

## 🔑 User Identification in Manus

### Problem: How does Manus know which user owns which task?

**Answer: It doesn't need to!**

**We track the relationship in OUR database:**

```sql
manus_tasks table:
- id: 1
- presentation_id: 123 (links to presentations table)
- task_id: "kpPNGCt54F7LWuzC9C69Bg" (Manus task ID)
- user_id: 456 (our user ID)

presentations table:
- id: 123
- user_id: 456
- workspace_id: 789
- manus_task_id: "kpPNGCt54F7LWuzC9C69Bg"
```

**When user logs in:**
1. Frontend requests: "Get my presentations"
2. Backend queries: `SELECT * FROM presentations WHERE user_id = 456`
3. Backend returns presentations with their Manus task IDs
4. If user clicks "View", we fetch from our database (not Manus)

**Manus is stateless from our perspective.**  
**We maintain all state in our database.**

---

## 📦 Context Management

### Problem: Manus sandbox resets lose conversation context

**Solution: Send full context with EVERY API call**

```typescript
function buildManusContext(
  chatHistory: ChatMessage[],
  brand: Brand,
  presentation: Presentation
): string {
  return `
# SlideCoffee Context (DO NOT SHARE WITH USER)

## Brand Guidelines
- Name: ${brand.name}
- Colors: ${brand.colors}
- Fonts: ${brand.fonts}
- Tone: ${brand.tone}
- Logo: ${brand.logoUrl}

## Presentation Details
- Title: ${presentation.title}
- Type: ${presentation.type}
- Target Audience: ${presentation.audience}
- Current Status: ${presentation.generationStatus}

## Conversation History (Last 10 messages)
${chatHistory.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n')}

## Current Outline
${presentation.outlineJson ? JSON.parse(presentation.outlineJson) : 'Not yet created'}

## Instructions for Café AI
- You are Café, the SlideCoffee AI assistant
- NEVER mention "Manus" - users think you're Café
- Use brand guidelines for all slides
- Maintain conversation context
- Be encouraging and strategic
`;
}
```

**This context is sent with EVERY Manus API call.**  
**Even if sandbox resets, we rebuild context from database.**

---

## ✅ Implementation Checklist

### Phase 1: Database Schema
- [ ] Rename `projects` to `presentations`
- [ ] Add `manus_task_id`, `manus_version_id`, `outline_json`, `generation_status` to presentations
- [ ] Create `slides` table
- [ ] Create `manus_tasks` table
- [ ] Add `context_summary` to `chat_messages`

### Phase 2: Manus Integration
- [ ] Create `buildManusContext()` function
- [ ] Create `buildCafePrompt()` function (white-labeling)
- [ ] Implement `callManusAPI()` wrapper
- [ ] Implement `pollManusTask()` function
- [ ] Implement `parseManusOutline()` function
- [ ] Implement `parseManusSlides()` function

### Phase 3: Data Persistence
- [ ] Save all chat messages to database
- [ ] Save all Manus tasks to database
- [ ] Save all slide HTML to database
- [ ] Save all outlines to database
- [ ] Implement `regeneratePresentation()` fallback

### Phase 4: Frontend Updates
- [ ] Poll for task completion (or WebSocket)
- [ ] Display slides from database (not Manus)
- [ ] Handle loading states
- [ ] Handle error states

### Phase 5: Testing
- [ ] Test full flow: create → approve → generate
- [ ] Test edit flow
- [ ] Test sandbox reset recovery
- [ ] Test context persistence

---

## 🎯 Key Takeaways

1. **Database is source of truth** - Store everything
2. **Manus is a service** - Not our storage
3. **Send context with every call** - Bulletproof against resets
4. **Track task IDs** - Link Manus tasks to our users
5. **Poll for completion** - No webhooks needed
6. **Save HTML immediately** - Don't rely on Manus files

**This architecture ensures zero data loss, even with sandbox resets!** 🛡️

