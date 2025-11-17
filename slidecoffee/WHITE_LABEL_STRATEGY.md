# SlideCoffee White-Label & Context Strategy

**Date:** October 29, 2025  
**Critical Requirements:** Brand identity, context persistence, source citations

---

## 1. White-Labeling: Never Reveal Manus

### The Challenge
We're using Manus API as our backend, but users should NEVER know this. They should think they're talking to "SlideCoffee AI" or whatever we name our assistant.

### Solution Strategy

#### **Option A: System Prompts (Recommended)**
When calling Manus API, prepend our own system instructions:

```typescript
const prompt = `
You are SlideCoffee AI, an expert presentation strategist and designer.
You work exclusively for SlideCoffee, a premium presentation creation platform.

CRITICAL RULES:
- NEVER mention "Manus" or any other AI system
- Always refer to yourself as "SlideCoffee AI" or "I'm here to help you with SlideCoffee"
- If asked about your identity, say: "I'm SlideCoffee's AI assistant, designed to help you create strategic presentations"
- Do not reveal technical details about your underlying architecture
- Maintain the SlideCoffee brand voice: professional, strategic, encouraging

USER REQUEST:
${userMessage}

BRAND GUIDELINES (if provided):
${brandGuidelines}
`;
```

#### **Option B: Response Filtering**
After receiving Manus response, filter out any mentions:

```typescript
function sanitizeResponse(response: string): string {
  return response
    .replace(/Manus/gi, 'SlideCoffee')
    .replace(/I am an AI assistant/gi, 'I am SlideCoffee AI')
    .replace(/powered by .+/gi, '')
    // Add more patterns as needed
}
```

#### **Option C: Hybrid Approach (BEST)**
Combine both:
1. Use system prompts to set identity
2. Filter responses as backup
3. Log any leaks for monitoring

```typescript
async function callManusAPI(userMessage: string, context: Context) {
  // 1. Prepend system instructions
  const fullPrompt = buildSlideCoffeePrompt(userMessage, context);
  
  // 2. Call Manus API
  const response = await manusAPI.createTask({
    prompt: fullPrompt,
    mode: 'quality'
  });
  
  // 3. Sanitize response
  const sanitized = sanitizeResponse(response.content);
  
  // 4. Monitor for leaks
  if (detectBrandLeak(response.content)) {
    logWarning('Brand leak detected', { original: response.content });
  }
  
  return sanitized;
}
```

### Our AI Identity

**Name Options:**
1. **SlideCoffee AI** (simple, clear)
2. **Café** (friendly, memorable - "Hi, I'm Café, your presentation assistant")
3. **Barista** (playful - "Let me brew up a great presentation for you")
4. **Roast** (edgy - "I'm Roast, and I'll help you create fire presentations")
5. **Bean** (cute - "I'm Bean, your creative presentation partner")

**Recommended: "Café"**
- Short, memorable
- Ties to SlideCoffee brand
- Friendly and approachable
- Easy to say and type
- "Hi, I'm Café! ☕ Let's create something amazing together."

### Brand Voice Guidelines

**Café's Personality:**
- **Professional but friendly** - Like a skilled barista who knows their craft
- **Encouraging** - "This is looking great!" "You're on the right track!"
- **Strategic** - Asks thoughtful questions, provides context
- **Patient** - Never rushes the user
- **Coffee-themed** - Subtle references ("Let me brew this up", "Percolating ideas", "Fresh from the grinder")

**Example Messages:**
```
❌ Bad: "I am Manus, an AI assistant..."
✅ Good: "I'm Café, your SlideCoffee AI! ☕"

❌ Bad: "Manus will now generate your slides..."
✅ Good: "Brewing up your slides now... grab a coffee! ☕"

❌ Bad: "Powered by Manus AI"
✅ Good: "Crafted with SlideCoffee AI"
```

---

## 2. Context Persistence & Sandbox Resets

### The Challenge
If Manus API has "sandbox resets" (like we do), how do we maintain conversation context?

### Understanding the Problem

**What Happens in a Reset:**
- Manus API might lose conversation history
- User's context disappears
- Previous decisions forgotten
- Feels like starting over

**What We Need:**
- Continuous conversation memory
- Remember brand guidelines
- Recall previous slide decisions
- Seamless experience even if backend resets

### Solution: We Store Context Locally

**Key Insight:** We don't rely on Manus to remember anything. We store ALL context in our database and send it with each request.

#### **Database Schema (Already Have This!)**
```typescript
// projects table
{
  id: number;
  title: string;
  description: string;
  brandId: number;  // ← Brand guidelines
  slidesData: json;  // ← Current slides
  planData: json;    // ← Approved plan
}

// chatMessages table
{
  id: number;
  projectId: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// brands table
{
  id: number;
  name: string;
  colors: json;
  fonts: json;
  guidelines: text;  // ← Full brand voice
}
```

#### **Context Building Strategy**

