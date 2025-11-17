# Separate Manus Account Setup Guide

**Last Updated:** October 30, 2025 3:35 AM EDT  
**Purpose:** Set up a dedicated Manus account for SlideCoffee to track costs separately

---

## 🎯 Why a Separate Account?

**Financial Clarity:**
- Track SlideCoffee API costs separately from personal usage
- Calculate exact profit margins
- Budget for growth
- Tax deductions (business expense)

**Operational Benefits:**
- Separate API keys (security)
- Separate credit balance
- Separate usage dashboard
- Easier to hand off to team later

**Accounting:**
- Clean separation for bookkeeping
- Easy to show investors/partners
- Clear cost attribution

---

## 📋 Setup Steps

### Step 1: Create New Manus Account

**Option A: New Email Address**
```
1. Create new email: slidecoffee@yourdomain.com
2. Go to https://manus.im/signup
3. Sign up with new email
4. Verify email
5. Complete onboarding
```

**Option B: Use Existing Email with Plus Trick**
```
1. If your email is: you@gmail.com
2. Use: you+slidecoffee@gmail.com
3. Gmail will deliver to you@gmail.com
4. Manus sees it as separate account
```

---

### Step 2: Set Up Payment Method

**Add Credit Card:**
```
1. Go to Settings → Billing
2. Add business credit card (not personal)
3. Set up auto-reload:
   - Reload when balance < 1,000 credits
   - Reload amount: 10,000 credits (~$10)
```

**Why Auto-Reload:**
- Prevents service interruption
- Ensures users never hit "API down" errors
- Predictable costs

---

### Step 3: Generate API Key

**Create API Key:**
```
1. Go to Settings → API Keys
2. Click "Create New Key"
3. Name: "SlideCoffee Production"
4. Permissions: All (needed for task creation)
5. Copy key immediately (shown once!)
6. Store in password manager
```

**Security:**
- Never commit API key to git
- Store in environment variable
- Rotate every 90 days
- Use separate keys for dev/prod

---

### Step 4: Configure Environment Variables

**Add to SlideCoffee project:**

```bash
# In Manus deployment settings (Settings → Secrets)

# SlideCoffee Manus API Key (separate account)
SLIDECOFFEE_MANUS_KEY=your_new_api_key_here

# PII Encryption Key (generate with: openssl rand -hex 32)
PII_ENCRYPTION_KEY=your_32_byte_hex_key_here

# Stripe Keys (when ready)
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Generate PII Encryption Key:**
```bash
# On your local machine
openssl rand -hex 32

# Copy output and add to environment
```

---

### Step 5: Update Code to Use New Key

**Before (using your personal key):**
```typescript
// server/routers/chat.ts
const response = await fetch('https://api.manus.ai/v1/tasks', {
  headers: {
    'API_KEY': process.env.slide_c_skt1, // Your personal key
  }
});
```

**After (using SlideCoffee account key):**
```typescript
// server/routers/chat.ts
const response = await fetch('https://api.manus.ai/v1/tasks', {
  headers: {
    'API_KEY': process.env.SLIDECOFFEE_MANUS_KEY, // Separate account
  }
});
```

---

### Step 6: Test API Connection

**Create test script:**
```typescript
// scripts/test-manus-api.ts

async function testManusAPI() {
  const response = await fetch('https://api.manus.ai/v1/tasks', {
    method: 'POST',
    headers: {
      'API_KEY': process.env.SLIDECOFFEE_MANUS_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: 'Test: Create a simple 3-slide presentation about coffee'
    })
  });

  const data = await response.json();
  console.log('Task created:', data.task_id);
  console.log('Status:', data.status);
  
  return data.task_id;
}

testManusAPI();
```

**Run test:**
```bash
cd /home/ubuntu/slidecoffee
tsx scripts/test-manus-api.ts
```

**Expected output:**
```
Task created: ABC123XYZ
Status: pending
```

---

### Step 7: Monitor Usage

**Daily Monitoring (First Week):**
```
1. Go to https://manus.im/dashboard
2. Check "Usage" tab
3. Note:
   - Credits used today
   - Credits remaining
   - Cost per task
   - Average credits per presentation
```

**Weekly Monitoring (Ongoing):**
```
1. Check total credits used
2. Calculate cost: credits × $0.001
3. Compare to revenue
4. Adjust pricing if needed
```

**Set Up Alerts:**
```
1. Go to Settings → Notifications
2. Enable:
   - Low balance alert (< 1,000 credits)
   - High usage alert (> 10,000 credits/day)
   - Failed payment alert
