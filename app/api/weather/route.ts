import { composeAdvice } from "@/lib/advice";
import { auth0 } from "@/lib/auth0";
import { fetchForecast } from "@/lib/weather";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth0.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lon = Number(req.nextUrl.searchParams.get("lon"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json(
      { error: "A real latitude and longitude are required." },
      { status: 400 },
    );
  }
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return NextResponse.json(
      { error: "Those coordinates are off the map." },
      { status: 400 },
    );
  }

  try {
    const forecast = await fetchForecast(lat, lon);
    const briefing = composeAdvice(forecast.current, forecast.hours);
    return NextResponse.json({ ...forecast, briefing });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Forecast did not arrive.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
