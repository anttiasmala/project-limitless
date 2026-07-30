// utils/passwordRules.ts

/**
 * The password policy, defined exactly once.
 *
 *
 * The maximum length is deliberately NOT a rule: it is a hard limit enforced by
 * the schema, and listing it as a checklist item people have to "satisfy" reads
 * as noise.
 */
export const PASSWORD_RULES = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (password: string) => password.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter',
    test: (password: string) => /[a-z]/.test(password),
  },
  {
    id: 'number',
    label: 'One number',
    test: (password: string) => /[0-9]/.test(password),
  },
  {
    id: 'special',
    label: 'One special character (#?!@$%^&*-)',
    test: (password: string) => /[#?!@$%^&*-]/.test(password),
  },
] as const;

export const PASSWORD_MAX_LENGTH = 128;
