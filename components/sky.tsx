import type { SkyMood } from "@/lib/weather";

export function Sky({ mood = "clear" }: { mood?: SkyMood }) {
  return (
    <div className="sky" data-mood={mood} aria-hidden="true">
      <div className="blob blob-a" />
      <div className="blob blob-b" />
      <div className="rain" />
      <div className="grain" />
    </div>
  );
}
