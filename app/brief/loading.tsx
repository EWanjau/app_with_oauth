import { Sky } from "@/components/sky";

export default function BriefLoading() {
  return (
    <div className="relative min-h-dvh">
      <Sky mood="cloud" />
      <p className="relative z-10 px-8 pt-12 font-mono text-xs tracking-[0.24em] text-brass uppercase">
        Opening the briefing room…
      </p>
    </div>
  );
}
