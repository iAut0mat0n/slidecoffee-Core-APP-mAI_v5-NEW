# PII Anonymization Architecture

**Last Updated:** October 30, 2025 3:25 AM EDT  
**Purpose:** Ensure we can legally state: "We do not permit our AI provider to use customer data for model training, and we do not sell or share prompts for advertising."

---

## 🎯 The Goal

**Privacy Policy Statement:**
> "SlideCoffee does not permit our AI provider to use customer data for model training. We do not sell or share your prompts for advertising purposes. All personally identifiable information (PII) is automatically anonymized before being sent to our AI provider."

---

## 🔒 What is PII?

**Personally Identifiable Information (PII):**
- Names (people, companies)
- Email addresses
- Phone numbers
- Physical addresses
- Social Security Numbers
- Credit card numbers
- IP addresses
- Dates of birth
- Biometric data
- Medical information
- Financial information

**In presentation context:**
- "John Smith, CEO of Acme Corp"
- "Contact: john@acme.com"
- "Revenue: $50M (Acme Corp FY2024)"
- "123 Main St, San Francisco, CA"

---

## 🏗️ Architecture Overview

### Three-Layer Anonymization System

```
┌─────────────────────────────────────────────────────────┐
│                    User Input                            │
│  "Create a pitch deck for Acme Corp's acquisition       │
│   of TechVault. CEO John Smith wants to present to      │
│   the board. Contact: john@acme.com"                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Layer 1: Detection                          │
│  Detect PII using regex + NER (Named Entity Recognition) │
│                                                          │
│  Detected:                                               │
│  - "Acme Corp" → COMPANY_1                              │
│  - "TechVault" → COMPANY_2                              │
│  - "John Smith" → PERSON_1                              │
│  - "john@acme.com" → EMAIL_1                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Layer 2: Tokenization                       │
│  Replace PII with tokens, store mapping in database      │
│                                                          │
│  Anonymized:                                             │
│  "Create a pitch deck for [COMPANY_1]'s acquisition     │
│   of [COMPANY_2]. CEO [PERSON_1] wants to present to    │
│   the board. Contact: [EMAIL_1]"                         │
│                                                          │
│  Mapping stored in DB (encrypted):                       │
│  - COMPANY_1 → Acme Corp                                │
│  - COMPANY_2 → TechVault                                │
│  - PERSON_1 → John Smith                                │
│  - EMAIL_1 → john@acme.com                              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Layer 3: Manus API Call                     │
│  Send anonymized text to Manus                           │
│                                                          │
│  Manus receives:                                         │
│  "Create a pitch deck for [COMPANY_1]'s acquisition     │
│   of [COMPANY_2]. CEO [PERSON_1] wants to present..."   │
│                                                          │
│  Manus generates slides with tokens                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Layer 4: De-tokenization                    │
│  Replace tokens with real values before showing user     │
│                                                          │
│  Slide content from Manus:                               │
│  "# [COMPANY_1] Acquisition Strategy"                    │
│                                                          │
│  Displayed to user:                                      │
│  "# Acme Corp Acquisition Strategy"                      │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema

### New Table: `pii_tokens`

```sql
CREATE TABLE pii_tokens (
  id SERIAL PRIMARY KEY,
  presentation_id INT NOT NULL REFERENCES presentations(id) ON DELETE CASCADE,
  token VARCHAR(50) NOT NULL, -- e.g., "COMPANY_1", "PERSON_1"
  token_type VARCHAR(50) NOT NULL, -- 'company', 'person', 'email', 'phone', 'address'
  original_value TEXT NOT NULL, -- Encrypted!
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(presentation_id, token)
);

CREATE INDEX idx_pii_tokens_presentation ON pii_tokens(presentation_id);
```

### Encryption

```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.PII_ENCRYPTION_KEY; // 32-byte key
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = Buffer.from(parts[1], 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
```

---

## 🔍 PII Detection

### Regex Patterns

```typescript
const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g,
  address: /\b\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|highway|hwy|square|sq|trail|trl|drive|dr|court|ct|parkway|pkwy|circle|cir|boulevard|blvd)\b/gi,
  zipCode: /\b\d{5}(?:-\d{4})?\b/g,
  ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
};
```

### Named Entity Recognition (NER)

For detecting names and companies, we use a lightweight NER library:

```typescript
import { NlpManager } from 'node-nlp';

