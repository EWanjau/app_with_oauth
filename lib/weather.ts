export type WeatherHour = {
  time: string;
  temp: number;
  feels: number;
  precipProb: number;
  precip: number;
  code: number;
  wind: number;
  humidity: number;
  uv: number;
  cloud: number;
};

export type CurrentWeather = {
  time: string;
  temp: number;
  feels: number;
  humidity: number;
  code: number;
  wind: number;
  precip: number;
  isDay: boolean;
};

export type Place = {
  label: string;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  source: "device" | "search";
};

export type WeatherPayload = {
  place: Place;
  timezone: string;
  current: CurrentWeather;
  hours: WeatherHour[];
};

type OpenMeteoResponse = {
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
    precipitation: number;
    is_day: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: number[];
    precipitation: number[];
    weather_code: number[];
    wind_speed_10m: number[];
    relative_humidity_2m: number[];
    uv_index: number[];
    cloud_cover: number[];
  };
};

export type SkyMood =
  | "clear"
  | "cloud"
  | "rain"
  | "storm"
  | "snow"
  | "fog"
  | "night";

export function moodFromCode(code: number, isDay: boolean): SkyMood {
  if (code >= 95) return "storm";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([45, 48].includes(code)) return "fog";
  if (code >= 51) return "rain";
  if (!isDay) return "night";
  if (code >= 2) return "cloud";
  return "clear";
}

export function weatherLabel(code: number): string {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mostly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code === 61 || code === 80) return "Light rain";
  if (code === 63 || code === 81) return "Rain";
  if (code === 65 || code === 82) return "Heavy rain";
  if (code === 66 || code === 67) return "Freezing rain";
  if (code === 71 || code === 85) return "Light snow";
  if (code === 73 || code === 77) return "Snow";
  if (code === 75 || code === 86) return "Heavy snow";
  if (code === 95) return "Thunderstorm";
  if (code >= 96) return "Storm with hail";
  return "Mixed sky";
}

export function iconKind(code: number, isDay = true) {
  if (code >= 95) return "storm" as const;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow" as const;
  if ([45, 48].includes(code)) return "fog" as const;
  if (code >= 80) return "shower" as const;
  if (code >= 61) return "rain" as const;
  if (code >= 51) return "drizzle" as const;
  if (code >= 2) return "cloud" as const;
  return isDay ? ("sun" as const) : ("moon" as const);
}

function sliceHours(data: OpenMeteoResponse): WeatherHour[] {
  const now = Date.now();
  let start = data.hourly.time.findIndex((stamp) => {
    const t = new Date(stamp).getTime();
    return t >= now - 25 * 60 * 1000;
  });
  if (start < 0) start = 0;

  const hours: WeatherHour[] = [];
  for (let i = start; i < data.hourly.time.length && hours.length < 12; i += 1) {
    hours.push({
      time: data.hourly.time[i],
      temp: data.hourly.temperature_2m[i],
      feels: data.hourly.apparent_temperature[i],
      precipProb: data.hourly.precipitation_probability[i] ?? 0,
      precip: data.hourly.precipitation[i] ?? 0,
      code: data.hourly.weather_code[i],
      wind: data.hourly.wind_speed_10m[i],
      humidity: data.hourly.relative_humidity_2m[i],
      uv: data.hourly.uv_index[i] ?? 0,
      cloud: data.hourly.cloud_cover[i] ?? 0,
    });
  }
  return hours;
}

export async function fetchForecast(
  latitude: number,
  longitude: number,
): Promise<Omit<WeatherPayload, "place">> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation,is_day",
  );
  url.searchParams.set(
    "hourly",
    "temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,relative_humidity_2m,uv_index,cloud_cover",
  );
  url.searchParams.set("forecast_hours", "24");
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error("The forecast office is quiet right now.");
  }
  const data = (await res.json()) as OpenMeteoResponse;
  const hours = sliceHours(data);
  if (hours.length === 0) {
    throw new Error("No hours came back for this sky.");
  }

  return {
    timezone: data.timezone,
    current: {
      time: data.current.time,
      temp: data.current.temperature_2m,
      feels: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      code: data.current.weather_code,
      wind: data.current.wind_speed_10m,
      precip: data.current.precipitation,
      isDay: data.current.is_day === 1,
    },
    hours,
  };
}

type ReverseResponse = {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
  latitude: number;
  longitude: number;
};

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<Place> {
  const url = new URL(
    "https://api.bigdatacloud.net/data/reverse-geocode-client",
  );
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("localityLanguage", "en");

  const res = await fetch(url.toString());
  if (!res.ok) {
    return {
      label: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
      city: "Your coordinates",
      region: "",
      country: "",
      latitude,
      longitude,
      source: "device",
    };
  }

  const data = (await res.json()) as ReverseResponse;
  const city = data.city || data.locality || "This patch of sky";
  const region = data.principalSubdivision || "";
  const country = data.countryName || "";
  const label = [city, region, country].filter(Boolean).join(", ");

  return {
    label,
    city,
    region,
    country,
    latitude,
    longitude,
    source: "device",
  };
}

type GeoResult = {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
};

export async function searchPlaces(query: string): Promise<Place[]> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query);
  url.searchParams.set("count", "6");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString());
  if (!res.ok) return [];
  const data = (await res.json()) as { results?: GeoResult[] };
  const seen = new Set<string>();
  return (data.results ?? []).flatMap((item) => {
    const key = `${item.latitude.toFixed(3)},${item.longitude.toFixed(3)}`;
    if (seen.has(key)) return [];
    seen.add(key);
    const region = item.admin1 || "";
    const country = item.country || "";
    return [
      {
        label: [item.name, region, country].filter(Boolean).join(", "),
        city: item.name,
        region,
        country,
        latitude: item.latitude,
        longitude: item.longitude,
        source: "search" as const,
      },
    ];
  });
}
