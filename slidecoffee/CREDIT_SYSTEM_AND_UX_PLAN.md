# SlideCoffee Credit System & UX Redesign Plan

**Created:** October 30, 2025 2:15 AM EDT  
**Status:** Awaiting M&A presentation cost data

---

## 🎯 Waiting For: M&A Presentation Cost

**Test Task Created:**
- **Task ID:** kpPNGCt54F7LWuzC9C69Bg
- **Title:** "M&A Acquisition Pitch Deck for TechVault and DataShield"
- **URL:** https://manus.im/app/kpPNGCt54F7LWuzC9C69Bg
- **Complexity:** 10 slides, board-level, quality mode
- **Purpose:** Measure real-world presentation cost

**Action Required:** Check usage dashboard for credit cost after task completes

---

## 💳 Credit System Options

### Option 1: Simple Credit Packages (RECOMMENDED) ⭐

**Why This Works:**
- Users understand credits (like Manus, OpenAI, etc.)
- Transparent and predictable
- Easy to explain
- Prevents abuse naturally
- Encourages upgrades

**Implementation:**

**Starter Plan (Free)**
- 100 credits/month
- ~5-10 presentations (depending on complexity)
- 1 brand
- When depleted: Upgrade prompt

**Professional Plan ($29/month)**
- 1,000 credits/month
- ~50-100 presentations
- 5 brands
- Top-up available: $10 for 500 credits

**Enterprise Plan ($99/month)**
- 5,000 credits/month
- ~250-500 presentations
- Unlimited brands
- Top-up available: $25 for 2,000 credits

**Credit Costs (Estimated):**
- Simple outline (3 slides): ~10-20 credits
- Standard presentation (10 slides): ~50-150 credits
- Complex presentation (20+ slides): ~200-500 credits
- Research-heavy deck: ~300-1000 credits

**UI Elements:**
```
┌─────────────────────────────────┐
│  Credits: 847 / 1,000           │
│  ████████████░░░░░  85%         │
│  Resets in 12 days              │
│  [Top Up Credits]               │
└─────────────────────────────────┘
```

### Option 2: Unlimited with Fair Use

**Pros:**
- Simple messaging ("unlimited presentations")
- No credit tracking needed
- Feels premium

**Cons:**
- Hard to prevent abuse
- Unpredictable costs for you
- Need rate limiting
- Can't upsell top-ups

**Verdict:** ❌ Too risky until we know exact costs

### Option 3: Presentation Count Limits

**Example:**
- Starter: 10 presentations/month
- Professional: 50 presentations/month
- Enterprise: Unlimited

**Pros:**
- Easy to understand
- Simple to implement

**Cons:**
- Doesn't account for complexity
- User creates 50 simple decks vs 10 complex ones
- Less flexible
- Can't top up mid-month

**Verdict:** ⚠️ Too rigid, doesn't reflect actual costs

---

## 🎨 UX Redesign: Manus-Inspired Homepage

### Current State
- Traditional landing page
- Separate dashboard after login
- Multiple clicks to start creating

### New Design (Inspired by Manus)

**Homepage (Before Login):**
```
┌─────────────────────────────────────────────────┐
│                                                 │
│    The Action Engine that delivers              │
│    [presentations] for you.                     │
│         ↑                                       │
│    (animated rotation: presentations,           │
│     pitch decks, board reports, proposals)      │
│                                                 │
│    ┌──────────────────────────────────────┐   │
│    │ Describe the presentation you want   │   │
│    │ to create...                         │   │
│    └──────────────────────────────────────┘   │
│                                                 │
│         [Get Started]  [Watch Demo]             │
│                                                 │
└─────────────────────────────────────────────────┘
```

**After Typing & Clicking "Get Started":**

Smooth animation transforms into:

```
┌──────────┬────────────────────────┬──────────────┐
│          │                        │              │
│  TASKS   │       CHAT             │   PREVIEW    │
│          │                        │              │
│ ☕ New   │  Café: Great! Let's    │  [Empty]     │
│          │  brew up an amazing    │              │
│ Recent:  │  presentation...       │  Slides will │
│ • M&A    │                        │  appear here │
│ • Sales  │  First, tell me:       │  as we build │
│ • QBR    │  Who's your audience?  │              │
│          │                        │              │
│          │  [Your response...]    │              │
│          │                        │              │
└──────────┴────────────────────────┴──────────────┘
```

**Key UX Elements:**

1. **Animated Hero Text**
   - Rotating words: presentations, pitch decks, proposals, reports
   - Smooth fade transitions
   - Draws attention to versatility

2. **Center Input → Transforms**
   - Start with large center input
   - Animate to left sidebar chat
   - Feels magical and intentional

3. **Three-Panel Layout**
   - Left: Task list (collapsible)
   - Center: Chat with Café
   - Right: Live preview

4. **Real-Time Preview**
   - Slides appear as they're generated
   - User sees progress
   - Can click to edit individual slides

5. **Credit Indicator (Always Visible)**
   ```
   ┌──────────────────────┐
   │ ☕ 847 credits left  │
   │ ████████████░░  85%  │
   └──────────────────────┘
   ```

---

## 🔐 Abuse Prevention System

