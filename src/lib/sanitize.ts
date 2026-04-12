// Input sanitization utility — prevents XSS by cleaning user inputs
// Import and call sanitize() on any string before storing in DB

// Strip all HTML tags and dangerous patterns
export function sanitize(input: string | null | undefined): string {
  if (!input) return "";
  return input
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove all HTML tags
    .replace(/<\/?[^>]+(>|$)/g, "")
    // Remove javascript: protocol
    .replace(/javascript\s*:/gi, "")
    // Remove data: protocol (can be used for XSS)
    .replace(/data\s*:[^,]*,/gi, "")
    // Remove event handlers (onclick, onerror, etc)
    .replace(/on\w+\s*=/gi, "")
    // Remove style expressions
    .replace(/expression\s*\(/gi, "")
    // Decode HTML entities that could bypass filters
    .replace(/&#x?[\da-f]+;?/gi, "")
    // Trim whitespace
    .trim();
}

// Sanitize all string values in an object (shallow)
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      cleaned[key] = sanitize(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned as T;
}

// Sanitize specific fields in a body object
export function sanitizeBody(body: Record<string, any>, fields: string[]): Record<string, any> {
  const cleaned = { ...body };
  for (const field of fields) {
    if (typeof cleaned[field] === "string") {
      cleaned[field] = sanitize(cleaned[field]);
    }
  }
  return cleaned;
}

// Check if a string contains potentially dangerous content
export function hasDangerousContent(input: string): boolean {
  if (!input) return false;
  const patterns = [
    /<script/i,
    /javascript\s*:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<form/i,
    /document\.(cookie|write|location)/i,
    /window\.(location|open)/i,
    /eval\s*\(/i,
    /alert\s*\(/i,
  ];
  return patterns.some(p => p.test(input));
}