```typescript
async function buildContextForManusAPI(projectId: number) {
  // 1. Get project details
  const project = await db.getProject(projectId);
  
  // 2. Get brand guidelines
  const brand = project.brandId 
    ? await db.getBrand(project.brandId)
    : null;
  
  // 3. Get conversation history (last 10 messages)
  const messages = await db.getChatMessages(projectId, { limit: 10 });
  
  // 4. Get current plan (if exists)
  const plan = await db.getProjectPlan(projectId);
  
  // 5. Build comprehensive context
  return {
    projectTitle: project.title,
    projectDescription: project.description,
    brandGuidelines: brand ? formatBrandGuidelines(brand) : null,
    conversationHistory: formatMessages(messages),
    currentPlan: plan,
    currentSlides: project.slidesData,
  };
}

function formatBrandGuidelines(brand: Brand): string {
  return `
BRAND: ${brand.name}
COLORS: Primary: ${brand.colors.primary}, Secondary: ${brand.colors.secondary}, Accent: ${brand.colors.accent}
FONTS: Primary: ${brand.fonts.primary}, Secondary: ${brand.fonts.secondary}
VOICE & TONE: ${brand.guidelines}
  `.trim();
}

function formatMessages(messages: ChatMessage[]): string {
  return messages.map(m => 
    `${m.role === 'user' ? 'User' : 'Café'}: ${m.content}`
  ).join('\n');
}
```

#### **Every API Call Includes Full Context**

```typescript
async function sendMessageToManus(projectId: number, userMessage: string) {
  // 1. Build context from our database
  const context = await buildContextForManusAPI(projectId);
  
  // 2. Create comprehensive prompt
  const fullPrompt = `
You are Café, the SlideCoffee AI assistant. You are helping create a presentation.

PROJECT CONTEXT:
Title: ${context.projectTitle}
Description: ${context.projectDescription}

${context.brandGuidelines ? `BRAND GUIDELINES:\n${context.brandGuidelines}\n` : ''}

${context.currentPlan ? `APPROVED PLAN:\n${JSON.stringify(context.currentPlan, null, 2)}\n` : ''}

${context.currentSlides ? `CURRENT SLIDES:\n${context.currentSlides.length} slides created\n` : ''}

CONVERSATION HISTORY:
${context.conversationHistory}

NEW USER MESSAGE:
${userMessage}

Remember:
- You are Café, the SlideCoffee AI
- Never mention Manus or other AI systems
- Reference the brand guidelines when designing
- Be encouraging and strategic
- Provide sources for any research data
`;

  // 3. Call Manus API
  const response = await manusAPI.createTask({
    prompt: fullPrompt,
    mode: 'quality'
  });
  
  // 4. Save to our database
  await db.saveChatMessage({
    projectId,
    role: 'user',
    content: userMessage
  });
  
  await db.saveChatMessage({
    projectId,
    role: 'assistant',
    content: response.content
  });
  
  return response;
}
```

### Result: Bulletproof Context

**Even if Manus API resets:**
- ✅ We have full conversation history in our DB
- ✅ We resend context with every request
- ✅ User never notices any disruption
- ✅ Seamless experience

**Bonus Benefits:**
- ✅ We can show conversation history in UI
- ✅ We can export conversations
- ✅ We can analyze user patterns
- ✅ We control the data

---

## 3. Source Citations & Research Links

### The Challenge
When Manus does research, we need to show sources so users can verify information and add credibility.

### Solution Strategy

#### **Option A: Request Sources in Prompt**

```typescript
const prompt = `
${basePrompt}

IMPORTANT: When providing data, statistics, or facts, ALWAYS include:
1. The source name
2. A direct link (URL) to the source
3. The date of the information

Format sources like this:
"According to [Source Name](URL), [fact/statistic]."

Example:
"The presentation software market is valued at $2.3B (Gartner, 2024: https://gartner.com/report)"
`;
```

#### **Option B: Structured Response Format**

Request Manus to return structured data:

```typescript
const prompt = `
${basePrompt}

Return your response in this JSON format:
{
  "message": "Your response to the user",
  "slides": [...],
  "sources": [
    {
      "title": "Source title",
      "url": "https://...",
      "date": "2024-10-29",
      "relevance": "What this source was used for"
    }
  ]
}
`;
```

#### **Option C: Post-Processing (If Manus Provides Sources)**

If Manus API returns sources in response:

```typescript
interface ManusResponse {
  content: string;
  slides: Slide[];
  sources?: Source[];  // ← Check if Manus provides this
}

// Display sources in UI
function displaySources(sources: Source[]) {
  return (
    <div className="sources-section">
      <h3>📚 Research Sources</h3>
      {sources.map(source => (
        <div key={source.url} className="source-card">
          <a href={source.url} target="_blank">
            {source.title}
          </a>
          <span className="source-date">{source.date}</span>
        </div>
      ))}
    </div>
  );
}
```

### UI Design for Sources

