/**
 * Unit tests for IP Validator utility
 */

const {
  normalizeIP,
  isLocalhost,
  isPrivateIP,
  determineLookupIP,
} = require('../../../src/utils/ip-validator');

describe('IPValidator', () => {
  describe('normalizeIP', () => {
    it('should normalize IPv6-mapped IPv4 addresses', () => {
      expect(normalizeIP('::ffff:192.168.1.1')).toBe('192.168.1.1');
      expect(normalizeIP('::ffff:127.0.0.1')).toBe('127.0.0.1');
      expect(normalizeIP('::ffff:8.8.8.8')).toBe('8.8.8.8');
    });

    it('should return IPv4 addresses unchanged', () => {
      expect(normalizeIP('192.168.1.1')).toBe('192.168.1.1');
      expect(normalizeIP('127.0.0.1')).toBe('127.0.0.1');
      expect(normalizeIP('8.8.8.8')).toBe('8.8.8.8');
    });

    it('should return IPv6 addresses unchanged', () => {
      expect(normalizeIP('::1')).toBe('::1');
      expect(normalizeIP('2001:db8::1')).toBe('2001:db8::1');
    });

    it('should handle null and undefined', () => {
      expect(normalizeIP(null)).toBeNull();
      expect(normalizeIP(undefined)).toBeUndefined();
      expect(normalizeIP('')).toBe('');
    });
  });

  describe('isLocalhost', () => {
    it('should detect localhost IPv4 addresses', () => {
      expect(isLocalhost('127.0.0.1')).toBe(true);
      expect(isLocalhost('127.1.2.3')).toBe(true);
      expect(isLocalhost('127.255.255.255')).toBe(true);
    });

    it('should detect localhost IPv6 address', () => {
      expect(isLocalhost('::1')).toBe(true);
    });

    it('should return false for non-localhost addresses', () => {
      expect(isLocalhost('192.168.1.1')).toBe(false);
      expect(isLocalhost('8.8.8.8')).toBe(false);
      expect(isLocalhost('10.0.0.1')).toBe(false);
    });

    it('should handle null and undefined', () => {
      expect(isLocalhost(null)).toBe(false);
      expect(isLocalhost(undefined)).toBe(false);
      expect(isLocalhost('')).toBe(false);
    });
  });

  describe('isPrivateIP', () => {
    it('should detect 10.x.x.x private IPs', () => {
      expect(isPrivateIP('10.0.0.1')).toBe(true);
      expect(isPrivateIP('10.255.255.255')).toBe(true);
      expect(isPrivateIP('10.1.2.3')).toBe(true);
    });

    it('should detect 192.168.x.x private IPs', () => {
      expect(isPrivateIP('192.168.0.1')).toBe(true);
      expect(isPrivateIP('192.168.1.1')).toBe(true);
      expect(isPrivateIP('192.168.255.255')).toBe(true);
    });

    it('should detect 172.16-31.x.x private IPs', () => {
      expect(isPrivateIP('172.16.0.1')).toBe(true);
      expect(isPrivateIP('172.31.255.255')).toBe(true);
      expect(isPrivateIP('172.20.1.1')).toBe(true);
    });

    it('should return false for non-private 172.x.x.x addresses', () => {
      expect(isPrivateIP('172.15.0.1')).toBe(false);
      expect(isPrivateIP('172.32.0.1')).toBe(false);
    });

    it('should return false for public IPs', () => {
      expect(isPrivateIP('8.8.8.8')).toBe(false);
      expect(isPrivateIP('1.1.1.1')).toBe(false);
      expect(isPrivateIP('151.101.1.140')).toBe(false);
    });

    it('should handle null and undefined', () => {
      expect(isPrivateIP(null)).toBe(false);
      expect(isPrivateIP(undefined)).toBe(false);
      expect(isPrivateIP('')).toBe(false);
    });
  });

  describe('determineLookupIP', () => {
    it('should normalize and identify localhost IPv4', () => {
      const result = determineLookupIP('127.0.0.1');
      expect(result).toEqual({
        normalizedIP: '127.0.0.1',
        isLocalhost: true,
        isPrivate: false,
        lookupIP: '',
      });
    });

    it('should normalize and identify localhost IPv6', () => {
      const result = determineLookupIP('::1');
      expect(result).toEqual({
        normalizedIP: '::1',
        isLocalhost: true,
        isPrivate: false,
        lookupIP: '',
      });
    });

    it('should normalize and identify IPv6-mapped localhost', () => {
      const result = determineLookupIP('::ffff:127.0.0.1');
      expect(result).toEqual({
        normalizedIP: '127.0.0.1',
        isLocalhost: true,
        isPrivate: false,
        lookupIP: '',
      });
    });

    it('should normalize and identify private IPs', () => {
      const result1 = determineLookupIP('10.0.0.1');
      expect(result1).toEqual({
        normalizedIP: '10.0.0.1',
        isLocalhost: false,
        isPrivate: true,
        lookupIP: '',
      });

      const result2 = determineLookupIP('192.168.1.1');
      expect(result2).toEqual({
        normalizedIP: '192.168.1.1',
        isLocalhost: false,
        isPrivate: true,
        lookupIP: '',
      });

      const result3 = determineLookupIP('172.16.0.1');
      expect(result3).toEqual({
        normalizedIP: '172.16.0.1',
        isLocalhost: false,
        isPrivate: true,
        lookupIP: '',
      });
    });

    it('should normalize and identify IPv6-mapped private IPs', () => {
      const result = determineLookupIP('::ffff:192.168.1.1');
      expect(result).toEqual({
        normalizedIP: '192.168.1.1',
        isLocalhost: false,
        isPrivate: true,
        lookupIP: '',
      });
    });

    it('should handle public IPs', () => {
      const result = determineLookupIP('8.8.8.8');
      expect(result).toEqual({
        normalizedIP: '8.8.8.8',
        isLocalhost: false,
        isPrivate: false,
        lookupIP: '8.8.8.8',
      });
    });

    it('should normalize IPv6-mapped public IPs', () => {
      const result = determineLookupIP('::ffff:8.8.8.8');
      expect(result).toEqual({
        normalizedIP: '8.8.8.8',
        isLocalhost: false,
        isPrivate: false,
        lookupIP: '8.8.8.8',
      });
    });
  });
});
