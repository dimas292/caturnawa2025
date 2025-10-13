/**
 * Utility functions for handling number input with comma as decimal separator
 */

/**
 * Clean and validate number input string
 * @param input - Raw input string
 * @param maxDecimals - Maximum decimal places allowed (default: 2)
 * @returns Cleaned string ready for parsing
 */
export function cleanNumberInput(input: string, maxDecimals: number = 2): string {
  // Remove any non-numeric characters except comma and dot
  let cleaned = input.replace(/[^\d,\.]/g, '')
  
  // Replace dot with comma for consistency
  cleaned = cleaned.replace(/\./g, ',')
  
  // Ensure only one comma
  const parts = cleaned.split(',')
  if (parts.length > 2) {
    cleaned = parts[0] + ',' + parts.slice(1).join('')
  }
  
  // Limit decimal places
  if (parts.length === 2 && parts[1].length > maxDecimals) {
    cleaned = parts[0] + ',' + parts[1].substring(0, maxDecimals)
  }
  
  return cleaned
}

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
 * Smart formatting: removes unnecessary trailing zeros
 * @param value - Number to format
 * @param maxDecimals - Maximum decimal places (default: 2)
 * @returns Formatted string with comma as decimal separator
 */
export function formatCommaDecimal(value: number, maxDecimals: number = 2): string {
  if (value === 0 || isNaN(value)) return ''
  
  // Format with max decimals then remove trailing zeros
  const formatted = value.toFixed(maxDecimals)
  const withComma = formatted.replace('.', ',')
  
  // Remove trailing zeros: 75,00 -> 75, 75,50 -> 75,5, 75,25 -> 75,25
  return withComma.replace(/,0+$/, '').replace(/(,\d*[1-9])0+$/, '$1')
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

  // Check if the input is actually a valid number format
  const normalizedValue = value.replace(',', '.')
  const parsed = parseFloat(normalizedValue)

  // Return false if parsing resulted in NaN or if the original string wasn't a valid number
  if (isNaN(parsed)) return false

  return parsed >= min && parsed <= max
}