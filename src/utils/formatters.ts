/**
 * Helper to display shipment values according to Google Sheets spec.
 * If any field is empty, null, undefined, or whitespace only, return "--".
 * Note: "--" is purely for display and must never be saved to the backend.
 */
export function displayVal(val: any): string {
  if (val === undefined || val === null) return '--';
  const str = String(val).trim();
  return str === '' ? '--' : String(val);
}

/**
 * Parses any supported date input (Date object, dd/mm/yyyy, yyyy-mm-dd, ISO string)
 * into a consistent local JavaScript Date object (midnight local time) without timezone shift.
 */
export function parseDateValue(val?: string | Date | null): Date | null {
  if (!val) return null;
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : new Date(val.getFullYear(), val.getMonth(), val.getDate());
  }

  const str = String(val).trim();
  if (!str || str === '--') return null;

  // If in dd/mm/yyyy or d/m/yyyy or dd-mm-yyyy format
  const dmyMatch = str.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1; // 0-indexed
    const year = parseInt(dmyMatch[3], 10);

    const parsed = new Date(year, month, day);
    if (
      parsed.getFullYear() === year &&
      parsed.getMonth() === month &&
      parsed.getDate() === day
    ) {
      return parsed;
    }
  }

  // If in YYYY-MM-DD or YYYY/MM/DD format
  const ymdMatch = str.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);

    const parsed = new Date(year, month, day);
    if (
      parsed.getFullYear() === year &&
      parsed.getMonth() === month &&
      parsed.getDate() === day
    ) {
      return parsed;
    }
  }

  // Fallback parsing
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Format a Date object or valid date representation as dd/mm/yyyy.
 * Returns empty string if invalid or empty.
 */
export function formatDateToDMY(val?: string | Date | null): string {
  const parsed = parseDateValue(val);
  if (!parsed) return '';
  const day = String(parsed.getDate()).padStart(2, '0');
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const year = parsed.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format date for display as (dd/mm/yyyy) or return "--" if empty.
 */
export function formatDate(val?: string | Date | null): string {
  if (!val) return '--';
  const str = String(val).trim();
  if (!str || str === '--') return '--';

  const dmy = formatDateToDMY(val);
  return dmy || str;
}

/**
 * Helper to format date into YYYY-MM-DD for HTML inputs if needed.
 */
export function toInputDateFormat(val?: string | Date | null): string {
  const parsed = parseDateValue(val);
  if (!parsed) return '';
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date for Google Sheet submission as dd/mm/yyyy
 */
export function formatDateForSheet(val?: string | Date | null): string {
  return formatDateToDMY(val);
}

/**
 * Format price for display or return "--" if empty.
 */
export function formatPrice(val?: string | number | null): string {
  if (val === undefined || val === null || String(val).trim() === '') return '--';
  if (typeof val === 'number') {
    return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  const clean = String(val).replace(/[^0-9.-]+/g, '');
  const num = parseFloat(clean);
  if (!isNaN(num) && clean !== '') {
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return String(val);
}

/**
 * Parses any timestamp representation safely into a Date object.
 * Handles ISO strings, Google Sheets formatted strings, date/time combinations, etc.
 */
export function parseTimestamp(val?: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  const str = String(val).trim();
  if (!str || str === '--') return null;

  // Try standard Date constructor first (ISO, standard formats)
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d;
  }

  // Handle dd/mm/yyyy or dd-mm-yyyy with optional time
  const dmyTimeMatch = str.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (dmyTimeMatch) {
    const day = parseInt(dmyTimeMatch[1], 10);
    const month = parseInt(dmyTimeMatch[2], 10) - 1;
    const year = parseInt(dmyTimeMatch[3], 10);
    const hours = dmyTimeMatch[4] ? parseInt(dmyTimeMatch[4], 10) : 0;
    const minutes = dmyTimeMatch[5] ? parseInt(dmyTimeMatch[5], 10) : 0;
    const seconds = dmyTimeMatch[6] ? parseInt(dmyTimeMatch[6], 10) : 0;
    const parsed = new Date(year, month, day, hours, minutes, seconds);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  // Handle YYYY-MM-DD or YYYY/MM/DD with optional time
  const ymdTimeMatch = str.match(/^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (ymdTimeMatch) {
    const year = parseInt(ymdTimeMatch[1], 10);
    const month = parseInt(ymdTimeMatch[2], 10) - 1;
    const day = parseInt(ymdTimeMatch[3], 10);
    const hours = ymdTimeMatch[4] ? parseInt(ymdTimeMatch[4], 10) : 0;
    const minutes = ymdTimeMatch[5] ? parseInt(ymdTimeMatch[5], 10) : 0;
    const seconds = ymdTimeMatch[6] ? parseInt(ymdTimeMatch[6], 10) : 0;
    const parsed = new Date(year, month, day, hours, minutes, seconds);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  return null;
}

/**
 * Formats a timestamp into human-readable date, time, and full string.
 */
export function formatTimestampDisplay(val?: any): { date: string; time: string; full: string } {
  if (!val) return { date: '--', time: '--', full: '--' };
  const d = parseTimestamp(val);
  if (!d) {
    const raw = String(val).trim();
    return { date: raw || '--', time: '', full: raw || '--' };
  }

  const day = String(d.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthStr = monthNames[d.getMonth()] || String(d.getMonth() + 1);
  const year = d.getFullYear();
  const dateStr = `${day} ${monthStr} ${year}`;

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  return {
    date: dateStr,
    time: timeStr,
    full: `${dateStr}, ${timeStr}`,
  };
}

/**
 * Check if a timestamp falls within fromDate and toDate (inclusive).
 * Dates in YYYY-MM-DD or dd/mm/yyyy.
 */
export function isTimestampInRange(
  timestampVal?: any,
  fromDateStr?: string,
  toDateStr?: string
): boolean {
  if (!fromDateStr && !toDateStr) return true;
  const targetDate = parseTimestamp(timestampVal);
  if (!targetDate) return true; // Keep if unparseable to avoid hiding data

  const targetTime = targetDate.getTime();

  if (fromDateStr) {
    const fromDate = parseDateValue(fromDateStr);
    if (fromDate) {
      fromDate.setHours(0, 0, 0, 0);
      if (targetTime < fromDate.getTime()) return false;
    }
  }

  if (toDateStr) {
    const toDate = parseDateValue(toDateStr);
    if (toDate) {
      toDate.setHours(23, 59, 59, 999);
      if (targetTime > toDate.getTime()) return false;
    }
  }

  return true;
}
