const axios = require('axios');
const NodeCache = require('node-cache');

const WEATHER_TTL = 1800; // 30 minutes
const weatherCache = new NodeCache({ stdTTL: WEATHER_TTL, useClones: false, checkperiod: 0 });

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

const WMO_CODES = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Icy fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  56: 'Light freezing drizzle',
  57: 'Heavy freezing drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Light showers',
  81: 'Showers',
  82: 'Heavy showers',
  85: 'Light snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with heavy hail',
};

async function getWeather(latitude, longitude) {
  const cacheKey = `weather:${latitude},${longitude}`;
  const cached = weatherCache.get(cacheKey);
  if (cached !== undefined) {
    return { ...cached, cached: true };
  }

  try {
    const response = await axios.get(OPEN_METEO_BASE, {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m',
        wind_speed_unit: 'mph',
      },
      timeout: 5000,
    });

    const { current, current_units } = response.data;
    const weather = {
      temperature: current.temperature_2m,
      temperatureUnit: current_units.temperature_2m,
      condition: WMO_CODES[current.weather_code] ?? 'Unknown',
      windSpeed: current.wind_speed_10m,
      windUnit: current_units.wind_speed_10m,
      humidity: current.relative_humidity_2m,
    };

    weatherCache.set(cacheKey, weather);
    return { ...weather, cached: false };
  } catch {
    return null;
  }
}

function clearWeatherCache() {
  weatherCache.flushAll();
}

module.exports = { getWeather, clearWeatherCache };
