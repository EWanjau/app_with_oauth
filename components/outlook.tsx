"use client";

import { Halo } from "@/components/halo";
import { Sky } from "@/components/sky";
import { WeatherIcon } from "@/components/weather-icon";
import { composeAdvice, type Briefing } from "@/lib/advice";
import {
  fetchForecast,
  reverseGeocode,
  searchPlaces,
  weatherLabel,
  type Place,
  type CurrentWeather,
  type SkyMood,
  type WeatherHour,
} from "@/lib/weather";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

type ForecastResponse = {
  timezone: string;
  current: CurrentWeather;
  hours: WeatherHour[];
  briefing: Briefing;
};

type Step = "locate" | "confirm" | "brief";

function formatHour(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
  });
}

export function Outlook({
  userName,
}: {
  userName: string;
}) {
  const [step, setStep] = useState<Step>("locate");
  const [mood, setMood] = useState<SkyMood>("clear");
  const [place, setPlace] = useState<Place | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const geoToken = useRef(0);

  const loadForecast = useCallback(async (next: Place) => {
    geoToken.current += 1;
    setBusy("Writing your twelve-hour briefing…");
    setError("");
    try {
      const data = await fetchForecast(next.latitude, next.longitude);
      const briefing = composeAdvice(data.current, data.hours);
      setPlace(next);
      setForecast({ ...data, briefing });
      setMood(briefing.mood);
      setStep("brief");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The forecast office did not answer.",
      );
    } finally {
      setBusy("");
    }
  }, []);

  const locateDevice = useCallback(async () => {
    const token = ++geoToken.current;
    setBusy("Asking your device for a pin…");
    setError("");
    if (!navigator.geolocation) {
      setBusy("");
      setError("This browser will not share a location. Search for a city instead.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (token !== geoToken.current) return;
        try {
          const found = await reverseGeocode(
            position.coords.latitude,
            position.coords.longitude,
          );
          if (token !== geoToken.current) return;
          setPlace({ ...found, source: "device" });
          setStep("confirm");
        } catch {
          if (token !== geoToken.current) return;
          setError("Location arrived, but the atlas did not.");
        } finally {
          if (token === geoToken.current) setBusy("");
        }
      },
      (geoError) => {
        if (token !== geoToken.current) return;
        setBusy("");
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError(
            "Location is off. Search a city, or allow location in the browser and try again.",
          );
        } else {
          setError("The device pin did not arrive. Search a city instead.");
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60_000 },
    );
  }, []);

  useEffect(() => {
    locateDevice();
  }, [locateDevice]);

  async function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const typed =
      String(new FormData(event.currentTarget).get("city") ?? "").trim() ||
      query.trim();
    if (!typed) return;
    setQuery(typed);
    setBusy("Scanning the atlas…");
    setError("");
    try {
      const places = await searchPlaces(typed);
      setResults(places);
      if (places.length === 0) {
        setError("No matching place. Try a city name.");
      }
    } catch {
      setError("Search did not return. Check your connection and try again.");
    } finally {
      setBusy("");
    }
  }

  const greeting = "Hello";

  return (
    <div className="relative min-h-dvh text-paper">
      <Sky mood={mood} />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl flex-col overflow-x-hidden px-4 py-5 sm:px-8">
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] tracking-[0.32em] text-mist uppercase">
              Nimbus
            </p>
            <p className="text-sm text-paper/70">
              {greeting}, {userName.split(" ")[0]}
            </p>
          </div>
          <a
            href="/auth/logout"
            className="rounded-full border border-paper/20 px-4 py-2 text-sm text-paper/80 transition hover:border-brass hover:text-brass"
          >
            Sign out
          </a>
        </header>

        {step !== "brief" ? (
          <section className="mx-auto mt-10 w-full max-w-xl">
            <div className="glass-panel rounded-[28px] p-6 sm:p-8">
              <p className="font-mono text-[11px] tracking-[0.28em] text-mist uppercase">
                Confirm the pin
              </p>
              {busy ? (
                <p className="mt-3 font-mono text-xs tracking-[0.2em] text-brass uppercase">
                  {busy}
                </p>
              ) : null}
              {error ? (
                <p className="mt-3 text-sm text-brass" role="alert">
                  {error}
                </p>
              ) : null}
              <h1 className="font-display mt-2 text-4xl leading-tight">
                {place
                  ? "Is this your sky?"
                  : "We need a place to brief."}
              </h1>
              {place ? (
                <div className="mt-6">
                  <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center">
                    <span className="pulse-ring absolute inset-0 rounded-full border border-brass/60" />
                    <span className="h-4 w-4 rounded-full bg-brass" />
                  </div>
                  <p className="font-display text-2xl">{place.city}</p>
                  <p className="text-sm text-mist">
                    {place.label}
                    {place.source === "device" ? " · from your device" : " · searched"}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-paper/50">
                    {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        void loadForecast(place);
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-full bg-brass px-5 py-3 text-sm font-medium text-ink"
                      >
                        Yes, brief me here
                      </button>
                    </form>
                    <button
                      type="button"
                      onClick={locateDevice}
                      className="rounded-full border border-paper/20 px-5 py-3 text-sm"
                    >
                      Recheck device
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  <p className="text-paper/70">
                    Allow location so we can match the forecast to where you
                    actually are. Or name a city.
                  </p>
                  <button
                    type="button"
                    onClick={locateDevice}
                    className="mt-4 rounded-full bg-brass px-5 py-3 text-sm font-medium text-ink"
                  >
                    Use my device location
                  </button>
                </div>
              )}

              <form onSubmit={onSearch} className="mt-8 flex gap-2">
                <input
                  name="city"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search another city"
                  className="flex-1 rounded-full border border-paper/15 bg-ink/30 px-4 py-3 text-sm outline-none placeholder:text-paper/40 focus:border-brass"
                />
                <button
                  type="submit"
                  className="rounded-full bg-paper px-4 py-3 text-sm font-medium text-ink"
                >
                  Find
                </button>
              </form>

              {results.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {results.map((item) => (
                    <li key={`${item.latitude}-${item.longitude}-${item.label}`}>
                      <form
                        onSubmit={(event) => {
                          event.preventDefault();
                          setPlace(item);
                          setStep("confirm");
                          setResults([]);
                          setError("");
                        }}
                      >
                        <button
                          type="submit"
                          className="w-full rounded-2xl border border-paper/10 px-4 py-3 text-left text-sm transition hover:border-brass"
                        >
                          <span className="block font-medium">{item.city}</span>
                          <span className="text-mist">{item.label}</span>
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        ) : null}

        {step === "brief" && forecast && place ? (
          <main className="mt-6 grid min-w-0 items-start gap-8 pb-16 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="min-w-0">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setStep("confirm");
                  setForecast(null);
                }}
              >
                <button
                  type="submit"
                  className="font-mono text-[11px] tracking-[0.2em] text-mist uppercase hover:text-brass"
                >
                  {place.label} · change place
                </button>
              </form>
              <h1 className="font-display mt-3 max-w-xl text-4xl leading-[1.08] sm:text-6xl">
                {forecast.briefing.headline}
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-8 text-paper/80">
                {forecast.briefing.body}
              </p>

              <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Feels" value={`${Math.round(forecast.current.feels)}°`} />
                <Stat label="Wind" value={`${Math.round(forecast.current.wind)} km/h`} />
                <Stat label="Humidity" value={`${Math.round(forecast.current.humidity)}%`} />
                <Stat
                  label="Wettest hour"
                  value={
                    forecast.hours.reduce((a, b) =>
                      a.precipProb > b.precipProb ? a : b,
                    ).precipProb > 20
                      ? formatHour(
                          forecast.hours.reduce((a, b) =>
                            a.precipProb > b.precipProb ? a : b,
                          ).time,
                        )
                      : "Dry run"
                  }
                />
              </dl>

              <ul className="mt-6 flex flex-wrap gap-2">
                {forecast.briefing.kit.map((item) => (
                  <li
                    key={item.label}
                    className="glass-panel rounded-full px-4 py-2 text-sm"
                    title={item.why}
                  >
                    <span className="text-brass">{item.label}</span>
                    <span className="hidden text-paper/50 sm:inline"> · {item.why}</span>
                  </li>
                ))}
              </ul>

              {forecast.briefing.bestHour ? (
                <p className="mt-6 font-mono text-xs tracking-[0.18em] text-sea uppercase">
                  Best hour outside · {formatHour(forecast.briefing.bestHour.time)} ·{" "}
                  {forecast.briefing.bestHour.why}
                </p>
              ) : null}
            </section>

            <section className="glass-panel min-w-0 overflow-hidden rounded-[32px] px-3 py-8 sm:px-4">
              <Halo current={forecast.current} hours={forecast.hours} />
              <p className="mt-2 text-center font-mono text-[10px] tracking-[0.22em] text-mist uppercase">
                Next twelve hours · rain ring grows with chance of wet
              </p>
            </section>

            <section className="min-w-0 lg:col-span-2">
              <h2 className="font-mono text-[11px] tracking-[0.24em] text-mist uppercase">
                Hour by hour
              </h2>
              <ol className="mt-3 flex gap-3 overflow-x-auto pb-3">
                {forecast.hours.map((hour) => (
                  <li
                    key={hour.time}
                    className="glass-panel min-w-[108px] rounded-3xl px-3 py-4 text-center"
                  >
                    <p className="font-mono text-[11px] text-mist">
                      {formatHour(hour.time)}
                    </p>
                    <WeatherIcon
                      code={hour.code}
                      className="mx-auto mt-2 h-7 w-7 text-brass"
                    />
                    <p className="font-display mt-2 text-2xl">
                      {Math.round(hour.temp)}°
                    </p>
                    <p className="text-[11px] text-paper/60">
                      {weatherLabel(hour.code)}
                    </p>
                    <p className="mt-2 font-mono text-[10px] text-sea">
                      {Math.round(hour.precipProb)}% wet
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          </main>
        ) : null}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel rounded-2xl px-3 py-3">
      <dt className="font-mono text-[10px] tracking-[0.18em] text-mist uppercase">
        {label}
      </dt>
      <dd className="font-display mt-1 text-2xl">{value}</dd>
    </div>
  );
}
