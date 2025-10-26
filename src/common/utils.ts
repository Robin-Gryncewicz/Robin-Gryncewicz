/**
 * Common utility functions
 */

/**
 * Validates an email address
 * @param email Email address to validate
 * @returns Boolean indicating if the email is valid
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Formats a timestamp to ISO date string
 * @param timestamp Unix timestamp in milliseconds
 * @returns ISO formatted date string
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

/**
 * Generates a random string of specified length
 * @param length Length of the random string
 * @returns Random string
 */
export function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * Delays execution for a specified time
 * @param ms Milliseconds to delay
 * @returns Promise that resolves after the delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Safely parses JSON with error handling
 * @param jsonString JSON string to parse
 * @returns Parsed object or null if parsing fails
 */
export function safeJsonParse<T>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('JSON parse error:', error);
    return null;
  }
}

/**
 * Deep clones an object using structuredClone (if available) or JSON serialization as fallback
 * Note: JSON serialization doesn't handle functions, undefined values, symbols, or circular references
 * @param obj Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  // Use structuredClone if available (modern environments)
  if (typeof structuredClone !== 'undefined') {
    return structuredClone(obj);
  }
  // Fallback to JSON serialization for compatibility
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, or empty object)
 * @param value Value to check
 * @returns Boolean indicating if the value is empty
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  
  if (typeof value === 'string') {
    return value.trim().length === 0;
  }
  
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  
  return false;
}

/**
 * Truncates a string to a specified length with ellipsis
 * @param str String to truncate
 * @param maxLength Maximum length
 * @returns Truncated string
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  
  return str.substring(0, maxLength - 3) + '...';
}
