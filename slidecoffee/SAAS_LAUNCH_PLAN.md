# SlideCoffee SaaS Launch Plan

**Last Updated:** October 30, 2025 3:30 AM EDT  
**Target Launch:** 3 weeks from now (November 20, 2025)  
**Goal:** 10 paying users in first month

---

## 🎯 Launch Strategy Overview

**Phase 1:** Technical Implementation (Week 1)  
**Phase 2:** Beta Testing (Week 2)  
**Phase 3:** Public Launch (Week 3)  
**Phase 4:** Growth & Acquisition (Ongoing)

---

## 📅 Week 1: Technical Implementation (Nov 1-7)

### Day 1-2: Pricing & Team Features

#### Update Database Schema
- [ ] Add `subscription_tier` to users table ('starter', 'pro', 'pro_plus', 'team', 'business', 'enterprise')
- [ ] Add `credits_remaining` to users table (INT)
- [ ] Add `credits_used_this_month` to users table (INT)
- [ ] Add `billing_cycle_start` to users table (TIMESTAMP)
- [ ] Add `stripe_customer_id` to users table (VARCHAR)
- [ ] Add `stripe_subscription_id` to users table (VARCHAR)

#### Create New Tables
- [ ] Create `workspaces` table (id, name, owner_id, created_at)
- [ ] Create `workspace_members` table (workspace_id, user_id, role, credits_allocated)
- [ ] Create `credit_transactions` table (user_id, amount, type, description, created_at)
- [ ] Create `pii_tokens` table (presentation_id, token, token_type, original_value_encrypted)
- [ ] Create `slides` table (presentation_id, slide_number, slide_id, title, content_html, status)
- [ ] Create `manus_tasks` table (presentation_id, task_id, task_type, status, credits_used)

#### Update Existing Tables
- [ ] Rename `projects` to `presentations`
- [ ] Add `workspace_id` to presentations table
- [ ] Add `manus_task_id`, `manus_version_id`, `outline_json`, `generation_status` to presentations
- [ ] Add `original_content` (encrypted) to chat_messages

#### Backend Implementation
- [ ] Create `server/lib/credits.ts` - Credit management functions
- [ ] Create `server/lib/pii.ts` - PII anonymization functions
- [ ] Create `server/lib/encryption.ts` - Encryption/decryption functions
- [ ] Create `server/lib/manus.ts` - Manus API wrapper
- [ ] Update `server/routers/chat.ts` - Integrate Manus API
- [ ] Create `server/routers/workspace.ts` - Workspace management
- [ ] Create `server/routers/subscription.ts` - Subscription management
- [ ] Create `server/routers/billing.ts` - Stripe integration

#### Frontend Implementation
- [ ] Create `app/routes/pricing.tsx` - Pricing page
- [ ] Create `app/routes/workspaces.tsx` - Workspace management
- [ ] Create `app/routes/workspaces.$id.tsx` - Workspace detail page
- [ ] Create `app/routes/settings.subscription.tsx` - Subscription settings
- [ ] Create `app/routes/settings.billing.tsx` - Billing history
- [ ] Update `app/routes/dashboard.tsx` - Show credit balance
- [ ] Update `app/routes/projects.$id.chat.tsx` - Show credit usage per message
- [ ] Create `app/components/CreditIndicator.tsx` - Credit balance widget
- [ ] Create `app/components/UpgradeDialog.tsx` - Upgrade prompt when out of credits

---

### Day 3-4: Manus API Integration

#### Context Management
- [ ] Implement `buildManusContext()` - Build context from chat history + brand
- [ ] Implement `buildCafePrompt()` - White-label as Café
- [ ] Implement `anonymizeContext()` - Anonymize PII in context

#### API Integration
- [ ] Implement `callManusAPI()` - Wrapper for Manus API calls
- [ ] Implement `pollManusTask()` - Poll for task completion
- [ ] Implement `parseManusOutline()` - Extract outline from response
- [ ] Implement `parseManusSlides()` - Extract slides from response
- [ ] Implement credit deduction logic
- [ ] Implement error handling (out of credits, API failures)

#### Data Persistence
- [ ] Save all Manus tasks to `manus_tasks` table
- [ ] Save all slides to `slides` table
- [ ] Save all outlines to presentations table
- [ ] Implement `regeneratePresentation()` - Fallback for sandbox resets

