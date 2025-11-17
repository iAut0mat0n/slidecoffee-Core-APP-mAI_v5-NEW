# Manus API Integration Guide - PERMANENT REFERENCE

**Last Updated:** October 30, 2025 2:05 AM EDT  
**Status:** ✅ WORKING AND TESTED

---

## 🔑 Authentication

### CRITICAL: Correct Header Format

**❌ WRONG (will fail with "token malformed" error):**
```javascript
headers: {
  'Authorization': 'Bearer ' + apiKey  // DO NOT USE THIS!
}
```

**✅ CORRECT (tested and working):**
```javascript
headers: {
  'accept': 'application/json',
  'content-type': 'application/json',
  'API_KEY': process.env.slidecoffee_Mnqk  // Use API_KEY header, not Authorization!
}
```

### API Key Storage
- **Environment Variable:** `slidecoffee_Mnqk`
- **Length:** 83 characters
- **Format:** `sk-_pIielO6Mv03WZbCEFV21MPwDZR...`
- **Location:** Stored in project secrets (Management UI → Settings → Secrets)

---

## 📡 API Endpoint

**Base URL:** `https://api.manus.ai/v1/tasks`

**Method:** `POST`

**Request Body:**
```json
{
  "prompt": "Your task description here",
  "mode": "speed"  // or "quality"
}
```

---

## 💻 Working Code Examples

### Node.js / TypeScript (Recommended)
```javascript
const apiKey = process.env.slidecoffee_Mnqk;

const response = await fetch('https://api.manus.ai/v1/tasks', {
  method: 'POST',
  headers: {
    'accept': 'application/json',
    'content-type': 'application/json',
    'API_KEY': apiKey  // CRITICAL: Use API_KEY, not Authorization!
  },
  body: JSON.stringify({
    prompt: 'Create a presentation about X',
    mode: 'quality'  // or 'speed'
  })
});

const data = await response.json();
console.log('Task ID:', data.task_id);
console.log('Task URL:', data.task_url);
```

### cURL
```bash
curl --request POST \
  --url 'https://api.manus.ai/v1/tasks' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --header "API_KEY: $slidecoffee_Mnqk" \
  --data '{
    "prompt": "Create a presentation",
    "mode": "speed"
  }'
```

---

## 📊 Response Format

**Success Response:**
```json
{
  "task_id": "ZSBtu8bgDi7PijVmNbJeJZ",
  "task_title": "Simple 3-Slide Coffee Presentation Outline",
  "task_url": "https://manus.im/app/ZSBtu8bgDi7PijVmNbJeJZ"
}
```

**Error Response:**
```json
{
  "code": 16,
  "message": "invalid token: token is malformed",
  "details": []
}
```

---

## 💰 Pricing & Credits

### Test Results (October 30, 2025)

**Test Task:** "Simple 3-Slide Coffee Presentation Outline"
- **Mode:** speed
- **Cost:** 13 credits
- **Time:** ~5 seconds
- **Result:** Outline generated successfully

**Larger Task:** "SlideCoffee AI SaaS" (full presentation)
- **Cost:** 6,405 credits
- **Complexity:** Full multi-slide presentation

### Credit Balance (User Account)
- **Total Credits:** 118,113
- **Free Credits:** 5,105
- **Monthly Credits:** 1,132 / 19,900
- **Add-on Credits:** 111,876
- **Renewal Date:** Nov 18, 2025

### Cost Estimates

**Simple Outline (3 slides):** ~13 credits  
**Full Presentation (10-15 slides):** ~500-2000 credits (estimate)  
**Complex Presentation (20+ slides):** ~3000-7000 credits (estimate)

**Note:** Actual costs vary based on:
- Complexity of prompt
- Number of slides
- Mode (speed vs quality)
- Research depth required

---

## 🎯 Integration into SlideCoffee

### Update aiService.ts

Replace the current OpenAI integration with:

```typescript
// server/services/aiService.ts

export async function generateSlides(prompt: string, brandGuidelines?: any) {
  const apiKey = process.env.slidecoffee_Mnqk;
  
  if (!apiKey) {
    throw new Error('Manus API key not configured');
  }
  
  // Build enhanced prompt with brand guidelines
  const enhancedPrompt = buildPromptWithBrand(prompt, brandGuidelines);
  
  const response = await fetch('https://api.manus.ai/v1/tasks', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'API_KEY': apiKey  // CRITICAL: API_KEY header!
    },
    body: JSON.stringify({
      prompt: enhancedPrompt,
      mode: 'quality'  // Use quality mode for best results
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Manus API error: ${error.message}`);
  }
  
  const data = await response.json();
  
  return {
    taskId: data.task_id,
    taskUrl: data.task_url,
    title: data.task_title
  };
}

