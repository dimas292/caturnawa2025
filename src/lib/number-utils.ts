/**
 * Utility functions for handling number input with comma as decimal separator
 */

/**
 * Parse number input that can use either comma or dot as decimal separator
 * @param value - Input string value
 * @returns Parsed number or 0 if invalid
 */
export function parseCommaDecimal(value: string): number {
  if (!value || value.trim() === '') return 0
  
  // Replace comma with dot for parsing
  const normalizedValue = value.replace(',', '.')
  const parsed = parseFloat(normalizedValue)
  
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Format number for display, using comma as decimal separator
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with comma as decimal separator
 */
export function formatCommaDecimal(value: number, decimals: number = 1): string {
  if (value === 0 || isNaN(value)) return ''
  
  return value.toFixed(decimals).replace('.', ',')
}

/**
 * Validate if input string is a valid decimal number (with comma support)
 * @param value - Input string to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns true if valid, false otherwise
 */
export function isValidDecimalInput(value: string, min: number = 0, max: number = 100): boolean {
  if (!value || value.trim() === '') return false
  
  const parsed = parseCommaDecimal(value)
  return !isNaN(parsed) && parsed >= min && parsed <= max
}