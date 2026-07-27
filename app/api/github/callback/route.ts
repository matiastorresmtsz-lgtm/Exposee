import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = request.cookies.get("sliyce_github_oauth_state")?.value;

  if (error) {
    const redirectUrl = new URL("/connect-github", request.url);
    redirectUrl.searchParams.set("error", "access_denied");
    if (errorDescription) {
      redirectUrl.searchParams.set("details", errorDescription);
    }
    return NextResponse.redirect(redirectUrl);
  }

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(new URL("/connect-github?error=invalid_state", request.url));
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const redirectUri = process.env.GITHUB_OAUTH_REDIRECT_URL ?? new URL("/api/github/callback", request.url).toString();
  if (!clientId || clientId === "your_github_client_id_here" || !clientSecret || clientSecret === "your_github_client_secret_here") {
    throw new Error("Missing or invalid GitHub OAuth environment variables. Please configure them in .env.local.");
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      state,
    }),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) {
    const redirectUrl = new URL("/connect-github", request.url);
    redirectUrl.searchParams.set("error", "token_failure");
    if (tokenData.error_description) {
      redirectUrl.searchParams.set("details", tokenData.error_description);
    }
    return NextResponse.redirect(redirectUrl);
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const client = await clerkClient();
  await client.users.updateUser(userId, {
    publicMetadata: {
      githubConnected: true,
    },
    privateMetadata: {
      githubAccessToken: tokenData.access_token,
    },
  });

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.delete({ name: "sliyce_github_oauth_state", path: "/" });
  return response;
}
