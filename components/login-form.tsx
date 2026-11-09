export function LoginForm() {
  return (
    <div className="ticket w-full max-w-[440px] overflow-hidden">
      <div className="grid grid-cols-[22px_1fr]">
        <div className="ticket-perforation min-h-full" />
        <div className="px-7 py-8 sm:px-8">
          <p className="font-mono text-[11px] tracking-[0.28em] text-moss/70 uppercase">
            Boarding pass · Gate 12H
          </p>
          <h1 className="font-display mt-3 text-[2.35rem] leading-[1.05] text-ink">
            Step into your sky.
          </h1>
          <p className="mt-3 text-sm leading-6 text-ink/70">
            Nimbus writes a twelve-hour briefing from your device location and
            public weather data. Sign in with Auth0 first — the sky is personal.
          </p>

          <div className="mt-6 space-y-3">
            <a
              href="/auth/login?returnTo=/brief"
              className="block w-full rounded-full bg-ink px-5 py-3.5 text-center text-sm font-medium text-paper transition hover:bg-moss"
            >
              Enter the briefing room
            </a>
            <a
              href="/auth/login?screen_hint=signup&returnTo=/brief"
              className="block w-full rounded-full border border-ink/10 bg-white/80 px-5 py-3.5 text-center text-sm text-ink transition hover:border-brass"
            >
              Need a desk? Create one
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
