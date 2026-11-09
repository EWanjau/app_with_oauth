import { WeatherIcon } from "@/components/weather-icon";
import { weatherLabel, type CurrentWeather, type WeatherHour } from "@/lib/weather";

function hourLabel(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
  });
}

export function Halo({
  current,
  hours,
}: {
  current: CurrentWeather;
  hours: WeatherHour[];
}) {
  const size = 420;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 148;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px]">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label="Twelve-hour forecast around the current temperature"
      >
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="rgba(244,248,244,0.16)"
          strokeDasharray="3 8"
        />
        {hours.map((hour, index) => {
          const start = (index / hours.length) * Math.PI * 2 - Math.PI / 2;
          const end =
            ((index + 1) / hours.length) * Math.PI * 2 - Math.PI / 2;
          const rain = Math.min(hour.precipProb, 100) / 100;
          const x1 = cx + (radius - 18) * Math.cos(start);
          const y1 = cy + (radius - 18) * Math.sin(start);
          const x2 = cx + (radius - 18) * Math.cos(end);
          const y2 = cy + (radius - 18) * Math.sin(end);
          const large = end - start > Math.PI ? 1 : 0;
          return (
            <path
              key={`arc-${hour.time}`}
              d={`M ${x1} ${y1} A ${radius - 18} ${radius - 18} 0 ${large} 1 ${x2} ${y2}`}
              fill="none"
              stroke="#3ecfb8"
              strokeWidth={8}
              strokeLinecap="butt"
              opacity={0.12 + rain * 0.75}
            />
          );
        })}
        <circle
          cx={cx}
          cy={cy}
          r={78}
          fill="rgba(244,248,244,0.08)"
          stroke="rgba(224,164,90,0.5)"
        />
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fill="#f4f8f4"
          fontSize="52"
          fontFamily="var(--font-fraunces), Georgia, serif"
        >
          {Math.round(current.temp)}°
        </text>
        <text
          x={cx}
          y={cy + 22}
          textAnchor="middle"
          fill="#b7d4c6"
          fontSize="13"
          fontFamily="var(--font-ibm), ui-monospace, monospace"
        >
          NOW · {weatherLabel(current.code).toUpperCase()}
        </text>
      </svg>

      {hours.map((hour, index) => {
        const angle = (index / hours.length) * Math.PI * 2 - Math.PI / 2;
        const x = 50 + (radius / size) * 100 * Math.cos(angle);
        const y = 50 + (radius / size) * 100 * Math.sin(angle);
        return (
          <div
            key={hour.time}
            className="halo-node glass-panel absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full text-center sm:h-[4.4rem] sm:w-[4.4rem]"
            style={{ left: `${x}%`, top: `${y}%` }}
            title={`${hourLabel(hour.time)} · ${Math.round(hour.temp)}° · ${weatherLabel(hour.code)}`}
          >
            <WeatherIcon code={hour.code} className="h-4 w-4 text-brass" />
            <span className="font-display text-sm leading-none">
              {Math.round(hour.temp)}°
            </span>
            <span className="font-mono text-[9px] tracking-wide text-mist">
              {hourLabel(hour.time)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
