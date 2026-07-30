// utils/focusFirstInvalidField.ts

/**
 * Moves focus to the first field that has a message, in rendering order, so a
 * keyboard user isn't left at the submit button hunting for what went wrong.
 *
 * `fieldOrder` doubles as the list of element ids: every form here gives its
 * inputs an id equal to the field name.
 */
export function focusFirstInvalidField<Field extends string>(
  fieldOrder: readonly Field[],
  errors: Partial<Record<Field, string>>,
) {
  const firstInvalid = fieldOrder.find((field) => errors[field] !== undefined);
  if (firstInvalid) document.getElementById(firstInvalid)?.focus();
}
