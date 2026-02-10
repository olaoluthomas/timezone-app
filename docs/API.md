# API Documentation

## Overview

This document provides comprehensive details about the timezone application's API endpoints, including request/response formats, fields, and usage examples.

## Endpoints

### GET `/api/timezone`

Returns timezone and location information for the requesting IP address.

**Request**:
- None (GET request)

**Response**:
```json
{
  "ip": "203.0.113.42",
  "city": "New York",
  "region": "New York",
  "country": "United States",
  "countryCode": "US",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "timezone": "America/New_York",
  "utcOffset": "-0500",
  "currentTime": "Wednesday, January 22, 2026, 14:35:42",
  "timestamp": "2026-01-22T19:35:42.123Z",
  "cached": false
}
```

**Fields**:
- `ip`: The user's public IP address
- `city`: City name
- `region`: Region name
- `country`: Country name
- `countryCode`: ISO country code (e.g., US)
- `latitude`: Latitude in degrees
- `longitude`: Longitude in degrees
- `timezone`: IANA timezone identifier (e.g., America/New_York)
- `utcOffset`: Timezone offset from UTC (e.g., -0500)
- `currentTime`: Formatted local time in the detected timezone
- `timestamp`: ISO 8601 timestamp of the response
- `cached`: `true` if served from cache, `false` if fetched from API

**Example Response (Cached)**:
```json
{
  "ip": "203.0.113.42",
  "city": "New York",
  "region": "New York",
  "country": "United States",
  "countryCode": "US",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "timezone": "America/New_York",
  "utcOffset": "-0500",
  "currentTime": "Wednesday, January 22, 2026, 14:36:15",
  "timestamp": "2026-01-22T19:36:15.123Z",
  "cached": true
}
```

### GET `/health`

Liveness probe - returns basic health status.

**Request**:
- None (GET request)

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-01-22T19:35:42.123Z",
  "uptime": 3600.5
}
```

**Fields**:
- `status`: Health status (`ok` means healthy)
- `timestamp`: ISO 8601 timestamp of the response
- `uptime`: Total uptime in seconds

### GET `/health/ready`

Readiness probe - performs comprehensive health checks including external API availability and cache status.

**Request**:
- None (GET request)

**Response (Healthy)**:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-22T19:35:42.123Z",
  "uptime": 3600.5,
  "checks": {
    "geolocationAPI": {
      "status": "healthy",
      "responseTime": "250ms",
      "message": "Geolocation API is accessible"
    },
    "cache": {
      "status": "healthy",
      "keys": 42,
      "hitRate": "87.50",
      "message": "Cache is operational"
    }
  },
  "responseTime": "255ms"
}
```

**Status Codes**:
- `200`: All systems healthy
- `503`: Service degraded (external API or cache issues)

**Fields**:
- `status`: Health status (`healthy` means all systems are operational)
- `timestamp`: ISO 8601 timestamp of the response
- `uptime`: Total uptime in seconds
- `checks`: Object containing status of various system components
  - `geolocationAPI`: Status of the geolocation API service
  - `cache`: Status of the cache service

## API Dependencies

This application uses **ipapi.co** for geolocation services:

- **Free Tier**: 30,000 requests/month
- **No API Key Required**: Works out of the box
- **Features**: IP geolocation, timezone detection, location details

With the implemented caching layer (80-90% cache hit rate), the application can effectively serve 150,000-300,000 requests/month within the free tier.

## Example Requests and Responses

### First Request (Uncached)
```json
{
  "ip": "203.0.113.42",
  "city": "New York",
  "region": "New York",
  "country": "United States",
  "timezone": "America/New_York",
  "currentTime": "Wednesday, January 22, 2026, 14:35:42",
  "cached": false
}
```

### Subsequent Request (Cached)
```json
{
  "ip": "203.0.113.42",
  "city": "New York",
  "region": "New York",
  "country": "United States",
  "timezone": "America/New_York",
  "currentTime": "Wednesday, January 22, 2026, 14:36:15",
  "cached": true
}
```

## Error Handling

The API returns standard HTTP status codes:
- `200`: Success
- `503`: Service unavailable (external API or cache issues)

When an error occurs, the response includes a descriptive message in the `checks` object for readiness endpoints.
