import { iconKind } from "@/lib/weather";

type Kind = ReturnType<typeof iconKind>;

const paths: Record<Kind, string> = {
  sun: "M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Zm0-5.2v2.2M12 19.8V22M2 12h2.2M19.8 12H22M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6",
  moon: "M16.5 13.2A6.4 6.4 0 0 1 10 5.2 7 7 0 1 0 18.8 15a6.3 6.3 0 0 1-2.3-1.8Z",
  cloud:
    "M7.2 18h9.3a4.2 4.2 0 0 0 .5-8.4 5.5 5.5 0 0 0-10.5 1.6A3.6 3.6 0 0 0 7.2 18Z",
  drizzle:
    "M7 15h9.2A3.8 3.8 0 0 0 16.6 7.4 5 5 0 0 0 7 9.2 3.3 3.3 0 0 0 7 15Zm1.6 3.2v1.6M12 17.6v1.8M16 18.4v1.4",
  rain: "M6.8 14.6h9.4A3.9 3.9 0 0 0 16.5 7 5.2 5.2 0 0 0 6.7 8.8a3.4 3.4 0 0 0 .1 5.8ZM8.2 17.4 7.4 20M12.1 16.8l-1 3.2M16 17.6l-.9 2.6",
  shower:
    "M6.5 13.8h10A4 4 0 0 0 16.7 6 5.4 5.4 0 0 0 6.4 8a3.5 3.5 0 0 0 .1 5.8Zm2 4.4-1.2 3M12.2 17.4l-1.3 3.2M16.4 18l-1.1 2.6",
  storm:
    "M7 13.5h8.6A3.7 3.7 0 0 0 15.8 6.2 5 5 0 0 0 6.6 8a3.3 3.3 0 0 0 .4 5.5Zm5.2 1.2-3.2 4.4h2.4L9.8 23l5.2-5.6h-2.5L15 13.5",
  snow: "M7 14.6h9.2A3.8 3.8 0 0 0 16.5 7.2 5.1 5.1 0 0 0 6.8 9a3.4 3.4 0 0 0 .2 5.6ZM8.4 18.2l.4.4M8.4 18.6l-.4.4M12 17.6v.8M15.4 18.4l.4.4M15.8 18.8l-.4.4",
  fog: "M4 10h16M5 13.2h14M6.5 16.4h11",
};

export function WeatherIcon({
  code,
  isDay = true,
  className = "h-6 w-6",
}: {
  code: number;
  isDay?: boolean;
  className?: string;
}) {
  const kind = iconKind(code, isDay);
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[kind]} />
    </svg>
  );
}
