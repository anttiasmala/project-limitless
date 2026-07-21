export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// XP's calendar weeks start on Sunday.
export const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// A short list of the zones XP showed, enough to make the tab feel real.
// The offset is what actually moves the clock when applied.
export const TIME_ZONES: { hours: number; label: string }[] = [
  { hours: -8, label: '(GMT-08:00) Pacific Time (US & Canada)' },
  { hours: -5, label: '(GMT-05:00) Eastern Time (US & Canada)' },
  { hours: 0, label: '(GMT) Greenwich Mean Time : Dublin, London' },
  { hours: 1, label: '(GMT+01:00) Amsterdam, Berlin, Rome, Stockholm' },
  { hours: 2, label: '(GMT+02:00) Helsinki, Kyiv, Riga, Sofia' },
  { hours: 3, label: '(GMT+03:00) Moscow, St. Petersburg, Volgograd' },
  { hours: 5.5, label: '(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi' },
  { hours: 9, label: '(GMT+09:00) Osaka, Sapporo, Tokyo' },
  { hours: 10, label: '(GMT+10:00) Canberra, Melbourne, Sydney' },
];

export const TIME_SERVERS = ['time.windows.com', 'time.nist.gov'] as const;

export type TimeServer = (typeof TIME_SERVERS)[number];

export const pad = (value: number) => value.toString().padStart(2, '0');
