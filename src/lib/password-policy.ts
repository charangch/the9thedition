import type { GetPublicAuthConfigResponse } from "@insforge/shared-schemas";

/** Defaults when public config is unavailable (stricter UX; server still enforces InsForge rules). */
export function defaultPasswordPolicy(): Pick<
  GetPublicAuthConfigResponse,
  | "passwordMinLength"
  | "requireNumber"
  | "requireLowercase"
  | "requireUppercase"
  | "requireSpecialChar"
> {
  return {
    passwordMinLength: 8,
    requireNumber: true,
    requireLowercase: true,
    requireUppercase: true,
    requireSpecialChar: true,
  };
}

export type PasswordPolicy = ReturnType<typeof defaultPasswordPolicy>;

export function policyFromPublicConfig(
  config: GetPublicAuthConfigResponse | null | undefined,
): PasswordPolicy {
  if (!config) {
    return defaultPasswordPolicy();
  }
  return {
    passwordMinLength: Math.max(8, config.passwordMinLength),
    requireNumber: config.requireNumber,
    requireLowercase: config.requireLowercase,
    requireUppercase: config.requireUppercase,
    requireSpecialChar: config.requireSpecialChar,
  };
}

/**
 * Returns `null` if valid, otherwise a short user-facing message.
 */
export function validatePassword(password: string, policy: PasswordPolicy): string | null {
  if (password.length < policy.passwordMinLength) {
    return `Use at least ${policy.passwordMinLength} characters.`;
  }
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    return "Include at least one uppercase letter.";
  }
  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    return "Include at least one lowercase letter.";
  }
  if (policy.requireNumber && !/\d/.test(password)) {
    return "Include at least one number.";
  }
  if (policy.requireSpecialChar && !/[^A-Za-z0-9]/.test(password)) {
    return "Include at least one special character (for example !@#$%).";
  }
  return null;
}

export function describePasswordRules(policy: PasswordPolicy): string {
  const parts: string[] = [`${policy.passwordMinLength}+ characters`];
  if (policy.requireUppercase) parts.push("one uppercase letter");
  if (policy.requireLowercase) parts.push("one lowercase letter");
  if (policy.requireNumber) parts.push("one number");
  if (policy.requireSpecialChar) parts.push("one special character");
  return parts.join(", ");
}
