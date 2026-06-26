import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ connected: false });
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const connected = user.publicMetadata?.githubConnected === true;
  return NextResponse.json({ connected });
}
