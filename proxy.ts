import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

function withAuthHeaders(from: Response, to: NextResponse) {
  from.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "x-middleware-next") {
      to.headers.append(key, value);
    }
  });
  return to;
}

export async function proxy(request: NextRequest) {
  const authResponse = await auth0.middleware(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/auth")) {
    return authResponse;
  }

  const session = await auth0.getSession(request);

  if (pathname.startsWith("/brief") && !session) {
    const login = new URL("/auth/login", request.nextUrl.origin);
    login.searchParams.set("returnTo", pathname);
    return withAuthHeaders(authResponse, NextResponse.redirect(login));
  }

  if (pathname === "/" && session) {
    return withAuthHeaders(
      authResponse,
      NextResponse.redirect(new URL("/brief", request.nextUrl.origin)),
    );
  }

  return authResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
