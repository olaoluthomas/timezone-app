/**
 * Date Formatter Utility Module
 *
 * Provides timezone-aware date formatting utilities.
 *
 * Features:
 * - Formats dates in specific timezones
 * - Consistent DateTimeFormat configuration
 * - Comprehensive date/time components
 *
 * @module utils/date-formatter
 */

/**
 * Format current date/time in specified timezone
 * @param {string} timezone - IANA timezone identifier (e.g., 'America/Los_Angeles')
 * @returns {string} Formatted date string
 *
 * @example
 * formatTimezone('America/Los_Angeles');
 * // 'Wednesday, February 10, 2026 at 04:30:00'
 *
 * formatTimezone('Europe/London');
 * // 'Wednesday, February 10, 2026 at 12:30:00'
 *
 * @throws {RangeError} If timezone is invalid
 */
function formatTimezone(timezone) {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return formatter.format(now);
}

module.exports = {
  formatTimezone,
};
