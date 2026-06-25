const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string): string | undefined {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return "Email is required.";
  }
  if (!EMAIL_RE.test(normalized)) {
    return "Enter a valid email address.";
  }
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) {
    return "Password is required.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  return undefined;
}

export function validateSignupPasswords(
  password: string,
  confirmPassword: string,
): string | undefined {
  const passwordError = validatePassword(password);
  if (passwordError) {
    return passwordError;
  }
  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }
  return undefined;
}
