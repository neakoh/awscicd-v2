const validator = require('validator');

const sanitizeInput = (input) => {
  // Handle numeric values
  if (typeof input === 'number') {
    return input;
  }

  // Handle null, undefined, or empty values
  if (input == null || input === '') {
    return '';
  }

  // Convert input to string if it's not already
  const stringInput = String(input);

  // Remove unwanted characters (keep only letters)
  let sanitized = stringInput.replace(/[^A-Za-z0-9\s-_@.!]/g, '');
  
  // Escape HTML characters
  sanitized = validator.escape(sanitized);
  
  return sanitized;
}

module.exports = {sanitizeInput}