#### Testing
- [ ] Test outline generation
- [ ] Test slide generation
- [ ] Test edit flow
- [ ] Test credit deduction
- [ ] Test out-of-credits handling
- [ ] Test sandbox reset recovery

---

### Day 5-6: PII Anonymization

#### Detection
- [ ] Install `node-nlp` for Named Entity Recognition
- [ ] Implement regex patterns (email, phone, SSN, address, etc.)
- [ ] Implement `detectPII()` function
- [ ] Test with sample data

#### Anonymization
- [ ] Implement `anonymizeText()` function
- [ ] Implement `deanonymizeText()` function
- [ ] Implement encryption/decryption functions
- [ ] Generate and store encryption key in environment
- [ ] Test round-trip (anonymize → deanonymize)

#### Integration
- [ ] Update `sendMessage` to anonymize before Manus call
- [ ] Update `getMessages` to deanonymize before display
- [ ] Update `buildContext` to use anonymized data
- [ ] Test full flow with PII

---

### Day 7: Stripe Integration

#### Setup
- [ ] Create Stripe account (use separate account for SlideCoffee)
- [ ] Set up products in Stripe:
  - [ ] Pro - $18/month
  - [ ] Pro Plus - $35/month
  - [ ] Team - $35/seat/month
  - [ ] Business - $60/seat/month
- [ ] Set up webhooks for subscription events
- [ ] Add Stripe keys to environment variables

#### Backend
- [ ] Install `stripe` npm package
- [ ] Create `server/lib/stripe.ts` - Stripe helper functions
- [ ] Implement `createCheckoutSession()` - Start subscription
- [ ] Implement `handleWebhook()` - Process Stripe events
- [ ] Implement `cancelSubscription()` - Cancel subscription
- [ ] Implement `updateSubscription()` - Change plan

#### Frontend
- [ ] Create checkout flow
- [ ] Create subscription management page
- [ ] Create billing history page
- [ ] Add "Upgrade" buttons throughout app

---

## 📅 Week 2: Beta Testing (Nov 8-14)

### Day 8-9: Polish & Bug Fixes

#### UI/UX Polish
- [ ] Add loading states for Manus API calls
- [ ] Add progress indicators for slide generation
- [ ] Add error messages for failures
- [ ] Add success animations (confetti!)
- [ ] Add credit usage indicators
- [ ] Add "low credits" warnings
- [ ] Improve mobile responsiveness

#### Bug Fixes
- [ ] Fix any issues from Week 1 implementation
- [ ] Test all user flows end-to-end
- [ ] Fix edge cases
- [ ] Performance optimization

---

### Day 10-11: Beta User Recruitment

#### Identify Beta Users (Target: 20 users)
- [ ] **Personal Network (10 users)**
  - [ ] Reach out to friends who create presentations
  - [ ] Reach out to former colleagues
  - [ ] Post in personal LinkedIn
  - [ ] Post in personal Twitter/X
  
- [ ] **Professional Network (5 users)**
  - [ ] Post in relevant Slack communities
  - [ ] Post in relevant Discord servers
  - [ ] Reach out to consultants on LinkedIn
  - [ ] Reach out to startup founders
  
- [ ] **Reddit/Communities (5 users)**
  - [ ] Post in r/entrepreneur
  - [ ] Post in r/startups
  - [ ] Post in r/consulting
  - [ ] Post in r/SideProject

#### Beta Invitation Email Template
```
Subject: You're invited to beta test SlideCoffee 🎉

Hi [Name],

I'm launching SlideCoffee - an AI-powered presentation platform that creates strategic, board-ready slide decks through a conversational interface.

Instead of fighting with PowerPoint templates, you chat with Café (our AI agent) who researches, strategizes, and designs your presentations.

**Beta Perks:**
- Free Enterprise access for 1 month ($99 value)
- Unlimited presentations
- Priority support
- Your feedback shapes the product

**What I need from you:**
- Create 2-3 presentations
- 15-minute feedback call
- Honest opinions (brutal honesty welcome!)

Interested? Reply and I'll send you early access.

Thanks!
[Your Name]

P.S. Here's a sample deck Café created: [Link to partner demo]
```

---

### Day 12-14: Beta Testing & Feedback

#### Onboarding Beta Users
- [ ] Send personalized invites
- [ ] Schedule onboarding calls (15 min each)
- [ ] Give them tasks:
  - [ ] Create a pitch deck
  - [ ] Create a sales presentation
  - [ ] Create a board update
