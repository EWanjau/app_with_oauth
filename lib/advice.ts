import {
  moodFromCode,
  weatherLabel,
  type CurrentWeather,
  type SkyMood,
  type WeatherHour,
} from "@/lib/weather";

export type KitItem = {
  label: string;
  why: string;
};

export type Briefing = {
  headline: string;
  body: string;
  kit: KitItem[];
  bestHour: { time: string; why: string } | null;
  mood: SkyMood;
};

function hourName(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
  });
}

function round(n: number) {
  return Math.round(n);
}

export function composeAdvice(
  current: CurrentWeather,
  hours: WeatherHour[],
): Briefing {
  const temps = hours.map((h) => h.temp);
  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);
  const swing = maxT - minT;
  const rainHours = hours.filter(
    (h) => h.precipProb >= 40 || h.precip >= 0.2 || h.code >= 51,
  );
  const firstRain = rainHours[0];
  const wetPeak = rainHours.reduce(
    (best, hour) => (hour.precipProb > best.precipProb ? hour : best),
    rainHours[0],
  );
  const thunder = hours.some((h) => h.code >= 95);
  const snow = hours.some((h) => [71, 73, 75, 77, 85, 86].includes(h.code));
  const fog = hours.some((h) => h.code === 45 || h.code === 48);
  const windy = hours.some((h) => h.wind >= 35);
  const maxWind = Math.max(...hours.map((h) => h.wind));
  const uvHigh = hours.some((h) => h.uv >= 6);
  const hot = maxT >= 30;
  const cold = minT <= 8;
  const chilly = minT <= 14;
  const mood = moodFromCode(current.code, current.isDay);

  const kit: KitItem[] = [];
  const lines: string[] = [];

  let headline = weatherLabel(current.code);

  if (thunder) {
    headline = "Storm in the window";
    lines.push(
      `Thunder is on the map${wetPeak ? ` around ${hourName(wetPeak.time)}` : ""}. Keep the outdoor plans flexible and give lightning a wide berth.`,
    );
    kit.push({
      label: "Stay in during the rumble",
      why: "Lightning prefers the tallest thing around. That should not be you.",
    });
  } else if (snow) {
    headline = minT <= 0 ? "Snow underfoot" : "Wet flakes likely";
    lines.push(
      `Snow shows up in this twelve-hour stretch. Surfaces will slick over as it settles, especially after ${hourName(hours[hours.length - 1].time)}.`,
    );
    kit.push({
      label: "Shoes with grip",
      why: "Packed snow turns stairs into suggestions.",
    });
  } else if (firstRain) {
    const later = rainHours.length >= 4;
    headline = later ? "A long damp spell" : "Rain on the clock";
    const peak = wetPeak ? `, heaviest around ${hourName(wetPeak.time)}` : "";
    lines.push(
      `Showers begin near ${hourName(firstRain.time)}${peak}. A hood beats a soggy commute.`,
    );
    kit.push({
      label: "Umbrella or hood",
      why: `${round(firstRain.precipProb)}% chance when it starts.`,
    });
  } else if (fog) {
    headline = "Soft grey morning";
    lines.push(
      "Fog will thin the view. Give extra minutes to any trip that depends on seeing the next corner.",
    );
  } else if (current.code <= 1) {
    headline = current.isDay ? "A clear run" : "Open night sky";
    lines.push(
      `The next twelve hours stay mostly dry and ${current.isDay ? "bright" : "open"}. Enjoy it while the glass is clean.`,
    );
  } else {
    headline = "Gentle cover";
    lines.push(
      "Cloud keeps the light even. It is a friendly sky — no drama, no excuses to cancel the walk.",
    );
  }

  if (swing >= 7) {
    lines.push(
      `Temperature slides from ${round(maxT)}° to ${round(minT)}°. Dress in a layer you can peel.`,
    );
    kit.push({
      label: "A light extra layer",
      why: `${round(swing)}° swing across the briefing.`,
    });
  } else if (cold) {
    lines.push(`It bottoms out near ${round(minT)}°. Warm hands, warm mood.`);
    kit.push({
      label: "Coat and warm layer",
      why: `Feels closer to ${round(Math.min(...hours.map((h) => h.feels)))}°.`,
    });
  } else if (chilly && !hot) {
    kit.push({
      label: "Light jacket",
      why: `Evening air sits around ${round(minT)}°.`,
    });
  }

  if (hot) {
    lines.push(
      `Heat peaks near ${round(maxT)}°. Shade, water, and unhurried errands will treat you better than heroics.`,
    );
    kit.push({
      label: "Water bottle",
      why: "The air is doing enough work already.",
    });
  }

  if (uvHigh && !thunder && current.isDay) {
    kit.push({
      label: "Sunscreen",
      why: "UV climbs above 6 in this window.",
    });
  }

  if (windy) {
    lines.push(
      `Wind gusts toward ${round(maxWind)} km/h. Hats with opinions should stay home.`,
    );
    kit.push({
      label: "Secure loose things",
      why: "Bikes, umbrellas, and picnic plates included.",
    });
  }

  if (kit.length === 0) {
    kit.push({
      label: "As you are",
      why: "This sky does not ask much of you.",
    });
  }

  const scored = hours.map((hour) => {
    let score = 50;
    score -= hour.precipProb * 0.5;
    score -= hour.precip * 12;
    if (hour.code >= 95) score -= 40;
    if (hour.wind > 35) score -= 15;
    if (hour.temp < 6 || hour.temp > 32) score -= 12;
    if (hour.uv >= 8) score -= 6;
    if (hour.code <= 2) score += 8;
    return { hour, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];
  const bestHour =
    best && best.score >= 40
      ? {
          time: best.hour.time,
          why: `${round(best.hour.temp)}°, ${weatherLabel(best.hour.code).toLowerCase()}`,
        }
      : null;

  return {
    headline,
    body: lines.slice(0, 3).join(" "),
    kit: kit.slice(0, 5),
    bestHour,
    mood,
  };
}
