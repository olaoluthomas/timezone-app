/**
 * Unit tests for Date Formatter utility
 */

const { formatTimezone } = require('../../../src/utils/date-formatter');

describe('DateFormatter', () => {
  describe('formatTimezone', () => {
    it('should format date in America/Los_Angeles timezone', () => {
      const result = formatTimezone('America/Los_Angeles');

      // Check format structure (day, month date, year at time)
      expect(result).toMatch(/^\w+, \w+ \d{1,2}, \d{4} at \d{2}:\d{2}:\d{2}$/);
      expect(result).toContain(',');
      expect(result).toContain('at');
    });

    it('should format date in Europe/London timezone', () => {
      const result = formatTimezone('Europe/London');

      expect(result).toMatch(/^\w+, \w+ \d{1,2}, \d{4} at \d{2}:\d{2}:\d{2}$/);
      expect(result).toContain(',');
      expect(result).toContain('at');
    });

    it('should format date in Asia/Tokyo timezone', () => {
      const result = formatTimezone('Asia/Tokyo');

      expect(result).toMatch(/^\w+, \w+ \d{1,2}, \d{4} at \d{2}:\d{2}:\d{2}$/);
      expect(result).toContain(',');
      expect(result).toContain('at');
    });

    it('should format date in UTC timezone', () => {
      const result = formatTimezone('UTC');

      expect(result).toMatch(/^\w+, \w+ \d{1,2}, \d{4} at \d{2}:\d{2}:\d{2}$/);
      expect(result).toContain(',');
      expect(result).toContain('at');
    });

    it('should include all date components', () => {
      const result = formatTimezone('America/New_York');

      // Should include: weekday, month, day, year, hour, minute, second
      expect(result).toMatch(/\w+/); // weekday
      expect(result).toMatch(/\w+/); // month
      expect(result).toMatch(/\d{1,2}/); // day
      expect(result).toMatch(/\d{4}/); // year
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/); // time (HH:MM:SS)
    });

    it('should use 24-hour time format', () => {
      const result = formatTimezone('America/Los_Angeles');

      // Should NOT contain AM/PM
      expect(result).not.toContain('AM');
      expect(result).not.toContain('PM');

      // Should have time in HH:MM:SS format
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('should throw error for invalid timezone', () => {
      expect(() => formatTimezone('Invalid/Timezone')).toThrow(RangeError);
      expect(() => formatTimezone('Not_A_Real_Place')).toThrow(RangeError);
    });

    it('should handle timezone with underscores', () => {
      const result = formatTimezone('America/New_York');
      expect(result).toMatch(/^\w+, \w+ \d{1,2}, \d{4} at \d{2}:\d{2}:\d{2}$/);
    });
  });
});