- [ ] Monitor usage in real-time

#### Collect Feedback
- [ ] Schedule feedback calls (15 min each)
- [ ] Send feedback survey
- [ ] Track metrics:
  - [ ] Time to first presentation
  - [ ] Presentations per user
  - [ ] Credits used per presentation
  - [ ] Drop-off points
  - [ ] Feature requests
  - [ ] Bug reports

#### Iterate Based on Feedback
- [ ] Fix critical bugs
- [ ] Implement quick wins
- [ ] Prioritize feature requests
- [ ] Update pricing if needed

---

## 📅 Week 3: Public Launch (Nov 15-21)

### Day 15-16: Launch Preparation

#### Marketing Assets
- [ ] **Landing Page Optimization**
  - [ ] Compelling hero section
  - [ ] Demo video (2 min)
  - [ ] Social proof (beta testimonials)
  - [ ] Pricing comparison table
  - [ ] FAQ section
  - [ ] Trust badges (SOC 2, GDPR)

- [ ] **Product Hunt Launch**
  - [ ] Create Product Hunt listing
  - [ ] Write compelling description
  - [ ] Upload screenshots
  - [ ] Upload demo video
  - [ ] Schedule launch date

- [ ] **Social Media**
  - [ ] Create Twitter/X account
  - [ ] Create LinkedIn company page
  - [ ] Prepare launch posts
  - [ ] Prepare demo videos
  - [ ] Prepare screenshots

#### Content Creation
- [ ] Write launch blog post
- [ ] Create demo videos:
  - [ ] 2-minute product overview
  - [ ] 5-minute deep dive
  - [ ] Use case videos (pitch deck, sales, board update)
- [ ] Create comparison content:
  - [ ] SlideCoffee vs Beautiful.ai
  - [ ] SlideCoffee vs Gamma
  - [ ] SlideCoffee vs PowerPoint

---

### Day 17: Launch Day! 🚀

#### Morning (9 AM EST)
- [ ] Post on Product Hunt
- [ ] Post on Twitter/X
- [ ] Post on LinkedIn
- [ ] Post on Reddit (r/SideProject, r/entrepreneur)
- [ ] Post on Hacker News
- [ ] Email beta users asking for upvotes

#### Throughout Day
- [ ] Respond to comments on Product Hunt
- [ ] Respond to social media comments
- [ ] Monitor signups in real-time
- [ ] Fix any issues immediately
- [ ] Celebrate wins!

#### Evening (6 PM EST)
- [ ] Post update on social media
- [ ] Thank everyone who supported
- [ ] Share metrics (if impressive)

---

### Day 18-21: Post-Launch Growth

#### Engagement
- [ ] Email all new signups personally
- [ ] Offer onboarding calls
- [ ] Ask for feedback
- [ ] Monitor usage

#### Content Marketing
- [ ] Publish launch blog post
- [ ] Share on social media
- [ ] Submit to startup directories
- [ ] Reach out to tech bloggers

#### Community Building
- [ ] Create Discord server
- [ ] Create Facebook group
- [ ] Engage with users
- [ ] Share tips and tricks

---

## 📅 Month 1: Growth & Acquisition (Nov 22 - Dec 22)

### Week 4: SEO & Content

#### SEO Optimization
- [ ] Keyword research (AI presentation, pitch deck generator, etc.)
- [ ] Optimize landing page for keywords
- [ ] Create blog content:
  - [ ] "How to Create a Pitch Deck in 10 Minutes"
  - [ ] "The Ultimate Guide to M&A Presentations"
  - [ ] "Board Presentation Best Practices"
  - [ ] "SlideCoffee vs [Competitor] Comparison"
- [ ] Build backlinks
- [ ] Submit to startup directories

#### Content Marketing
- [ ] Post on LinkedIn (3x/week)
- [ ] Post on Twitter (daily)
- [ ] Create YouTube tutorials
- [ ] Guest post on relevant blogs

---

### Week 5-6: Paid Acquisition (If Needed)

#### Google Ads
- [ ] Set up Google Ads account
- [ ] Create campaigns:
  - [ ] "AI presentation software"
  - [ ] "pitch deck generator"
  - [ ] "business presentation tool"
- [ ] Budget: $500/month to start
- [ ] Track conversions