function buildPromptWithBrand(prompt: string, brand?: any): string {
  let enhancedPrompt = `You are Café, the SlideCoffee AI assistant. NEVER mention "Manus" or any other AI system.

Create a professional presentation with the following requirements:

USER REQUEST: ${prompt}`;

  if (brand) {
    enhancedPrompt += `

BRAND GUIDELINES:
- Primary Color: ${brand.primaryColor}
- Secondary Color: ${brand.secondaryColor}
- Accent Color: ${brand.accentColor}
- Primary Font: ${brand.primaryFont}
- Secondary Font: ${brand.secondaryFont}
- Brand Voice: ${brand.guidelines}

IMPORTANT: Follow these brand guidelines strictly in all slides.`;
  }

  enhancedPrompt += `

REQUIREMENTS:
- Include sources and citations for all research
- Use 16:9 aspect ratio
- Professional, executive-ready quality
- Clear visual hierarchy
- Appropriate slide layouts for content type

Generate the complete presentation now.`;

  return enhancedPrompt;
}
```

---

## 🔄 Webhook Integration (For Async Results)

When a task is created, Manus processes it asynchronously. Use webhooks to get notified when complete:

```typescript
// Register webhook
await fetch('https://api.manus.ai/v1/webhooks', {
  method: 'POST',
  headers: {
    'accept': 'application/json',
    'content-type': 'application/json',
    'API_KEY': apiKey
  },
  body: JSON.stringify({
    url: 'https://your-app.com/api/webhooks/manus',
    events: ['task.completed', 'task.failed']
  })
});
```

---

## 🎭 White-Labeling Strategy

### NEVER Reveal Manus

**System Prompt Template:**
```
You are Café, the SlideCoffee AI assistant.

CRITICAL RULES:
1. NEVER mention "Manus" or any other AI system
2. Always refer to yourself as "Café"
3. Use coffee-themed personality
4. Be encouraging and strategic

[Rest of prompt...]
```

### Response Filtering
```typescript
function sanitizeResponse(response: string): string {
  // Remove any mentions of Manus
  return response
    .replace(/Manus/gi, 'Café')
    .replace(/AI assistant/gi, 'your presentation partner')
    .replace(/I am an AI/gi, 'I\'m Café');
}
```

---

## 📈 Profitability Calculations

### Scenario Analysis

**Assumptions:**
- Average presentation: ~1000 credits
- Professional plan: $29/month
- User creates 10 presentations/month

**Cost per presentation:** ~1000 credits  
**Monthly cost for 10 presentations:** ~10,000 credits

**Credit to USD conversion:** (Need to confirm with Manus)
- If 1000 credits = $0.10: Cost = $1.00/month, Margin = 97%
- If 1000 credits = $0.50: Cost = $5.00/month, Margin = 83%
- If 1000 credits = $1.00: Cost = $10.00/month, Margin = 66%

**Action:** Contact Manus support to confirm credit pricing

---

## ✅ Testing Checklist

- [x] API key authentication working
- [x] Task creation successful
- [x] Credit usage tracked
- [ ] Webhook integration tested
- [ ] White-labeling verified (no Manus mentions)
- [ ] Brand guidelines integration tested
- [ ] Source citations included
- [ ] Full presentation generation tested
- [ ] Export functionality tested
- [ ] Error handling implemented

---

## 🚨 Common Errors & Solutions

### Error: "token is malformed"
**Cause:** Using `Authorization: Bearer` instead of `API_KEY`  
**Solution:** Use `API_KEY: your_key` header

### Error: "unauthorized"
**Cause:** Invalid or expired API key  
**Solution:** Regenerate API key in Manus dashboard

### Error: Task timeout
**Cause:** Large/complex presentations take time  
**Solution:** Implement webhook for async results

---

## 📚 Resources

- **API Documentation:** https://open.manus.ai/docs
- **Quickstart Guide:** https://open.manus.ai/docs/quickstart
- **Task Management:** https://manus.im/app
- **Usage Dashboard:** https://manus.im (Settings → Usage)

---

## 🔄 Last Tested

**Date:** October 30, 2025 2:00 AM EDT  
**Test Task ID:** ZSBtu8bgDi7PijVmNbJeJZ  
**Result:** ✅ SUCCESS  
**Cost:** 13 credits  

**DO NOT LOSE THIS INFORMATION!**