```

---

## 💰 Cost Tracking

### Monthly Cost Calculation

**Formula:**
```
Monthly Manus Cost = (Total Credits Used) × $0.001
```

**Example (Month 1):**
```
- 50 users
- Average 4 presentations/user/month = 200 presentations
- Average 500 credits/presentation = 100,000 credits
- Cost: 100,000 × $0.001 = $100/month
```

**Revenue:**
```
- 50 Pro users × $18/month = $900/month
- Manus cost: $100/month
- Other costs: $50/month (hosting, etc.)
- Profit: $750/month (83% margin)
```

---

### Credit Budget by Tier

**Starter (FREE):**
- 200 credits/month
- Cost to you: $0.20/month
- Loss leader

**Pro ($18/month):**
- 2,000 credits/month
- Cost to you: $2.00/month
- Profit: $16/month (89% margin)

**Pro Plus ($35/month):**
- 5,000 credits/month
- Cost to you: $5.00/month
- Profit: $30/month (86% margin)

**Team ($35/seat/month):**
- 6,000 credits/seat/month
- Cost to you: $6/seat/month
- Profit: $29/seat/month (83% margin)

**Business ($60/seat/month):**
- 10,000 credits/seat/month
- Cost to you: $10/seat/month
- Profit: $50/seat/month (83% margin)

---

## 🔄 Credit Top-Up Strategy

### When to Top Up

**Automatic Top-Up (Recommended):**
```
Settings → Billing → Auto-reload
- Trigger: Balance < 1,000 credits
- Amount: 10,000 credits (~$10)
```

**Manual Top-Up:**
```
- Check balance weekly
- Top up when < 5,000 credits
- Buy in bulk for discount (if available)
```

---

### Bulk Credit Purchases

**Check Manus pricing for bulk discounts:**
```
- 10,000 credits: $10 (no discount)
- 100,000 credits: $90 (10% discount)
- 1,000,000 credits: $800 (20% discount)
```

**When to buy bulk:**
- After 100+ paying users
- Predictable monthly usage
- Cash flow allows prepayment

---

## 📊 Financial Dashboard

### Key Metrics to Track

**Daily:**
- [ ] Credits used today
- [ ] New signups
- [ ] Presentations created
- [ ] Average credits per presentation

**Weekly:**
- [ ] Total credits used
- [ ] Total cost
- [ ] Revenue
- [ ] Profit margin
- [ ] Credits per user

**Monthly:**
- [ ] Total Manus cost
- [ ] Total revenue
- [ ] Profit
- [ ] Cost per user
- [ ] LTV:CAC ratio

---

### Create Tracking Spreadsheet

**Google Sheets Template:**

| Date | Credits Used | Cost | Revenue | Profit | Margin | Users | Presentations |
|------|--------------|------|---------|--------|--------|-------|---------------|
| Nov 1 | 5,000 | $5 | $0 | -$5 | -100% | 20 | 15 |
| Nov 8 | 10,000 | $10 | $180 | $170 | 94% | 30 | 40 |
| Nov 15 | 25,000 | $25 | $540 | $515 | 95% | 60 | 100 |
| Nov 22 | 50,000 | $50 | $900 | $850 | 94% | 100 | 200 |

**Formulas:**
- Cost = Credits Used × $0.001
- Profit = Revenue - Cost - Other Costs
- Margin = (Profit / Revenue) × 100%

---

## 🚨 Cost Spike Protection

### Set Up Alerts

**High Usage Alert:**
```
If daily credits > 10,000:
  - Send email alert
  - Check for abuse
  - Investigate cause
```

**Budget Alert:**
```
If monthly cost > $500:
  - Review usage patterns
  - Check for outliers
  - Consider rate limiting
```

---

### Abuse Prevention

**Rate Limiting:**
```typescript
// server/lib/credits.ts

async function checkRateLimit(userId: number): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  
  const usage = await db.select()
    .from(creditTransactions)
    .where(and(
      eq(creditTransactions.userId, userId),
      gte(creditTransactions.createdAt, today)
    ));
  
  const totalToday = usage.reduce((sum, t) => sum + t.amount, 0);
  
  const user = await db.select()
    .from(users)
    .where(eq(users.id, userId));
  
  const limits = {
    starter: 200,
    pro: 2000,
    pro_plus: 5000,
    team: 6000,
    business: 10000
  };
  
  const limit = limits[user.subscriptionTier] || 200;
  
  return totalToday < limit;
}
```

**Slide Limits:**
```typescript
const slideLimits = {
  starter: 10,
  pro: 30,
  pro_plus: 50,
  team: 50,
  business: 100
};
```

---

## 📞 Manus Support

### When to Contact Support

**Billing Issues:**
- Failed payment
- Incorrect charges
- Refund requests

**Technical Issues:**
- API downtime
- Slow response times
- Error rates > 5%

**Account Issues:**
- Can't access dashboard
- Need to change email
- Need invoice for taxes

**Contact:**
- Email: support@manus.im
- Response time: Usually < 24 hours

---

## ✅ Setup Checklist

### Initial Setup
- [ ] Create separate Manus account
- [ ] Add payment method
- [ ] Set up auto-reload
- [ ] Generate API key
- [ ] Add to environment variables
- [ ] Update code to use new key
- [ ] Test API connection

### Monitoring Setup
- [ ] Set up usage alerts
- [ ] Create tracking spreadsheet
- [ ] Schedule weekly review
- [ ] Set up cost alerts

### Security
- [ ] Store API key in password manager
- [ ] Never commit to git
- [ ] Rotate every 90 days
- [ ] Use separate keys for dev/prod

### Financial
- [ ] Link business credit card
- [ ] Set up auto-reload
- [ ] Track costs weekly
- [ ] Review margins monthly

---

## 🎯 Next Steps

1. **Create Account** - Set up separate Manus account today
2. **Generate API Key** - Get new key for SlideCoffee
3. **Update Environment** - Add key to project secrets
4. **Test Connection** - Verify API working
5. **Monitor Usage** - Track costs from Day 1
6. **Review Weekly** - Check margins and adjust pricing if needed

**This keeps your finances clean and makes it easy to scale!** 📊

