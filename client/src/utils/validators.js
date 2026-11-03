/**
 * Frontend Validation Rules for Email and Password Complexity
 */

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email address is required.' };
  }

  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email format (e.g. name@college.edu).' };
  }

  if (trimmed.includes('..') || trimmed.startsWith('.') || trimmed.endsWith('.')) {
    return { isValid: false, error: 'Email contains invalid dot placements.' };
  }

  const domainParts = trimmed.split('@')[1]?.split('.') || [];
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2) {
    return { isValid: false, error: 'Email must end with a valid domain extension (e.g. .edu, .com, .in).' };
  }

  return { isValid: true, error: null };
};

export const getPasswordCriteria = (password = '') => {
  return [
    {
      id: 'length',
      label: 'At least 8 characters',
      met: password.length >= 8,
    },
    {
      id: 'uppercase',
      label: 'One uppercase letter (A-Z)',
      met: /[A-Z]/.test(password),
    },
    {
      id: 'lowercase',
      label: 'One lowercase letter (a-z)',
      met: /[a-z]/.test(password),
    },
    {
      id: 'number',
      label: 'One number (0-9)',
      met: /[0-9]/.test(password),
    },
    {
      id: 'special',
      label: 'One special symbol (!@#$%^&*)',
      met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password),
    },
  ];
};

export const evaluatePasswordStrength = (password = '') => {
  const criteria = getPasswordCriteria(password);
  const metCount = criteria.filter((c) => c.met).length;

  let strength = 'weak';
  let label = 'Weak';
  let color = 'bg-rose-500';
  let textColor = 'text-rose-600';
  let percentage = 20;

  if (metCount === 5) {
    strength = 'strong';
    label = 'Strong';
    color = 'bg-emerald-500';
    textColor = 'text-emerald-600';
    percentage = 100;
  } else if (metCount >= 4) {
    strength = 'good';
    label = 'Good';
    color = 'bg-teal-500';
    textColor = 'text-teal-600';
    percentage = 80;
  } else if (metCount >= 3) {
    strength = 'fair';
    label = 'Fair';
    color = 'bg-amber-500';
    textColor = 'text-amber-600';
    percentage = 60;
  } else if (metCount >= 2) {
    percentage = 40;
  }

  return {
    criteria,
    metCount,
    allMet: metCount === 5,
    strength,
    label,
    color,
    textColor,
    percentage,
  };
};
