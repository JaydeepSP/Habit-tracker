/**
 * Returns today's date formatted as YYYY-MM-DD
 * @param {string} timezone - optional user timezone (default UTC)
 */
export const getTodayString = (timezone = 'UTC') => {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date()); // Formats as YYYY-MM-DD
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
};

/**
 * Format any Date object to YYYY-MM-DD
 */
export const formatDateString = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

/**
 * Get date string offset by days (positive or negative)
 */
export const getDateOffset = (dateStr, daysOffset) => {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

/**
 * Get Day of week for a YYYY-MM-DD string: 0 = Sun, 1 = Mon, ..., 6 = Sat
 */
export const getDayOfWeek = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00Z');
  return d.getUTCDay();
};

/**
 * Generates an array of date strings between start and end (inclusive)
 */
export const getDateRange = (startDateStr, endDateStr) => {
  const dates = [];
  let current = startDateStr;
  while (current <= endDateStr) {
    dates.push(current);
    current = getDateOffset(current, 1);
  }
  return dates;
};
