import { getAuth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

function createState() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function GET(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    throw new Error("Missing GITHUB_CLIENT_ID environment variable.");
  }

  const redirectUri = process.env.GITHUB_OAUTH_REDIRECT_URL ?? new URL("/api/github/callback", request.url).toString();
  const state = createState();
  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", "repo read:user");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("allow_signup", "false");

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set("sliyce_github_oauth_state", state, {
    httpOnly: true,
    path: "/",
    maxAge: 600,
    sameSite: "lax",
  });

  return response;
}
