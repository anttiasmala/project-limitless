import z from 'zod';
import { PASSWORD_MAX_LENGTH, PASSWORD_RULES } from './passwordRules';

// Register
const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters long')
  .max(30, 'Username can be at max 30 characters long')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username can only contain letters, numbers, _ and -',
  );

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is mandatory!')
  .max(128, 'Email can be at max 128 characters long')
  // The format check is a refinement rather than `z.email().min(1)` so the
  // checks stay in this order: an empty field reports "Email is mandatory!"
  // first, instead of the less helpful "Email is invalid".
  .refine((email) => z.email().safeParse(email).success, 'Email is invalid')
  .transform((email) => email.toLowerCase());

const passwordSchema = z
  .string()
  .min(1, 'Password is mandatory!')
  .max(
    PASSWORD_MAX_LENGTH,
    `Password can be at max ${PASSWORD_MAX_LENGTH} characters long`,
  )
  // Which individual rule failed is shown by the checklist under the field, so
  // this only needs to say that something is missing.
  .refine(
    (password) => PASSWORD_RULES.every((rule) => rule.test(password)),
    'Password does not meet all of the requirements below',
  );

export const registerSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/** What the form holds while typing - before trimming/lowercasing. */
export type RegisterFormData = z.input<typeof registerSchema>;

/** What a successful parse produces - this is what gets submitted. */
export type RegisterInput = z.output<typeof registerSchema>;

export type RegisterFieldName = keyof RegisterFormData;

/** Rendering order, also used to focus the first invalid field on submit. */
export const REGISTER_FIELD_ORDER = [
  'username',
  'email',
  'password',
  'confirmPassword',
] as const satisfies readonly RegisterFieldName[];

export type RegisterFieldErrors = Partial<Record<RegisterFieldName, string>>;

/**
 * Runs the schema and converts the result into one message per field (the first
 * issue, since that is all there is room to show). Returns an empty object when
 * the data is valid
 */
export function collectRegisterErrors(
  formData: RegisterFormData,
): RegisterFieldErrors {
  const result = registerSchema.safeParse(formData);
  if (result.success) return {};

  const errorTree = z.treeifyError(result.error);
  const errors: RegisterFieldErrors = {};

  for (const field of REGISTER_FIELD_ORDER) {
    const message = errorTree.properties?.[field]?.errors[0];
    if (message) errors[field] = message;
  }

  return errors;
}

// Login
//
// Deliberately looser than the register schema: the rules an account was
// created under may not be today's rules, and telling somebody their password
// is "too short" at the login screen only leaks what is stored. Both fields
// just have to be filled in - whether they are correct is the server's answer.
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is mandatory!'),
});

/** What the form holds while typing - before trimming/lowercasing. */
export type LoginFormData = z.input<typeof loginSchema>;

/** What a successful parse produces - this is what gets submitted. */
export type LoginInput = z.output<typeof loginSchema>;

export type LoginFieldName = keyof LoginFormData;

/** Rendering order, also used to focus the first invalid field on submit. */
export const LOGIN_FIELD_ORDER = [
  'email',
  'password',
] as const satisfies readonly LoginFieldName[];

export type LoginFieldErrors = Partial<Record<LoginFieldName, string>>;

/** The login counterpart of {@link collectRegisterErrors}. */
export function collectLoginErrors(formData: LoginFormData): LoginFieldErrors {
  const result = loginSchema.safeParse(formData);
  if (result.success) return {};

  const errorTree = z.treeifyError(result.error);
  const errors: LoginFieldErrors = {};

  for (const field of LOGIN_FIELD_ORDER) {
    const message = errorTree.properties?.[field]?.errors[0];
    if (message) errors[field] = message;
  }

  return errors;
}
