"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-20 border-b border-white/[0.12] bg-[#111111]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-black text-xl font-black">
              E
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-white">Exposee</p>
              <p className="text-sm text-white/60">Find repo secrets, env leaks and exposed info</p>
            </div>
          </div>

          <nav className="hidden items-center gap-3 md:flex">
            <Link className="rounded-lg border border-white/30 px-4 py-2 text-sm text-white/90 transition hover:border-white hover:text-white" href="/dashboard">
              Dashboard
            </Link>
            <Link className="rounded-lg border border-white/30 px-4 py-2 text-sm text-white/90 transition hover:border-white hover:text-white" href="/connect-github">
              Connect GitHub
            </Link>
            {isLoaded ? (
              isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <Link className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-white/90" href="/sign-in">
                  Sign in
                </Link>
              )
            ) : (
              <div className="h-10 w-10 rounded-lg bg-white/10" />
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-16 pt-10">
        <section className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center rounded-lg border border-white/20 bg-white/5 px-4 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
              GitHub leak scanner
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Find exposed env variables, secrets, and leaked repo data instantly.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/60">
                Exposee scans GitHub repositories, commit history, and dependency manifests to surface accidental leaks, API keys, tokens, and vulnerable packages. Clear findings, actionable remediation, and CI-ready protection.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <a className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-white/10 transition hover:bg-white/90" href="/dashboard">
                Start free scan
              </a>
              <a className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm text-white transition hover:border-white hover:bg-white/10" href="#features">
                Explore features
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-sm uppercase tracking-[0.2em] text-white/50">Scanned repos</p>
                <p className="mt-3 text-2xl font-semibold text-white">100+</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-sm uppercase tracking-[0.2em] text-white/50">Avg scan time</p>
                <p className="mt-3 text-2xl font-semibold text-white">14s</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-sm uppercase tracking-[0.2em] text-white/50">Detected leaks</p>
                <p className="mt-3 text-2xl font-semibold text-white">env, key, token</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-sm uppercase tracking-[0.2em] text-white/50">CI ready</p>
                <p className="mt-3 text-2xl font-semibold text-white">merge protection</p>
              </div>
            </div>
          </div>

          <div className="relative isolate overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/50">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.06),_transparent_50%)]" />
            <div className="rounded-lg bg-black/60 p-6 ring-1 ring-white/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Latest repository scan</p>
                  <p className="mt-1 text-xs text-white/40">Updated 5 minutes ago</p>
                </div>
                <span className="rounded-lg border border-white/20 bg-white/5 px-3 py-1 text-xs text-white/70">Secure</span>
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-lg bg-black px-4 py-4 text-white ring-1 ring-white/10">
                  <pre className="m-0 overflow-x-auto font-mono text-sm leading-6 text-white/80">
                    🔒 .env committed in history — 1 occurrence
                    ⚠️ vulnerable dependency found: example@1.2.3
                    🧹 orphaned secret in config file
                  </pre>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-white/5 p-4">
                    <p className="text-sm text-white/50">Repo type</p>
                    <p className="mt-2 font-semibold text-white">Node / JS</p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-4">
                    <p className="text-sm text-white/50">Policy status</p>
                    <p className="mt-2 font-semibold text-white">Blocked</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mt-20 space-y-6">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.24em] text-white/50">Features</p>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Everything you need to surface leaks and secure code.</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:border-white/30">
              <p className="text-lg font-semibold text-white">Secret &amp; leak detection</p>
              <p className="mt-3 text-sm leading-6 text-white/50">Detect accidentally committed env files, API keys, tokens, and private data.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:border-white/30">
              <p className="text-lg font-semibold text-white">Dependency scanning</p>
              <p className="mt-3 text-sm leading-6 text-white/50">Flag known vulnerable packages and risky dependency chains.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:border-white/30">
              <p className="text-lg font-semibold text-white">Guided remediation</p>
              <p className="mt-3 text-sm leading-6 text-white/50">Receive actionable fixes to rotate keys, remove leaks, and harden repos.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:border-white/30">
              <p className="text-lg font-semibold text-white">CI integration</p>
              <p className="mt-3 text-sm leading-6 text-white/50">Block risky merges and keep exposed secrets out of production.</p>
            </div>
          </div>
        </section>

        <section id="how" className="mt-20 space-y-6">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.24em] text-white/50">How it works</p>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Scan, detect, and fix leaks in minutes.</h2>
          </div>
          <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="flex gap-4 rounded-lg bg-black/60 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-white">1</div>
              <div>
                <p className="font-semibold text-white">Connect your GitHub repo</p>
                <p className="mt-1 text-sm text-white/50">Read-only connection and no credentials stored.</p>
              </div>
            </div>
            <div className="flex gap-4 rounded-lg bg-black/60 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-white">2</div>
              <div>
                <p className="font-semibold text-white">Scan commits, history, and manifests</p>
                <p className="mt-1 text-sm text-white/50">Exposee checks for secrets, config leaks, and vulnerable packages.</p>
              </div>
            </div>
            <div className="flex gap-4 rounded-lg bg-black/60 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-white">3</div>
              <div>
                <p className="font-semibold text-white">Receive a secure findings report</p>
                <p className="mt-1 text-sm text-white/50">Actionable remediation steps and CI rules to fix leaks fast.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="mt-20">
          <div className="space-y-6 rounded-xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/50">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.24em] text-white/50">FAQ</p>
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">Common questions about Exposee</h2>
            </div>

            <div className="space-y-4">
              <details className="group rounded-lg border border-white/10 bg-black/50 p-5 transition hover:border-white/30">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-semibold text-white">
                  Why choose Exposee over other scanners?
                  <span className="transition duration-200 group-open:-rotate-45">+</span>
                </summary>
                <p className="mt-4 leading-7 text-white/50">
                  Many systems rely on exact patterns or fixed signature lists, which means they can miss strange secrets or non-standard leaks. Exposee scans repository history, files, and manifests more broadly so you catch leaks that narrow tools often overlook.
                </p>
              </details>

              <details className="group rounded-lg border border-white/10 bg-black/50 p-5 transition hover:border-white/30">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-semibold text-white">
                  Why not someone else?
                  <span className="transition duration-200 group-open:-rotate-45">+</span>
                </summary>
                <p className="mt-4 leading-7 text-white/50">
                  Other tools are often built for specific leaks and exact matches, so they may miss secrets hidden in config files, commit history, or unusual formats. Exposee looks for everything in the repository and aims to surface more real risks, not just the obvious ones.
                </p>
              </details>

              <details className="group rounded-lg border border-white/10 bg-black/50 p-5 transition hover:border-white/30">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-semibold text-white">
                  Are the results accurate?
                  <span className="transition duration-200 group-open:-rotate-45">+</span>
                </summary>
                <p className="mt-4 leading-7 text-white/50">
                  We focus on broad coverage, which means we surface more potential issues and help you investigate further. While no scanner is perfect, Exposee reduces the risk from missed env leaks and repo exposure by checking more than just exact signatures.
                </p>
              </details>
            </div>
          </div>
        </section>

        <section id="get-started" className="mt-20">
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/50">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-white/50">Ready to secure your repo?</p>
                <p className="mt-3 text-2xl font-semibold text-white">Start a free scan and stop leaked secrets before they spread.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90" href="/dashboard">
                  Start free scan
                </Link>
                <Link className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm text-white transition hover:border-white hover:bg-white/10" href="/sign-in">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-7xl px-6 pb-8 pt-4">
        <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-5 shadow-2xl shadow-black/50">
          <div className="flex flex-col gap-3 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Exposee — built for secure teams.</p>
            <div className="flex flex-wrap gap-4">
              <a className="transition hover:text-white" href="#docs">Docs</a>
              <a className="transition hover:text-white" href="#privacy">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