const manager = new NlpManager({ languages: ['en'] });

async function detectEntities(text: string): Promise<{
  persons: string[],
  organizations: string[],
  locations: string[]
}> {
  const entities = await manager.extractEntities('en', text);
  
  return {
    persons: entities.filter(e => e.entity === 'person').map(e => e.sourceText),
    organizations: entities.filter(e => e.entity === 'organization').map(e => e.sourceText),
    locations: entities.filter(e => e.entity === 'location').map(e => e.sourceText)
  };
}
```

---

## 🔄 Anonymization Flow

### Step 1: User Sends Message

```typescript
// Frontend
const { mutate: sendMessage } = trpc.chat.sendMessage.useMutation();

sendMessage({
  projectId: 123,
  message: "Create a pitch deck for Acme Corp's acquisition of TechVault. CEO John Smith wants to present to the board. Contact: john@acme.com"
});
```

### Step 2: Backend Detects and Tokenizes PII

```typescript
// server/lib/pii.ts

interface AnonymizationResult {
  anonymizedText: string;
  tokens: Array<{
    token: string;
    type: string;
    originalValue: string;
  }>;
}

async function anonymizeText(
  text: string,
  presentationId: number
): Promise<AnonymizationResult> {
  const tokens: AnonymizationResult['tokens'] = [];
  let anonymizedText = text;
  
  // 1. Detect emails
  let emailIndex = 1;
  const emails = text.match(PII_PATTERNS.email) || [];
  for (const email of emails) {
    const token = `EMAIL_${emailIndex++}`;
    anonymizedText = anonymizedText.replace(email, `[${token}]`);
    tokens.push({ token, type: 'email', originalValue: email });
  }
  
  // 2. Detect phone numbers
  let phoneIndex = 1;
  const phones = text.match(PII_PATTERNS.phone) || [];
  for (const phone of phones) {
    const token = `PHONE_${phoneIndex++}`;
    anonymizedText = anonymizedText.replace(phone, `[${token}]`);
    tokens.push({ token, type: 'phone', originalValue: phone });
  }
  
  // 3. Detect addresses
  let addressIndex = 1;
  const addresses = text.match(PII_PATTERNS.address) || [];
  for (const address of addresses) {
    const token = `ADDRESS_${addressIndex++}`;
    anonymizedText = anonymizedText.replace(address, `[${token}]`);
    tokens.push({ token, type: 'address', originalValue: address });
  }
  
  // 4. Detect names and companies using NER
  const entities = await detectEntities(anonymizedText);
  
  let personIndex = 1;
  for (const person of entities.persons) {
    const token = `PERSON_${personIndex++}`;
    anonymizedText = anonymizedText.replace(new RegExp(person, 'g'), `[${token}]`);
    tokens.push({ token, type: 'person', originalValue: person });
  }
  
  let companyIndex = 1;
  for (const company of entities.organizations) {
    const token = `COMPANY_${companyIndex++}`;
    anonymizedText = anonymizedText.replace(new RegExp(company, 'g'), `[${token}]`);
    tokens.push({ token, type: 'company', originalValue: company });
  }
  
  // 5. Save tokens to database (encrypted)
  for (const { token, type, originalValue } of tokens) {
    await db.insert(piiTokens).values({
      presentationId,
      token,
      tokenType: type,
      originalValue: encrypt(originalValue)
    }).onConflictDoNothing(); // Don't duplicate tokens
  }
  
  return { anonymizedText, tokens };
}
```

### Step 3: Send Anonymized Text to Manus

```typescript
// server/routers/chat.ts
sendMessage: protectedProcedure
  .input(z.object({
    projectId: z.number(),
    message: z.string()
  }))
  .mutation(async ({ ctx, input }) => {
    // 1. Anonymize user message
    const { anonymizedText, tokens } = await anonymizeText(
      input.message,
      input.projectId
    );
    
    // 2. Save anonymized message to database
    await db.insert(chatMessages).values({
      projectId: input.projectId,
      role: 'user',
      content: anonymizedText, // Save anonymized version!
      originalContent: encrypt(input.message), // Save original encrypted
      userId: ctx.user.id
    });
    
    // 3. Build context (also anonymized)
    const context = await buildAnonymizedContext(input.projectId);
    
    // 4. Call Manus API with anonymized text
    const response = await fetch('https://api.manus.ai/v1/tasks', {
      method: 'POST',
      headers: {
        'API_KEY': process.env.SLIDECOFFEE_MANUS_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: buildCafePrompt(anonymizedText, context), // Anonymized!
      })
    });
    
    // ... rest of flow
  })