**In Chat Interface:**
```
Café: Based on my research, the AI presentation market is growing rapidly.

📊 Key Finding:
"The market is expected to reach $2.3B by 2025"

📚 Source: Gartner Market Analysis 2024
🔗 https://gartner.com/ai-presentation-market
📅 Published: Oct 2024
```

**In Slide Preview:**
```
[Slide Content]

Sources:
• Gartner Market Analysis 2024
• McKinsey Digital Trends Report 2024
• TechCrunch AI Survey 2024
```

**In Exported Presentations:**
- Add "Sources" slide at the end
- Include all citations
- Formatted professionally

---

## 4. Implementation Checklist

### White-Labeling
- [ ] Create `Café` AI identity and personality guidelines
- [ ] Implement system prompt with SlideCoffee branding
- [ ] Add response sanitization filter
- [ ] Set up brand leak monitoring
- [ ] Update all UI text to reference "Café" not "AI"
- [ ] Add coffee-themed personality touches
- [ ] Test that Manus is never mentioned

### Context Persistence
- [ ] Implement `buildContextForManusAPI()` function
- [ ] Store all messages in database (already done)
- [ ] Send full context with every API call
- [ ] Test conversation continuity
- [ ] Add conversation history UI
- [ ] Implement context summarization (for long conversations)

### Source Citations
- [ ] Add source request to system prompt
- [ ] Parse sources from Manus response
- [ ] Store sources in database
- [ ] Display sources in chat UI
- [ ] Add sources section to slide preview
- [ ] Include sources in exported presentations
- [ ] Format sources professionally

---

## 5. Testing Plan

### White-Label Testing
1. Ask AI "Who are you?" → Should say "Café" or "SlideCoffee AI"
2. Ask "What powers you?" → Should NOT mention Manus
3. Check all responses for brand leaks
4. Verify personality is consistent

### Context Testing
1. Start conversation, create plan
2. Close browser, reopen
3. Continue conversation → Should remember everything
4. Simulate API reset → Should still work
5. Test with 50+ message conversation

### Source Testing
1. Request data-driven slides
2. Verify sources are provided
3. Check links are valid
4. Test source display in UI
5. Verify sources in exported PPTX

---

## 6. Monitoring & Maintenance

### Brand Leak Detection
```typescript
function detectBrandLeak(text: string): boolean {
  const forbiddenTerms = [
    /manus/i,
    /powered by (?!SlideCoffee)/i,
    /I am an AI/i,
    /language model/i,
  ];
  
  return forbiddenTerms.some(pattern => pattern.test(text));
}

// Log all leaks
if (detectBrandLeak(response)) {
  await db.logBrandLeak({
    projectId,
    response,
    timestamp: new Date(),
    severity: 'high'
  });
  
  // Alert team
  await notifyOwner({
    title: 'Brand Leak Detected',
    content: `Manus mentioned in response: ${response.substring(0, 100)}...`
  });
}
```

### Source Quality Monitoring
```typescript
function validateSources(sources: Source[]): boolean {
  return sources.every(source => 
    source.url && 
    source.url.startsWith('http') &&
    source.title &&
    source.date
  );
}
```

---

## 7. Fallback Strategies

### If Manus Doesn't Support Custom Identity
- **Fallback:** Always filter responses
- **Risk:** Occasional leaks
- **Mitigation:** Heavy filtering + monitoring

### If Context Gets Too Long
- **Fallback:** Summarize old messages
- **Implementation:** Keep last 10 messages + summary of older ones
- **Example:** "Earlier in this conversation, we discussed creating a pitch deck for a SaaS product..."

### If Sources Not Provided
- **Fallback:** Add disclaimer
- **UI:** "This presentation includes research-based content. For specific citations, please verify key facts independently."
- **Future:** Add manual source addition feature

---

## 8. Competitive Advantage

**Why This Matters:**

1. **Trust** - Sources build credibility
2. **Professionalism** - Proper citations show quality
3. **Brand Consistency** - Users trust "SlideCoffee AI", not generic AI
4. **Reliability** - Context persistence makes it feel intelligent
5. **Transparency** - Showing research sources differentiates us

**What Competitors Don't Do:**
- Beautiful.ai: No source citations
- Gamma: Generic AI identity
- Tome: Limited context memory

**What We Do Better:**
- ✅ Named AI assistant (Café)
- ✅ Full context persistence
- ✅ Source citations on every slide
- ✅ Consistent brand voice
- ✅ Professional quality

---

## Next Steps

1. **Test Manus API** - See what it actually returns
2. **Implement Café identity** - System prompts + filtering
3. **Build context system** - Already have DB, just need to use it
4. **Add source handling** - Parse and display
5. **Test thoroughly** - No brand leaks!
6. **Launch with confidence** 🚀

---

**Questions to Answer (Once We Have API Key):**

1. Does Manus response include sources automatically?
2. Can we customize the AI identity via API parameters?
3. What's the token limit for context?
4. How does Manus handle long conversations?
5. Can we request specific response formats (JSON)?


