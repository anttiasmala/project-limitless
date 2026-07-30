// components/register/PasswordChecklist.tsx

import { PASSWORD_RULES } from '@/utils/passwordRules';

/**
 * Live ✓/✗ list of the password policy. Rendered from PASSWORD_RULES, the same
 * array `passwordSchema` is built from, so this can never show a rule the
 * schema doesn't check (or hide one it does).
 */
export default function PasswordChecklist({
  id,
  password,
}: {
  id: string;
  password: string;
}) {
  return (
    <ul id={id} className="mt-2 flex flex-col gap-0.5 text-xs">
      {PASSWORD_RULES.map((rule) => {
        const isMet = rule.test(password);
        return (
          <li
            key={rule.id}
            className={
              isMet
                ? 'text-green-600 dark:text-green-400'
                : 'text-slate-500 dark:text-slate-400'
            }
          >
            <span aria-hidden>{isMet ? '✓' : '✗'}</span>{' '}
            {/* Screen readers get the status as words. The icons above are
                announced inconsistently, and color alone carries no meaning. */}
            <span className="sr-only">{isMet ? 'Met:' : 'Not met:'}</span>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