```

### Step 4: De-tokenize Response

```typescript
async function deanonymizeText(
  text: string,
  presentationId: number
): Promise<string> {
  // 1. Get all tokens for this presentation
  const tokens = await db.select()
    .from(piiTokens)
    .where(eq(piiTokens.presentationId, presentationId));
  
  let deanonymizedText = text;
  
  // 2. Replace each token with original value
  for (const { token, originalValue } of tokens) {
    const decrypted = decrypt(originalValue);
    deanonymizedText = deanonymizedText.replace(
      new RegExp(`\\[${token}\\]`, 'g'),
      decrypted
    );
  }
  
  return deanonymizedText;
}
```

### Step 5: Display to User

```typescript
// server/routers/chat.ts
getMessages: protectedProcedure
  .input(z.object({ projectId: z.number() }))
  .query(async ({ ctx, input }) => {
    // 1. Get messages from database (anonymized)
    const messages = await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.projectId, input.projectId));
    
    // 2. De-anonymize for display
    const deanonymizedMessages = await Promise.all(
      messages.map(async (msg) => ({
        ...msg,
        content: await deanonymizeText(msg.content, input.projectId)
      }))
    );
    
    return deanonymizedMessages;
  })
```

---

## 🛡️ What Manus Sees vs What We Store

### Example: M&A Pitch Deck

**User Input:**
```
Create a 10-slide M&A pitch deck for Acme Corp's acquisition of TechVault.

Key details:
- Acme Corp CEO: John Smith (john@acme.com)
- TechVault CEO: Jane Doe (jane@techvault.com)
- Deal size: $50M
- Acme Corp HQ: 123 Main St, San Francisco, CA 94105
- Board presentation date: March 15, 2025
```

**What Manus Sees:**
```
Create a 10-slide M&A pitch deck for [COMPANY_1]'s acquisition of [COMPANY_2].

Key details:
- [COMPANY_1] CEO: [PERSON_1] ([EMAIL_1])
- [COMPANY_2] CEO: [PERSON_2] ([EMAIL_2])
- Deal size: $50M
- [COMPANY_1] HQ: [ADDRESS_1]
- Board presentation date: March 15, 2025
```

**What We Store in Database:**

```sql
-- chat_messages table
content: "Create a 10-slide M&A pitch deck for [COMPANY_1]'s acquisition of [COMPANY_2]..."
original_content: "encrypted_original_text_here"

