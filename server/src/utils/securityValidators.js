/**
 * CareerFit Security Validation Utilities
 * Enforces strong email format and password complexity rules.
 */

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email address is required.' };
  }

  const trimmed = email.trim().toLowerCase();

  if (trimmed.length > 254) {
    return { isValid: false, error: 'Email address cannot exceed 254 characters.' };
  }

  // RFC 5322 compliant regex requiring valid domain and at least 2-char TLD
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please provide a valid email address (e.g. name@college.edu).' };
  }

  // Disallow consecutive dots or leading/trailing dots in local or domain part
  if (trimmed.includes('..') || trimmed.startsWith('.') || trimmed.endsWith('.')) {
    return { isValid: false, error: 'Email contains invalid dot placements.' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Malformed email structure.' };
  }

  const [local, domain] = parts;
  if (local.length > 64) {
    return { isValid: false, error: 'Email username cannot exceed 64 characters.' };
  }

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
    return { isValid: false, error: 'Email must end with a valid domain extension (e.g. .edu, .com, .in).' };
  }

  return { isValid: true, normalizedEmail: trimmed, error: null };
};

export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      score: 0,
      strength: 'weak',
      errors: ['Password is required.'],
    };
  }

  const errors = [];
  let score = 0;

  // Rule 1: Length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  } else if (password.length > 128) {
    errors.push('Password cannot exceed 128 characters.');
  } else {
    score += 1;
  }

  // Rule 2: Uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z).');
  } else {
    score += 1;
  }

  // Rule 3: Lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z).');
  } else {
    score += 1;
  }

  // Rule 4: Number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number (0-9).');
  } else {
    score += 1;
  }

  // Rule 5: Special character
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    errors.push('Password must contain at least one special character (e.g. !@#$%^&*).');
  } else {
    score += 1;
  }

  // Additional check: Disallow common trivial passwords
  const commonTrivial = ['password', '12345678', 'qwertyui', 'careerfit', 'admin123'];
  const lower = password.toLowerCase();
  for (const trivial of commonTrivial) {
    if (lower === trivial) {
      errors.push('Password is too common or easily guessable.');
      score = Math.max(0, score - 2);
      break;
    }
  }

  let strength = 'weak';
  if (score >= 4 && errors.length === 0) {
    strength = 'strong';
  } else if (score >= 3) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    score,
    strength,
    errors,
  };
};
