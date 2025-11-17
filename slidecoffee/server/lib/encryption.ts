/**
 * Encryption Utilities
 * 
 * Provides encryption/decryption for sensitive data like PII tokens.
 * Uses AES-256-GCM for authenticated encryption.
 * 
 * Security Notes:
 * - Encryption key is derived from JWT_SECRET
 * - Each encryption uses a unique IV (initialization vector)
 * - GCM mode provides authentication, preventing tampering
 * - Never log or expose encrypted data or keys
 */

import crypto from 'crypto';
import { ENV } from '../_core/env';

// Derive a consistent encryption key from JWT_SECRET
function getEncryptionKey(): Buffer {
  // Use PBKDF2 to derive a 256-bit key from cookie secret
  return crypto.pbkdf2Sync(
    ENV.cookieSecret,
    'slidecoffee-pii-salt', // Static salt for consistency
    100000, // iterations
    32, // key length (256 bits)
    'sha256'
  );
}

/**
 * Encrypt a string value
 * Returns base64-encoded encrypted data with IV prepended
 */
export function encrypt(plaintext: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16); // 128-bit IV for GCM
    
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const authTag = cipher.getAuthTag();
    
    // Combine IV + authTag + encrypted data
    const combined = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, 'base64')
    ]);
    
    return combined.toString('base64');
  } catch (error) {
    console.error('[Encryption] Failed to encrypt:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt a string value
 * Expects base64-encoded data with IV prepended
 */
export function decrypt(ciphertext: string): string {
  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(ciphertext, 'base64');
    
    // Extract IV (first 16 bytes), authTag (next 16 bytes), and encrypted data
    const iv = combined.subarray(0, 16);
    const authTag = combined.subarray(16, 32);
    const encrypted = combined.subarray(32);
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted.toString('base64'), 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('[Encryption] Failed to decrypt:', error);
    throw new Error('Decryption failed');
  }
}

/**
 * Generate a cryptographically secure random token
 * Used for PII token generation
 */
export function generateToken(prefix: string = 'TOK'): string {
  const randomBytes = crypto.randomBytes(16);
  const randomString = randomBytes.toString('base64')
    .replace(/\+/g, '')
    .replace(/\//g, '')
    .replace(/=/g, '')
    .substring(0, 12);
  
  return `${prefix}_${randomString}`;
}

/**
 * Hash a value (one-way)
 * Used for indexing without storing plaintext
 */
export function hash(value: string): string {
  return crypto
    .createHash('sha256')
    .update(value)
    .digest('hex');
}