#### Facebook/LinkedIn Ads
- [ ] Target: Consultants, startup founders, sales professionals
- [ ] Creative: Demo videos, testimonials
- [ ] Budget: $500/month to start
- [ ] A/B test creatives

---

### Week 7-8: Partnerships & Outreach

#### Strategic Partnerships
- [ ] Reach out to accelerators (Y Combinator, Techstars)
- [ ] Reach out to consulting firms
- [ ] Reach out to design agencies
- [ ] Offer white-label partnerships

#### Influencer Outreach
- [ ] Identify business influencers on LinkedIn
- [ ] Offer free accounts in exchange for reviews
- [ ] Ask for testimonials
- [ ] Co-create content

---

## 🎯 Success Metrics

### Week 1 (Beta)
- [ ] 20 beta users signed up
- [ ] 15 active users (75% activation)
- [ ] 30+ presentations created
- [ ] 5+ testimonials collected
- [ ] <5 critical bugs

### Week 2 (Launch)
- [ ] 100+ signups on launch day
- [ ] Top 5 on Product Hunt
- [ ] 50+ upvotes on Product Hunt
- [ ] 1,000+ landing page visits
- [ ] 10+ paying users

### Month 1 (Growth)
- [ ] 500+ total signups
- [ ] 50+ paying users ($1,500+ MRR)
- [ ] 200+ presentations created
- [ ] <2% churn rate
- [ ] 4.5+ star rating (reviews)

---

## 💰 Budget (Month 1)

### Essential Costs
- [ ] Domain: $12/year
- [ ] Hosting: $50/month (already covered)
- [ ] Stripe fees: ~3% of revenue
- [ ] Manus API: ~$200/month (based on usage)
- [ ] **Total: ~$262/month**

### Optional Marketing Costs
- [ ] Google Ads: $500/month
- [ ] Facebook/LinkedIn Ads: $500/month
- [ ] Content creation: $200/month
- [ ] **Total: ~$1,200/month**

### Breakeven
- [ ] Need 15 Pro users ($18 × 15 = $270/month) to cover essential costs
- [ ] Need 70 Pro users ($18 × 70 = $1,260/month) to cover all costs

---

## 🚨 Risk Mitigation

### Technical Risks
- [ ] **Manus API downtime** → Cache responses, show graceful errors
- [ ] **High API costs** → Implement aggressive rate limiting
- [ ] **Sandbox resets** → Database as source of truth (already architected)
- [ ] **Security breach** → Encryption, regular audits, bug bounty program

### Business Risks
- [ ] **No users** → Free tier + aggressive marketing
- [ ] **High churn** → Improve onboarding, add value
- [ ] **Competitor copies** → Move fast, build moat (brand, community)
- [ ] **Pricing too high** → A/B test pricing, offer discounts

---

## 📞 Getting First 10 Paying Users - Detailed Playbook

### Strategy 1: Personal Network (Target: 3 users)

**Step 1:** Make a list of 20 people who:
- Create presentations regularly
- Have budget authority
- Trust you

**Step 2:** Reach out personally (not mass email):
```
Hey [Name],

Quick question - do you create presentations often? (pitch decks, sales decks, board updates, etc.)

I'm launching SlideCoffee next week - it's like having a consultant + designer in your pocket. You chat with an AI agent who researches, strategizes, and designs your presentations.

I'm giving 10 people free Pro access for a month ($18 value). Interested?

[Your Name]
```

**Step 3:** Follow up after they use it:
```
Hey [Name],

How's SlideCoffee working for you? Would love to hear your thoughts.

If you're finding it useful, I'd love for you to continue with a paid plan. As a founding user, I can offer you 50% off for 3 months.

Let me know!
```

**Expected Conversion:** 3/20 = 15%

---

### Strategy 2: Reddit/Communities (Target: 3 users)

**Step 1:** Post in relevant subreddits:
- r/entrepreneur
- r/startups
- r/consulting
- r/SideProject

**Post Template:**
```
Title: I built an AI that creates pitch decks in 10 minutes (Show & Tell)

Hey r/entrepreneur,

I spent the last 3 months building SlideCoffee - an AI agent that creates strategic presentations through a chat interface.

Instead of: "Let me fight with PowerPoint for 6 hours"
You get: "Café, create a 10-slide M&A pitch deck for TechVault acquiring DataShield"

10 minutes later, you have a board-ready presentation with research, strategy, and design.

**What makes it different:**
- AI agent (not templates) - thinks strategically
- Researches and cites sources
- Integrates brand guidelines
- 16:9 professional slides

**Launching next week!**
Free tier available. First 50 signups get 50% off Pro for 3 months.

[Link]

Would love your feedback!
```

