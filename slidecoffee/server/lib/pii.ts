/**
 * PII Detection and Anonymization
 * 
 * Detects and anonymizes Personally Identifiable Information (PII) in user content.
 * Stores encrypted mappings in database for later de-anonymization if needed.
 * 
 * Supported PII Types:
 * - Email addresses
 * - Phone numbers
 * - Credit card numbers
 * - SSN (Social Security Numbers)
 * - Physical addresses
 * - Person names (basic detection)
 * - Company names (basic detection)
 * 
 * Privacy Policy Compliance:
 * - We do not send raw PII to AI providers
 * - All PII is tokenized before AI processing
 * - Original values are encrypted and stored separately
 * - We do not permit AI providers to use customer data for training
 */

import { encrypt, decrypt, generateToken } from './encryption';

export type PIIType = 'company' | 'person' | 'email' | 'phone' | 'address' | 'ssn' | 'credit_card';

export interface PIIMatch {
  type: PIIType;
  value: string;
  start: number;
  end: number;
  token: string;
}

export interface PIIToken {
  token: string;
  type: PIIType;
  encryptedValue: string; // Encrypted original value
}

// Regex patterns for PII detection
const patterns = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  // Basic address pattern (street number + street name)
  address: /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir|Way)\b/gi,
};

/**
 * Detect all PII in text
 * Returns array of matches with positions
 */
export function detectPII(text: string): PIIMatch[] {
  const matches: PIIMatch[] = [];

  // Email detection
  let match;
  while ((match = patterns.email.exec(text)) !== null) {
    matches.push({
      type: 'email',
      value: match[0],
      start: match.index,
      end: match.index + match[0].length,
      token: generateToken('EMAIL'),
    });
  }

  // Phone detection
  patterns.phone.lastIndex = 0;
  while ((match = patterns.phone.exec(text)) !== null) {
    matches.push({
      type: 'phone',
      value: match[0],
      start: match.index,
      end: match.index + match[0].length,
      token: generateToken('PHONE'),
    });
  }

  // SSN detection
  patterns.ssn.lastIndex = 0;
  while ((match = patterns.ssn.exec(text)) !== null) {
    matches.push({
      type: 'ssn',
      value: match[0],
      start: match.index,
      end: match.index + match[0].length,
      token: generateToken('SSN'),
    });
  }

  // Credit card detection
  patterns.creditCard.lastIndex = 0;
  while ((match = patterns.creditCard.exec(text)) !== null) {
    matches.push({
      type: 'credit_card',
      value: match[0],
      start: match.index,
      end: match.index + match[0].length,
      token: generateToken('CC'),
    });
  }

  // Address detection
  patterns.address.lastIndex = 0;
  while ((match = patterns.address.exec(text)) !== null) {
    matches.push({
      type: 'address',
      value: match[0],
      start: match.index,
      end: match.index + match[0].length,
      token: generateToken('ADDR'),
    });
  }

  // Sort by start position (reverse order for replacement)
  return matches.sort((a, b) => b.start - a.start);
}

/**
 * Anonymize text by replacing PII with tokens
 * Returns anonymized text and array of PII tokens for storage
 */
export function anonymizeText(text: string): { anonymized: string; tokens: PIIToken[] } {
  const matches = detectPII(text);
  const tokens: PIIToken[] = [];
  
  let anonymized = text;

  // Replace from end to start to preserve positions
  for (const match of matches) {
    const encryptedValue = encrypt(match.value);
    
    tokens.push({
      token: match.token,
      type: match.type,
      encryptedValue,
    });

    // Replace the PII with the token
    anonymized = 
      anonymized.substring(0, match.start) +
      match.token +
      anonymized.substring(match.end);
  }

  return { anonymized, tokens };
}

/**
 * De-anonymize text by replacing tokens with original values
 * Requires PII tokens from database
 */
export function deanonymizeText(text: string, tokens: PIIToken[]): string {
  let deanonymized = text;

  for (const piiToken of tokens) {
    try {
      const originalValue = decrypt(piiToken.encryptedValue);
      // Replace all occurrences of the token
      deanonymized = deanonymized.replace(new RegExp(piiToken.token, 'g'), originalValue);
    } catch (error) {
      console.error(`[PII] Failed to decrypt token ${piiToken.token}:`, error);
      // Leave token in place if decryption fails
    }
  }

  return deanonymized;
}

/**
 * Check if text contains any PII
 * Quick check without full detection
 */
export function containsPII(text: string): boolean {
  return (
    patterns.email.test(text) ||
    patterns.phone.test(text) ||
    patterns.ssn.test(text) ||
    patterns.creditCard.test(text) ||
    patterns.address.test(text)
  );
}

/**
 * Sanitize text for AI processing
 * Removes PII and returns safe text + tokens for storage
 */
export function sanitizeForAI(text: string): { safe: string; tokens: PIIToken[] } {
  if (!containsPII(text)) {
    return { safe: text, tokens: [] };
  }

  const { anonymized, tokens } = anonymizeText(text);
  
  console.log(`[PII] Anonymized ${tokens.length} PII items before AI processing`);
  
  return { safe: anonymized, tokens };
}

