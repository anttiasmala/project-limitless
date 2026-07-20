// Tailwind class strings for the XP control chrome, shared by every window so
// a button in one dialog can't quietly drift from a button in another.

export const XP_BUTTON =
  'min-w-18.75 cursor-pointer rounded-[3px] border border-[#003c74] bg-[linear-gradient(to_bottom,#fdfdfd_0%,#f0f0ea_45%,#e3e3db_50%,#eeeef2_100%)] px-4 py-0.5 text-xs shadow-[inset_0_0_0_1px_#fff] hover:border-[#0078d7] focus:outline-1 focus:outline-offset-[-3px] focus:outline-dotted active:bg-[linear-gradient(to_bottom,#e3e3db_0%,#eeeef2_100%)] disabled:cursor-default disabled:text-[#a0a0a0]';

export const XP_FIELD =
  'border border-[#7f9db9] bg-white px-1 py-0.5 text-xs focus:outline-none';

// The tick mark comes from a background image so the box keeps XP's flat border.
export const XP_CHECKBOX =
  'h-3.5 w-3.5 shrink-0 cursor-pointer appearance-none border border-[#7f9db9] bg-white bg-size-[11px_11px] bg-center bg-no-repeat checked:bg-[url(/images/index-page/clock/checkbox.svg)]';
