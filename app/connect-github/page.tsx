"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const errorMessages: Record<string, string> = {
  invalid_state: "GitHub authorization failed because the OAuth state did not match. Please try again.",
  token_failure: "GitHub authorization failed while exchanging your code. Please try again.",
  access_denied: "GitHub authorization was canceled or denied. Please allow access to continue.",
};

export default function ConnectGitHubPage() {
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-10 shadow-2xl shadow-cyan-500/10">
          <div className="space-y-6 text-center">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">GitHub connect</p>
            <h1 className="text-4xl font-semibold text-white">Authorize GitHub access</h1>
            <p className="mx-auto max-w-2xl text-slate-400">
              Hi {displayName}, connect GitHub so Exposee can scan your repositories and surface leaks, secrets, and vulnerable packages.
            </p>
          </div>

          <div className="mt-10 rounded-3xl border border-white/10 bg-slate-950/70 p-8">
            <div className="space-y-4">
              <p className="text-lg font-semibold text-white">Why connect GitHub?</p>
              <p className="text-slate-400">We only scan repos that you authorize. A GitHub connection lets Exposee read repository metadata and commit history for leak detection.</p>
              <p className="text-slate-400">No credentials are stored, and your connection is read-only.</p>
            </div>
            {errorMessage ? (
              <div className="mt-6 rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                {errorMessage}
              </div>
            ) : null}
            <a
              href="/api/github/authorize"
              className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Connect GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
