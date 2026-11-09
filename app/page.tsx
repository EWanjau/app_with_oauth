import { Sky } from "@/components/sky";
import { LoginForm } from "@/components/login-form";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth0.getSession();
  if (session) {
    redirect("/brief");
  }

  return (
    <div className="relative min-h-dvh">
      <Sky mood="clear" />
      <main className="relative z-10 mx-auto flex min-h-dvh max-w-6xl flex-col justify-between px-4 py-8 sm:px-10 sm:py-12">
        <p className="font-mono text-[11px] tracking-[0.34em] text-mist uppercase">
          Nimbus · a twelve-hour weather desk
        </p>

        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-xl">
            <p className="font-mono text-[11px] tracking-[0.28em] text-brass uppercase">
              Personal forecast ticket
            </p>
            <h2 className="font-display mt-4 text-5xl leading-[1.05] text-paper sm:text-6xl">
              What the next twelve hours ask of you.
            </h2>
            <p className="mt-5 max-w-md text-lg leading-8 text-paper/75">
              We read public weather data, confirm the pin on your device, and
              write a short briefing: rain windows, layers, and the best hour
              to step outside.
            </p>
            <dl className="mt-8 grid grid-cols-3 gap-4 font-mono text-[11px] tracking-[0.14em] text-mist uppercase">
              <div>
                <dt className="text-brass">Ticket</dt>
                <dd className="mt-1">Sign in</dd>
              </div>
              <div>
                <dt className="text-brass">Pin</dt>
                <dd className="mt-1">Confirm place</dd>
              </div>
              <div>
                <dt className="text-brass">Window</dt>
                <dd className="mt-1">Twelve hours</dd>
              </div>
            </dl>
          </div>
          <LoginForm />
        </div>

        <p className="font-mono text-[10px] tracking-[0.18em] text-paper/45 uppercase">
          Auth0 Universal Login · signup or sign in
        </p>
      </main>
    </div>
  );
}