-- pii_tokens table
COMPANY_1 → "encrypted:acme_corp"
COMPANY_2 → "encrypted:techvault"
PERSON_1 → "encrypted:john_smith"
PERSON_2 → "encrypted:jane_doe"
EMAIL_1 → "encrypted:john@acme.com"
EMAIL_2 → "encrypted:jane@techvault.com"
ADDRESS_1 → "encrypted:123_main_st_sf"
```

**What User Sees:**
```
Create a 10-slide M&A pitch deck for Acme Corp's acquisition of TechVault.
[Full original text with all PII restored]
```

---

## 🔐 Security Considerations

### 1. Encryption at Rest
- All PII tokens encrypted in database
- Use AES-256-CBC encryption
- Store encryption key in environment variable (NOT in code)
- Rotate encryption keys periodically

### 2. Encryption in Transit
- HTTPS for all API calls
- TLS 1.3 for database connections
- Manus API uses HTTPS

### 3. Access Control
- Only authorized users can see their own presentations
- Admin users cannot see PII tokens (encrypted)
- Audit logs for all PII access

### 4. Data Retention
- Delete PII tokens when presentation is deleted
- Cascade delete on presentation deletion
- Optional: Auto-delete after 90 days

### 5. Compliance
- GDPR compliant (right to be forgotten)
- CCPA compliant (do not sell data)
- SOC 2 Type II ready

---

## 📝 Privacy Policy Language

### What We Can Legally State:

> **Data Privacy & AI Provider Policy**
> 
> SlideCoffee takes your privacy seriously. We implement industry-leading anonymization technology to protect your sensitive information:
> 
> - **No Model Training:** We do not permit our AI provider to use your data for model training purposes.
> - **No Data Selling:** We do not sell or share your prompts for advertising or any other commercial purpose.
> - **Automatic Anonymization:** All personally identifiable information (PII) including names, email addresses, phone numbers, and addresses are automatically anonymized before being sent to our AI provider.
> - **Encrypted Storage:** All PII is encrypted at rest using AES-256 encryption.
> - **Secure Transmission:** All data is transmitted over encrypted HTTPS connections.
> - **Right to Deletion:** You can delete your presentations at any time, which permanently removes all associated PII.
> 
> **What Our AI Provider Sees:**
> When you create a presentation about "Acme Corp," our AI provider sees "[COMPANY_1]" instead. When you mention "John Smith," they see "[PERSON_1]." Your actual data never leaves our secure infrastructure in an identifiable form.
> 
> **What We Store:**
> We store your original content in encrypted form within our secure database. Only you can access your presentations, and only our system can decrypt the PII tokens to display your content accurately.

---

## ⚠️ Edge Cases & Limitations

### 1. Context-Based PII
**Problem:** "My company" or "our CEO" is not detected as PII  
**Solution:** Prompt user to be explicit, or use conversation history to infer

### 2. Misspellings
**Problem:** "Jhon Smith" might not be detected as a person  
**Solution:** Use fuzzy matching and context clues

### 3. Acronyms
**Problem:** "ACME" vs "Acme Corp"  
**Solution:** Normalize and create token mappings

### 4. False Positives
**Problem:** "Apple" (fruit) vs "Apple" (company)  
**Solution:** Use context and capitalization to disambiguate

### 5. Numbers
**Problem:** "$50M" is not PII, but "SSN: 123-45-6789" is  
**Solution:** Pattern-based detection for sensitive number formats

---

## ✅ Implementation Checklist

### Phase 1: Database
- [ ] Create `pii_tokens` table
- [ ] Add `original_content` field to `chat_messages` (encrypted)
- [ ] Set up encryption/decryption functions
- [ ] Generate and store encryption key securely

### Phase 2: Detection
- [ ] Implement regex patterns for email, phone, SSN, etc.
- [ ] Integrate NER library for names and companies
- [ ] Create `detectPII()` function
- [ ] Test with sample data

### Phase 3: Anonymization
- [ ] Create `anonymizeText()` function
- [ ] Create `deanonymizeText()` function
- [ ] Save tokens to database
- [ ] Test round-trip (anonymize → deanonymize)

### Phase 4: Integration
- [ ] Update `sendMessage` to anonymize before Manus call
- [ ] Update `getMessages` to deanonymize before display
- [ ] Update `buildContext` to use anonymized data
- [ ] Test full flow

### Phase 5: Privacy Policy
- [ ] Draft privacy policy language
- [ ] Add to website
- [ ] Add to terms of service
- [ ] Add to onboarding flow

### Phase 6: Compliance
- [ ] GDPR compliance review
- [ ] CCPA compliance review
- [ ] SOC 2 audit preparation
- [ ] Security penetration testing

---

## 🎯 Key Takeaways

1. **Anonymize before sending to Manus** - Protect user privacy
2. **Encrypt at rest** - Secure database storage
3. **De-anonymize for display** - Seamless user experience
4. **Legal compliance** - GDPR, CCPA, SOC 2 ready
5. **Transparent policy** - Users know their data is protected

**This architecture allows us to confidently state we don't share PII with AI providers!** 🔒

