export interface ValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

/**
 * Validates email format strictly.
 * Checks for RFC structure, '@' symbol, valid domain, and top-level domain (like .com, .in).
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: 'Email address is required.',
    };
  }

  if (!trimmed.includes('@')) {
    return {
      isValid: false,
      error: "Invalid email format! Missing '@' symbol. (e.g. user@gmail.com)",
    };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return {
      isValid: false,
      error: 'Invalid email format! Please enter a valid email address. (e.g. user@gmail.com)',
    };
  }

  const [username, domain] = parts;

  if (username.length < 1) {
    return {
      isValid: false,
      error: 'Username part of email is missing. (e.g. user@gmail.com)',
    };
  }

  if (!domain.includes('.')) {
    return {
      isValid: false,
      error: "Incomplete email address! Missing domain extension like '.com'. (e.g. user@gmail.com)",
    };
  }

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];

  if (!tld || tld.length < 2) {
    return {
      isValid: false,
      error: "Incomplete top-level domain extension. (e.g. '.com', '.org', '.in')",
    };
  }

  // Strict email regex matching standard format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Invalid email address! Please check for spaces or invalid characters. (e.g. user@gmail.com)',
    };
  }

  // Domain typo suggestions
  let suggestion: string | undefined;
  if (domain === 'gamil.com' || domain === 'gmai.com' || domain === 'gmail.co') {
    suggestion = `Did you mean ${username}@gmail.com?`;
  } else if (domain === 'yaho.com' || domain === 'yahoo.co') {
    suggestion = `Did you mean ${username}@yahoo.com?`;
  } else if (domain === 'hotmai.com' || domain === 'hotmail.co') {
    suggestion = `Did you mean ${username}@hotmail.com?`;
  }

  return {
    isValid: true,
    suggestion,
  };
}

/**
 * Validates password criteria.
 */
export function validatePassword(password: string, minLength = 6): ValidationResult {
  if (!password) {
    return {
      isValid: false,
      error: 'Password is required.',
    };
  }

  if (password.length < minLength) {
    return {
      isValid: false,
      error: `Password must be at least ${minLength} characters long.`,
    };
  }

  return { isValid: true };
}

/**
 * Validates signup details.
 */
export function validateSignUpData(data: {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}): ValidationResult {
  if (!data.name.trim()) {
    return {
      isValid: false,
      error: 'Full name is required.',
    };
  }

  const emailVal = validateEmail(data.email);
  if (!emailVal.isValid) {
    return emailVal;
  }

  const passwordVal = validatePassword(data.password, 6);
  if (!passwordVal.isValid) {
    return passwordVal;
  }

  if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
    return {
      isValid: false,
      error: 'Passwords do not match.',
    };
  }

  return { isValid: true, suggestion: emailVal.suggestion };
}

