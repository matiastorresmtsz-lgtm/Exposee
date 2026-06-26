import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const githubAccessToken = user.privateMetadata?.githubAccessToken as string;

    if (!githubAccessToken) {
      return NextResponse.json({ connected: false, repos: [] });
    }

    const response = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Exposee-App",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch repositories from GitHub" }, { status: response.status });
    }

    const repos = await response.json();
    return NextResponse.json({
      connected: true,
      repos: repos.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        isPrivate: repo.private,
        htmlUrl: repo.html_url,
        updatedAt: repo.updated_at,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
