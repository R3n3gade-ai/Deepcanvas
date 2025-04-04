/**
 * Validates an email address
 * @param email Email address to validate
 * @returns Error message if invalid, empty string if valid
 */
export function validateEmail(email: string): string {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!email) {
    return 'Email is required';
  }
  if (!emailRegex.test(email)) {
    return 'Invalid email address';
  }
  return '';
}

/**
 * Validates required fields in an object
 * @param values Object containing form values
 * @param requiredFields Array of field names that are required
 * @returns Object with field names as keys and error messages as values
 */
export function validateRequired(values: any, requiredFields: string[]): Record<string, string> {
  const errors: Record<string, string> = {};
  
  requiredFields.forEach(field => {
    if (!values[field]) {
      errors[field] = 'This field is required';
    }
  });
  
  return errors;
}
