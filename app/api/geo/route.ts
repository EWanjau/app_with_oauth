import { auth0 } from "@/lib/auth0";
import { reverseGeocode, searchPlaces } from "@/lib/weather";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth0.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const query = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const lat = req.nextUrl.searchParams.get("lat");
  const lon = req.nextUrl.searchParams.get("lon");

  try {
    if (query) {
      const places = await searchPlaces(query);
      return NextResponse.json({ places });
    }

    if (lat && lon) {
      const place = await reverseGeocode(Number(lat), Number(lon));
      return NextResponse.json({ place });
    }

    return NextResponse.json(
      { error: "Ask with a place name or coordinates." },
      { status: 400 },
    );
  } catch {
    return NextResponse.json(
      { error: "The atlas is taking a pause." },
      { status: 502 },
    );
  }
}