**Expected Conversion:** 3/500 signups = 0.6%

---

### Strategy 3: LinkedIn Outreach (Target: 2 users)

**Step 1:** Identify target personas:
- Startup founders
- Consultants
- Sales professionals
- VCs/Investors

**Step 2:** Search LinkedIn:
- "Startup founder" + "pitch deck"
- "Consultant" + "presentations"
- "Sales director" + "proposals"

**Step 3:** Send connection request:
```
Hi [Name],

Saw your post about [topic]. I'm launching an AI tool that creates strategic presentations (pitch decks, sales decks, etc.) in minutes.

Would love to connect and get your feedback!
```

**Step 4:** After connection, send message:
```
Hey [Name],

Thanks for connecting! I'm launching SlideCoffee next week - an AI agent that creates board-ready presentations through a chat interface.

Given your work in [industry], I thought you might find it useful. Would you be open to trying it out? Happy to offer you a free month of Pro access.

Let me know!
```

**Expected Conversion:** 2/100 connections = 2%

---

### Strategy 4: Product Hunt (Target: 2 users)

**Step 1:** Prepare for launch:
- [ ] Create compelling listing
- [ ] Upload demo video
- [ ] Get 10 beta users to upvote at launch
- [ ] Respond to every comment

**Step 2:** Launch day tactics:
- [ ] Post at 12:01 AM PST (first in queue)
- [ ] Share on all social media
- [ ] Ask friends to upvote
- [ ] Engage with comments all day

**Step 3:** Offer launch discount:
```
🎉 Product Hunt Launch Special! 🎉

50% off Pro for 3 months for all Product Hunt users.
Use code: PRODUCTHUNT50

[Link to checkout]
```

**Expected Conversion:** 2/100 signups from PH = 2%

---

### Summary: Getting to 10 Paying Users

| Strategy | Target | Tactics | Timeline |
|----------|--------|---------|----------|
| Personal Network | 3 users | Direct outreach, 50% discount | Week 1 |
| Reddit/Communities | 3 users | Show & Tell posts, free tier | Week 1-2 |
| LinkedIn Outreach | 2 users | Cold outreach, free trial | Week 2-3 |
| Product Hunt | 2 users | Launch special, 50% discount | Week 3 |
| **Total** | **10 users** | **Mixed tactics** | **3 weeks** |

**Revenue:** 10 users × $18/month = $180/month  
**With 50% discount:** 10 users × $9/month = $90/month (first 3 months)

---

## ✅ Final Checklist Before Launch

### Technical
- [ ] All features working end-to-end
- [ ] No critical bugs
- [ ] Performance optimized
- [ ] Mobile responsive
- [ ] Security audit passed
- [ ] Backup system in place

### Legal
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] GDPR compliant
- [ ] CCPA compliant
- [ ] Cookie consent banner

### Marketing
- [ ] Landing page live
- [ ] Pricing page live
- [ ] Demo video published
- [ ] Social media accounts created
- [ ] Product Hunt listing ready
- [ ] Launch email drafted

### Support
- [ ] Help documentation written
- [ ] FAQ page published
- [ ] Support email set up
- [ ] Discord server created

---

## 🎉 Launch Day Checklist

### 6 AM EST
- [ ] Final bug check
- [ ] Verify Stripe working
- [ ] Verify Manus API working
- [ ] Post on Product Hunt

### 9 AM EST
- [ ] Post on Twitter/X
- [ ] Post on LinkedIn
- [ ] Post on Reddit
- [ ] Email beta users

### 12 PM EST
- [ ] Check Product Hunt ranking
- [ ] Respond to all comments
- [ ] Monitor signups
- [ ] Fix any issues

### 3 PM EST
- [ ] Post update on social media
- [ ] Share early metrics
- [ ] Thank supporters

### 6 PM EST
- [ ] Final push on social media
- [ ] Respond to all messages
- [ ] Celebrate! 🎉

---

## 🚀 Let's Do This!

**Remember:**
- Launch early, iterate fast
- Talk to users constantly
- Focus on value, not features
- Celebrate small wins
- Stay resilient

**You've got this!** 💪

