/**
 * IP Validator Utility Module
 *
 * Provides IP address validation and normalization utilities.
 *
 * Features:
 * - IPv6-mapped IPv4 normalization (::ffff:x.x.x.x → x.x.x.x)
 * - Localhost detection (127.0.0.1, ::1, 127.x.x.x)
 * - Private IP detection (RFC 1918: 10.x, 192.168.x, 172.16-31.x)
 * - Lookup IP determination (public IP or empty string for server IP)
 *
 * @module utils/ip-validator
 */

/**
 * Normalize IP address from IPv6-mapped IPv4 format to pure IPv4
 * @param {string} ip - IP address (may be IPv4, IPv6, or IPv4-mapped IPv6)
 * @returns {string} Normalized IP address
 *
 * @example
 * normalizeIP('::ffff:192.168.1.1'); // '192.168.1.1'
 * normalizeIP('127.0.0.1');          // '127.0.0.1'
 * normalizeIP('2001:db8::1');        // '2001:db8::1'
 */
function normalizeIP(ip) {
  if (!ip) return ip;

  // Check if this is an IPv4-mapped IPv6 address (::ffff:x.x.x.x)
  if (ip.startsWith('::ffff:')) {
    // Extract the IPv4 part (everything after ::ffff:)
    return ip.substring(7);
  }

  return ip;
}

/**
 * Check if IP address is localhost
 * @param {string} ip - Normalized IP address
 * @returns {boolean} True if IP is localhost
 *
 * @example
 * isLocalhost('127.0.0.1');   // true
 * isLocalhost('127.1.2.3');   // true
 * isLocalhost('::1');         // true
 * isLocalhost('192.168.1.1'); // false
 */
function isLocalhost(ip) {
  if (!ip) return false;
  return ip === '::1' || ip === '127.0.0.1' || ip.startsWith('127.');
}

/**
 * Check if IP address is a private IP (RFC 1918)
 * @param {string} ip - Normalized IP address
 * @returns {boolean} True if IP is private
 *
 * @example
 * isPrivateIP('10.0.0.1');      // true
 * isPrivateIP('192.168.1.1');   // true
 * isPrivateIP('172.16.0.1');    // true
 * isPrivateIP('172.31.255.255'); // true
 * isPrivateIP('172.15.0.1');    // false (not in RFC 1918 range)
 * isPrivateIP('8.8.8.8');       // false
 */
function isPrivateIP(ip) {
  if (!ip) return false;

  // Check RFC 1918 private IP ranges:
  // - 10.0.0.0/8      (10.0.0.0 - 10.255.255.255)
  // - 172.16.0.0/12   (172.16.0.0 - 172.31.255.255)
  // - 192.168.0.0/16  (192.168.0.0 - 192.168.255.255)
  return (
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./) !== null
  );
}

/**
 * Determine the lookup IP for geolocation API
 * Returns empty string for localhost/private IPs (uses server's public IP)
 * Returns the IP for public IPs
 *
 * @param {string} ip - Original IP address (may be IPv6-mapped)
 * @returns {Object} Validation result with normalized IP and lookup IP
 *
 * @example
 * determineLookupIP('::ffff:127.0.0.1');
 * // { normalizedIP: '127.0.0.1', isLocalhost: true, isPrivate: false, lookupIP: '' }
 *
 * determineLookupIP('8.8.8.8');
 * // { normalizedIP: '8.8.8.8', isLocalhost: false, isPrivate: false, lookupIP: '8.8.8.8' }
 */
function determineLookupIP(ip) {
  // Normalize IPv6-mapped IPv4 addresses
  const normalizedIP = normalizeIP(ip);

  // Check if IP is localhost or private
  const localhost = isLocalhost(normalizedIP);
  const privateIP = isPrivateIP(normalizedIP);

  // For localhost/private IPs, use empty string (server's public IP)
  const lookupIP = localhost || privateIP ? '' : normalizedIP;

  return {
    normalizedIP,
    isLocalhost: localhost,
    isPrivate: privateIP,
    lookupIP,
  };
}

module.exports = {
  normalizeIP,
  isLocalhost,
  isPrivateIP,
  determineLookupIP,
};
