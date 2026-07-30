// components/shared/FieldError.tsx

/**
 * The error message under an input
 */
export default function FieldError({
  id,
  message,
}: {
  id: string;
  message: string | undefined;
}) {
  return (
    <p
      id={id}
      role="alert"
      className="mt-1 min-h-5 max-w-xs text-sm text-red-600 dark:text-red-400"
    >
      {message}
    </p>
  );
}