### Rate Limiting
```typescript
// Per user limits
const LIMITS = {
  starter: {
    maxCreditsPerDay: 50,
    maxPresentationsPerHour: 3,
    maxSlidesPerPresentation: 20
  },
  professional: {
    maxCreditsPerDay: 200,
    maxPresentationsPerHour: 10,
    maxSlidesPerPresentation: 50
  },
  enterprise: {
    maxCreditsPerDay: 1000,
    maxPresentationsPerHour: 50,
    maxSlidesPerPresentation: 100
  }
};
```

### Credit Deduction Logic
```typescript
async function deductCredits(userId: number, slideCount: number, complexity: string) {
  // Base cost
  let cost = slideCount * 10; // 10 credits per slide base
  
  // Complexity multiplier
  if (complexity === 'research-heavy') cost *= 2;
  if (complexity === 'data-visualization') cost *= 1.5;
  
  // Check balance
  const user = await getUser(userId);
  if (user.credits < cost) {
    throw new Error('INSUFFICIENT_CREDITS');
  }
  
  // Deduct
  await updateUserCredits(userId, user.credits - cost);
  
  // Log usage
  await logCreditUsage(userId, cost, 'presentation_generation');
  
  return { cost, remaining: user.credits - cost };
}
```

### Low Credit Warnings
```typescript
// Warn at 20% remaining
if (user.credits < user.monthlyAllocation * 0.2) {
  showToast('⚠️ Running low on credits! Top up to keep creating.');
}

// Block at 0
if (user.credits <= 0) {
  showUpgradeDialog({
    title: 'Out of Credits',
    message: 'You\'ve used all your monthly credits.',
    options: ['Top Up', 'Upgrade Plan', 'Wait for Reset']
  });
}
```

---

## 📊 Credit Usage Dashboard

**User-Facing Analytics:**
```
┌─────────────────────────────────────┐
│  Credit Usage This Month            │
│                                     │
│  Used: 153 / 1,000 (15%)           │
│  ████░░░░░░░░░░░░░░░░░░░░░░        │
│                                     │
│  Breakdown:                         │
│  • Presentations: 8 (120 credits)  │
│  • Outlines: 3 (33 credits)        │
│                                     │
│  Top Presentations:                 │
│  1. M&A Board Deck - 45 credits    │
│  2. Sales Pitch - 28 credits       │
│  3. QBR Slides - 22 credits        │
│                                     │
│  [View Detailed History]            │
└─────────────────────────────────────┘
```

---

## 🚀 Implementation Plan

### Phase 1: Get Cost Data (NOW)
- [x] Test simple outline (13 credits)
- [ ] Test complex presentation (waiting for M&A deck)
- [ ] Calculate average costs
- [ ] Set credit allocations per tier

### Phase 2: Credit System Backend
- [ ] Add `credits` column to users table
- [ ] Add `monthlyCredits` and `creditResetDate`
- [ ] Create credit deduction function
- [ ] Add credit usage logging
- [ ] Implement rate limiting
- [ ] Add low-credit warnings

### Phase 3: UX Redesign
- [ ] Redesign homepage with animated hero
- [ ] Build center-to-sidebar animation
- [ ] Implement three-panel layout
- [ ] Add credit indicator to UI
- [ ] Create top-up flow
- [ ] Build credit usage dashboard

### Phase 4: Manus API Integration
- [ ] Replace OpenAI with Manus API
- [ ] Implement white-labeling (Café identity)
- [ ] Add webhook handling for async results
- [ ] Parse and display sources
- [ ] Test end-to-end flow

### Phase 5: Testing & Launch
- [ ] Beta test with 10 users
- [ ] Monitor credit usage patterns
- [ ] Adjust pricing if needed
- [ ] Launch publicly

---

## 💰 Pricing Model (Final)

**Once we have M&A deck cost data, finalize:**

**Starter (Free)**
- X credits/month
- 1 brand
- Community support

**Professional ($29/month)**
- Y credits/month
- 5 brands
- Priority support
- Top-up: $10 for Z credits

**Enterprise ($99/month)**
- W credits/month
- Unlimited brands
- Dedicated support
- Top-up: $25 for V credits

**Target Margins:** 80-90%

---

## 🎯 Success Metrics

**User Engagement:**
- Average presentations per user
- Credit utilization rate
- Top-up conversion rate
- Upgrade rate (Starter → Pro → Enterprise)

**Business Metrics:**
- Cost per presentation
- Gross margin per tier
- Customer acquisition cost (CAC)
- Lifetime value (LTV)

**Target KPIs:**
- 70%+ credit utilization
- 15%+ top-up rate
- 10%+ upgrade rate
- 85%+ gross margin

---

## ✅ Next Steps

1. **Wait for M&A deck to complete** (check task URL)
2. **Check credit cost** in usage dashboard
3. **Calculate pricing model** based on real data
4. **Implement credit system** in backend
5. **Redesign homepage** with Manus-inspired UX
6. **Integrate Manus API** with white-labeling
7. **Launch beta** with 10 users

**Status:** ⏳ Waiting for M&A presentation cost data

**Task URL:** https://manus.im/app/kpPNGCt54F7LWuzC9C69Bg

