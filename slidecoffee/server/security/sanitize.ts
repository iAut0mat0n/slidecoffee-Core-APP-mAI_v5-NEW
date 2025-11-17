/**
 * Security utilities for input sanitization and XSS protection
 */

/**
 * Sanitize user input to prevent XSS attacks
 * Removes potentially dangerous HTML/JS while preserving safe formatting
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";

  // Remove script tags and event handlers
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*[^\s>]*/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/data:text\/html/gi, "");

  // Remove dangerous HTML tags
  const dangerousTags = [
    "iframe",
    "object",
    "embed",
    "applet",
    "meta",
    "link",
    "style",
    "form",
    "input",
    "button",
  ];

  dangerousTags.forEach((tag) => {
    const regex = new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, "gi");
    sanitized = sanitized.replace(regex, "");
    // Also remove self-closing tags
    const selfClosing = new RegExp(`<${tag}\\b[^>]*\\/?>`, "gi");
    sanitized = sanitized.replace(selfClosing, "");
  });

  return sanitized.trim();
}

/**
 * Sanitize slide content specifically
 * Allows basic formatting but removes dangerous content
 */
export function sanitizeSlideContent(content: any): any {
  if (typeof content === "string") {
    return sanitizeInput(content);
  }

  if (Array.isArray(content)) {
    return content.map(item => sanitizeSlideContent(item));
  }

  if (typeof content === "object" && content !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(content)) {
      sanitized[key] = sanitizeSlideContent(value);
    }
    return sanitized;
  }

  return content;
}

/**
 * Validate and sanitize brand data
 */
export function sanitizeBrandData(data: {
  name?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  primaryFont?: string;
  secondaryFont?: string;
  brandGuidelines?: string;
  logoUrl?: string;
}): typeof data {
  return {
    name: data.name ? sanitizeInput(data.name) : undefined,
    primaryColor: data.primaryColor ? sanitizeColorCode(data.primaryColor) : undefined,
    secondaryColor: data.secondaryColor ? sanitizeColorCode(data.secondaryColor) : undefined,
    accentColor: data.accentColor ? sanitizeColorCode(data.accentColor) : undefined,
    primaryFont: data.primaryFont ? sanitizeFontName(data.primaryFont) : undefined,
    secondaryFont: data.secondaryFont ? sanitizeFontName(data.secondaryFont) : undefined,
    brandGuidelines: data.brandGuidelines ? sanitizeInput(data.brandGuidelines) : undefined,
    logoUrl: data.logoUrl ? sanitizeUrl(data.logoUrl) : undefined,
  };
}

/**
 * Validate color code (hex format)
 */
function sanitizeColorCode(color: string): string {
  // Remove # if present
  const cleaned = color.replace(/^#/, "");
  
  // Validate hex color (3 or 6 characters)
  if (/^[0-9A-Fa-f]{3}$/.test(cleaned) || /^[0-9A-Fa-f]{6}$/.test(cleaned)) {
    return `#${cleaned}`;
  }
  
  // Return default if invalid
  return "#000000";
}

/**
 * Sanitize font name
 */
function sanitizeFontName(font: string): string {
  // Allow only alphanumeric, spaces, and common font name characters
  return font.replace(/[^a-zA-Z0-9\s\-,]/g, "").trim();
}

/**
 * Sanitize URL
 */
function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "";
    }
    return parsed.toString();
  } catch {
    return "";
  }
}

/**
 * Escape HTML entities for safe display
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Validate project title and description
 */
export function sanitizeProjectData(data: {
  title?: string;
  description?: string;
}): typeof data {
  return {
    title: data.title ? sanitizeInput(data.title) : undefined,
    description: data.description ? sanitizeInput(data.description) : undefined,
  };
}

/**
 * Validate chat message content
 */
export function sanitizeChatMessage(content: string): string {
  // For chat, we want to preserve more formatting but still prevent XSS
  return sanitizeInput(content);
}

