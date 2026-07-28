"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-black text-white text-center justify-center ">
<div 
  className="h-12 bg-blue-600 flex items-center justify-center text-white underline cursor-pointer"
  onClick={() => window.location.href = "https://github.com/matiastorresmtsz-lgtm/Sliyce"}
>
  Site rebrand + SLIYCE 2.0 - See on GitHub
</div>      <header className="sticky top-0 z-20 border-b border-white/[0.12] bg-[#111111]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:opacity-90 transition">
              <span className="text-sm font-bold uppercase tracking-[0.24em] text-blue-500">Sliyce</span>
            </Link>
          </div>

          <nav className="hidden items-center gap-3 md:flex">
            <Link className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/95 transition hover:border-white/40 hover:text-white" href="/dashboard">
              Dashboard
            </Link>
            <Link className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition shadow-sm shadow-blue-500/10" href="/connect-github">
              Connect GitHub
            </Link>
            {isLoaded ? (
              isSignedIn ? (
                <UserButton />
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

      <main className="mx-auto max-w-7xl px-6 pb-16 pt-[70]">
        {/* Centered Hero Section */}
        <section className="flex flex-col items-center text-center space-y-8 pb-16 md:pb-24 pt-0 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/80 backdrop-blur-md">
            <svg className="h-3.5 w-3.5 fill-blue-500 text-blue-500" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
            </svg>
            <span>Live Git Monitoring &amp; Secret Auditing</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15] sm:leading-[1.15] lg:leading-[1.15]">
              Find exposed secrets in your repositories with{" "}
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent block mt-2 font-semibold">
                Sliyce Leak Scanner
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg leading-8 text-white/60">
              Sliyce scans GitHub repositories, commit history, and dependency manifests to surface accidental leaks, API keys, tokens, and vulnerable packages. Clear findings, actionable remediation, and CI-ready protection.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row justify-center w-full">
            <a className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 hover:shadow-blue-500/30 transition duration-200" href="/dashboard">
              Start free scan
            </a>
            <a className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm text-white transition hover:border-blue-500 hover:bg-blue-950/20 hover:text-blue-400" href="#features">
              Explore features
            </a>
          </div>
        </section>

        {/* Console Mockup & Stats Section */}
        <section className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-stretch mt-12 pt-12 border-t border-white/[0.08]">
          {/* Left Column: Stats and description */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Continuous codebase security checks</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Ensure credentials and API tokens are never exposed in your public or private repositories. Sliyce acts as a dynamic monitor guarding your Git branches.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">Scanned repos</p>
                <p className="mt-2 text-2xl font-bold text-blue-400">100+</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">Avg scan time</p>
                <p className="mt-2 text-2xl font-bold text-blue-400">14s</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">Detected leaks</p>
                <p className="mt-2 text-2xl font-bold text-blue-400">env, key, token</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">CI ready</p>
                <p className="mt-2 text-2xl font-bold text-blue-400">merge guard</p>
              </div>
            </div>
          </div>

          {/* Right Column: Console Mockup */}
          <div className="relative isolate overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/50 flex flex-col justify-center">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_50%)]" />
            <div className="rounded-lg bg-black/60 p-6 ring-1 ring-white/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Latest repository scan</p>
                  <p className="mt-1 text-xs text-white/40">Updated 5 minutes ago</p>
                </div>
                <span className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-1 text-xs text-blue-400 font-semibold">Secure</span>
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
                <p className="mt-1 text-sm text-white/50">Sliyce checks for secrets, config leaks, and vulnerable packages.</p>
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

        <TokenSystemSection />

        <section id="faq" className="mt-20">
          <div className="space-y-6 rounded-xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/50">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.24em] text-white/50">FAQ</p>
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">Common questions about Sliyce</h2>
            </div>

            <div className="space-y-4">
              <details className="group rounded-lg border border-white/10 bg-black/50 p-5 transition hover:border-white/30">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-semibold text-white">
                  Why choose Sliyce over the competition?
                  <span className="transition duration-200 group-open:-rotate-45">+</span>
                </summary>
                <p className="mt-4 leading-7 text-white/50">
                  Traditional scanners rely strictly on narrow signature databases or exact pattern matching, missing complex leaks. Sliyce goes beyond basics by scanning repository commit history, dependency manifests, and configurations to locate accidental leaks that standard tools miss entirely.
                </p>
              </details>

              <details className="group rounded-lg border border-white/10 bg-black/50 p-5 transition hover:border-white/30">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-semibold text-white">
                  Are we the only dedicated option specifically for GitHub?
                  <span className="transition duration-200 group-open:-rotate-45">+</span>
                </summary>
                <p className="mt-4 leading-7 text-white/50">
                  Yes, Sliyce is built from the ground up exclusively for GitHub. Rather than offering a generic, multi-provider platform, we focus entirely on native integration with the GitHub ecosystem, including OAuth setups, repository webhooks, pull request branch protections, and CI/CD pipelines.
                </p>
              </details>

              <details className="group rounded-lg border border-white/10 bg-black/50 p-5 transition hover:border-white/30">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-semibold text-white">
                  Do I need technical knowledge to read the security analysis?
                  <span className="transition duration-200 group-open:-rotate-45">+</span>
                </summary>
                <p className="mt-4 leading-7 text-white/50">
                  Not at all. We provide an extremely simple security analysis that anyone can read and understand, even without technical knowledge. We strip away complex security jargon and show exactly what is exposed (e.g., API keys or config files) and outline simple, step-by-step instructions to remediate it.
                </p>
              </details>

              <details className="group rounded-lg border border-white/10 bg-black/50 p-5 transition hover:border-white/30">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-semibold text-white">
                  Is Sliyce free to use?
                  <span className="transition duration-200 group-open:-rotate-45">+</span>
                </summary>
                <p className="mt-4 leading-7 text-white/50">
                  Yes, standard repository scanning and core leak detection are completely free. Later, we plan to implement paid tokens to unlock advanced security options, automated workflows, and enterprise-scale features.
                </p>
              </details>

              <details className="group rounded-lg border border-white/10 bg-black/50 p-5 transition hover:border-white/30">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-semibold text-white">
                  How long does a scan take?
                  <span className="transition duration-200 group-open:-rotate-45">+</span>
                </summary>
                <p className="mt-4 leading-7 text-white/50">
                  Sliyce is built for performance. The average scanning duration for standard repositories is under 15 seconds, ensuring you receive near-instant results for your commits and dependencies.
                </p>
              </details>

              <details className="group rounded-lg border border-white/10 bg-black/50 p-5 transition hover:border-white/30">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-semibold text-white">
                  Are the results accurate?
                  <span className="transition duration-200 group-open:-rotate-45">+</span>
                </summary>
                <p className="mt-4 leading-7 text-white/50">
                  We target broad scanning coverage to find every potential leak. While no scanner can be 100% perfect, Sliyce minimizes false alerts and walks you through verifying and resolving every security issue flagged.
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
                <Link className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition hover:shadow-blue-500/35" href="/dashboard">
                  Start free scan
                </Link>
                <Link className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm text-white transition hover:border-blue-500 hover:bg-blue-950/20 hover:text-blue-400" href="/sign-in">
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
            <p>© {new Date().getFullYear()} Sliyce — built for secure teams.</p>
            <div className="flex flex-wrap gap-4">
              <a
                className="transition text-white/60 hover:text-white"
                href="https://github.com/matiastorresyc/exposee-app"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const tokenSteps = [
  {
    id: 1,
    title: "1. Scan Request",
    short: "CI/CD or CLI initiates a scan",
    desc: "Your CI/CD pipeline or developer terminal requests a repository scan. Instead of sending a static secret key, a temporary transaction handshake is initiated.",
    color: "from-blue-500 to-indigo-500",
    glowColor: "rgba(59, 130, 246, 0.15)",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    id: 2,
    title: "2. Ephemeral Token Issuance",
    short: "OIDC signed token is minted",
    desc: "Our secure Identity Authority issues a cryptographically-signed OpenID Connect (OIDC) token. The token contains precise, granular scopes and a short expiration time (e.g., 5 minutes).",
    color: "from-purple-500 to-pink-500",
    glowColor: "rgba(168, 85, 247, 0.15)",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m-9 9a5 5 0 114.73-6h2.27a2 2 0 002-2V9a2 2 0 00-2-2h-2.27a5 5 0 01-11.73 0m13 9a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    id: 3,
    title: "3. Cryptographic Verification",
    short: "Decentralized trust handshake",
    desc: "The Sliyce scanning gateway validates the token signature, confirms environmental attestation (ensuring the caller is the actual, un-tampered CI environment), and checks the expiry timestamp.",
    color: "from-emerald-500 to-teal-500",
    glowColor: "rgba(16, 185, 129, 0.15)",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    id: 4,
    title: "4. Scoped Scan & Self-Destruct",
    short: "Execution starts, token expires",
    desc: "Access is granted only to the specific resources requested. Once the scan completes, the token is automatically invalidated and self-destructs. Static credentials are never compromised.",
    color: "from-amber-500 to-orange-500",
    glowColor: "rgba(245, 158, 11, 0.15)",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
];

function TokenSystemSection() {
  const [activeStep, setActiveStep] = useState(1);
  const [isHovered, setIsHovered] = useState<number | null>(null);

  // Automatically cycle through steps every 4.5 seconds if the user is not hovering
  useEffect(() => {
    if (isHovered !== null) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev % 4) + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHovered]);

  const currentStep = tokenSteps[activeStep - 1];

  return (
    <section id="tokens" className="mt-20 space-y-6">
      {/* Custom inline keyframes and utility classes */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes march {
          to {
            stroke-dashoffset: -20;
          }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.35; }
        }
        .animate-march {
          stroke-dasharray: 6, 6;
          animation: march 1.5s linear infinite;
        }
        .animate-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
      `}} />

      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.24em] text-white/50">Our Token System</p>
        <h2 className="text-3xl font-semibold text-white sm:text-4xl">Future-proofing repo security with zero-trust credentials.</h2>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-stretch mt-8">
        {/* Left Column: Explanation */}
        <div className="flex flex-col justify-between space-y-6">
          <p className="text-lg leading-8 text-white/60">
            Sliyce is developing a decentralized, cryptographically attested token architecture to completely eliminate the need for storing long-lived GitHub access tokens or static API keys.
          </p>

          <div className="space-y-3">
            {tokenSteps.map((step) => {
              const isActive = activeStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  onMouseEnter={() => {
                    setIsHovered(step.id);
                    setActiveStep(step.id);
                  }}
                  onMouseLeave={() => setIsHovered(null)}
                  className={`w-full text-left flex gap-4 p-4 rounded-xl border transition-all duration-300 ${isActive
                    ? "border-white/20 bg-white/5 shadow-lg shadow-white/5"
                    : "border-white/5 bg-transparent hover:border-white/10 hover:bg-white/[0.02]"
                    }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 ${isActive ? "border-white/40 bg-white text-black" : "border-white/15 bg-white/5 text-white/60"
                    }`}>
                    {step.icon}
                  </div>
                  <div>
                    <h3 className={`font-semibold text-sm sm:text-base transition-colors ${isActive ? "text-white" : "text-white/70"
                      }`}>
                      {step.title}
                    </h3>
                    <p className={`text-xs mt-1 transition-colors ${isActive ? "text-white/60" : "text-white/40"
                      }`}>
                      {step.short}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Graphic */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 md:p-8 shadow-2xl shadow-black/50 flex flex-col justify-between min-h-[380px]">
          {/* Glowing background */}
          <div
            className="absolute inset-0 -z-10 animate-glow transition-all duration-500 opacity-20 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 30%, ${currentStep.glowColor} 0%, transparent 60%)`
            }}
          />

          {/* Graphic Visualization */}
          <div className="w-full py-4 flex justify-center items-center">
            <svg viewBox="0 0 460 120" className="w-full max-w-[420px] overflow-visible">
              {/* Connection Lines */}
              <defs>
                <linearGradient id="gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <linearGradient id="gradient-3" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>

              {/* Path 1 -> 2 */}
              <path d="M 50 60 H 155" stroke="rgba(255,255,255,0.06)" strokeWidth="3" fill="none" />
              {activeStep >= 2 && (
                <path
                  d="M 50 60 H 155"
                  stroke="url(#gradient-1)"
                  strokeWidth="3"
                  fill="none"
                  className={activeStep === 2 ? "animate-march" : ""}
                />
              )}

              {/* Path 2 -> 3 */}
              <path d="M 155 60 H 260" stroke="rgba(255,255,255,0.06)" strokeWidth="3" fill="none" />
              {activeStep >= 3 && (
                <path
                  d="M 155 60 H 260"
                  stroke="url(#gradient-2)"
                  strokeWidth="3"
                  fill="none"
                  className={activeStep === 3 ? "animate-march" : ""}
                />
              )}

              {/* Path 3 -> 4 */}
              <path d="M 260 60 H 365" stroke="rgba(255,255,255,0.06)" strokeWidth="3" fill="none" />
              {activeStep >= 4 && (
                <path
                  d="M 260 60 H 365"
                  stroke="url(#gradient-3)"
                  strokeWidth="3"
                  fill="none"
                  className={activeStep === 4 ? "animate-march" : ""}
                />
              )}

              {/* Nodes */}
              {[1, 2, 3, 4].map((id) => {
                const step = tokenSteps[id - 1];
                const isActive = activeStep === id;
                const isPassed = activeStep > id;
                const x = 50 + (id - 1) * 105;
                const y = 60;

                let strokeColor = "rgba(255,255,255,0.15)";
                let fillColor = "#0e0e0e";
                let textColor = "text-white/40";

                if (isActive) {
                  strokeColor = "white";
                  fillColor = "#161616";
                  textColor = "text-white";
                } else if (isPassed) {
                  strokeColor = id === 1 ? "#3b82f6" : id === 2 ? "#a855f7" : "#10b981";
                  fillColor = "#090909";
                  textColor = "text-white/60";
                }

                return (
                  <g
                    key={id}
                    className="cursor-pointer transition-all duration-300"
                    onClick={() => setActiveStep(id)}
                    onMouseEnter={() => {
                      setIsHovered(id);
                      setActiveStep(id);
                    }}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    {/* Ring glow for active node */}
                    {isActive && (
                      <circle
                        cx={x}
                        cy={y}
                        r="24"
                        fill="transparent"
                        stroke={id === 1 ? "#3b82f6" : id === 2 ? "#a855f7" : id === 3 ? "#10b981" : "#f59e0b"}
                        strokeWidth="1.5"
                        className="animate-ping opacity-30"
                      />
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r="18"
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isActive ? "2" : "1.5"}
                      className="transition-all duration-300"
                    />
                    <foreignObject x={x - 9} y={y - 9} width="18" height="18" className="pointer-events-none">
                      <div className={`w-full h-full flex items-center justify-center ${textColor}`}>
                        {step.icon}
                      </div>
                    </foreignObject>
                    {/* Label */}
                    <text
                      x={x}
                      y={y + 36}
                      textAnchor="middle"
                      className={`text-[9px] font-mono uppercase tracking-wider transition-colors duration-300 fill-current ${isActive ? "fill-white font-bold" : "fill-white/40"
                        }`}
                    >
                      Step {id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Details Card */}
          <div className="relative mt-6 rounded-lg bg-black/60 p-5 ring-1 ring-white/10 flex-1 flex flex-col justify-center min-h-[140px] transition-all duration-300">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${activeStep === 1
                ? "bg-blue-400/10 text-blue-400 ring-blue-400/20"
                : activeStep === 2
                  ? "bg-purple-400/10 text-purple-400 ring-purple-400/20"
                  : activeStep === 3
                    ? "bg-emerald-400/10 text-emerald-400 ring-emerald-400/20"
                    : "bg-amber-400/10 text-amber-400 ring-amber-400/20"
                }`}>
                {activeStep === 4 ? "COMPLETE" : "IN PROGRESS"}
              </span>
              <span className="text-xs text-white/40">Zero-Trust Security Options</span>
            </div>
            <h4 className="mt-3 font-semibold text-white text-base">
              {currentStep.title}
            </h4>
            <p className="mt-2 text-xs leading-5 text-white/60">
              {currentStep.desc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
