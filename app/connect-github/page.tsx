"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const errorMessages: Record<string, string> = {
  invalid_state: "GitHub authorization failed because the OAuth state did not match. Please try again.",
  token_failure: "GitHub authorization failed while exchanging your code. Please try again.",
  access_denied: "GitHub authorization was canceled or denied. Please allow access to continue.",
};

import { Suspense } from "react";

function ConnectGitHubContent() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  const displayName = user?.fullName || user?.primaryEmailAddress?.emailAddress || "Developer";

  const errorKey = searchParams?.get("error");
  const errorMessage = errorKey ? errorMessages[errorKey] ?? "An unexpected error occurred while connecting GitHub." : "";

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-lg border border-white/10 bg-white/5 p-10 shadow-2xl shadow-black/50">
          <div className="space-y-6 text-center">
            <p className="text-sm uppercase tracking-[0.24em] text-white/50">GitHub connect</p>
            <h1 className="text-4xl font-semibold text-white">Authorize GitHub access</h1>
            <p className="mx-auto max-w-2xl text-white/60">
              Hi {displayName}, connect GitHub so Sliyce can scan your repositories and surface leaks, secrets, and vulnerable packages.
            </p>
          </div>

          <div className="mt-10 rounded-lg border border-white/10 bg-black/70 p-8">
            <div className="space-y-4">
              <p className="text-lg font-semibold text-white">Why connect GitHub?</p>
              <p className="text-white/60">We only scan repos that you authorize. A GitHub connection lets Sliyce read repository metadata and commit history for leak detection.</p>
              <p className="text-white/60">No credentials are stored, and your connection is read-only.</p>
            </div>
            {errorMessage ? (
              <div className="mt-6 rounded-lg border border-white/20 bg-white/5 p-4 text-sm text-white/80">
                {errorMessage}
              </div>
            ) : null}
            <a
              href="/api/github/authorize"
              className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition shadow-lg shadow-blue-500/20"
            >
              Connect GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConnectGitHubPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <ConnectGitHubContent />
    </Suspense>
  );
}
