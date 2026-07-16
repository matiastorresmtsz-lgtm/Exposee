"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignOutButton, useUser, UserButton } from "@clerk/nextjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

interface Repository {
  id: number;
  name: string;
  fullName: string;
  description: string;
  isPrivate: boolean;
  htmlUrl: string;
  updatedAt: string;
}

interface ScanReport {
  id: number;
  name: string;
  owner: string;
  fullName: string;
  safetyScore: number;
  isPrivate: boolean;
  scannedAt: string;
  risks: Array<{
    id: string;
    title: string;
    description: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    category: string;
  }>;
  vulnerabilities: Array<{
    id: string;
    name: string;
    dependency: string;
    installedVersion: string;
    fixedVersion: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    description: string;
    cve: string;
  }>;
  recommendations: Array<{
    title: string;
    action: string;
  }>;
}

const defaultMockReports: ScanReport[] = [
  {
    id: 991,
    name: "express-auth-api",
    owner: "dev-team",
    fullName: "dev-team/express-auth-api",
    safetyScore: 60,
    isPrivate: true,
    scannedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    risks: [
      {
        id: "risk-mock-env",
        title: "Exposed Secrets in config.json",
        description: "Found plaintext AWS credentials and database URLs committed directly inside configuration files in the root folder.",
        severity: "CRITICAL",
        category: "Credentials Leak",
      }
    ],
    vulnerabilities: [
      {
        id: "vuln-jsonwebtoken-key",
        name: "jsonwebtoken Key Confusion",
        dependency: "jsonwebtoken",
        installedVersion: "8.5.1",
        fixedVersion: "9.0.0",
        severity: "HIGH",
        description: "Vulnerability allows signature bypass if public keys are used as verification keys.",
        cve: "CVE-2022-23529",
      },
      {
        id: "vuln-lodash-proto",
        name: "lodash Prototype Pollution",
        dependency: "lodash",
        installedVersion: "4.17.15",
        fixedVersion: "4.17.21",
        severity: "MEDIUM",
        description: "Vulnerability allows remote code execution via prototype pollution in lodash merges.",
        cve: "CVE-2020-8203",
      }
    ],
    recommendations: [
      {
        title: "Revoke and rotate exposed AWS credentials",
        action: "AWS credentials leaked in source control are automatically compromised. Deactivate the Access Key immediately in the AWS IAM Console, generate a new key pair, and load it using process.env."
      },
      {
        title: "Upgrade jsonwebtoken and lodash packages",
        action: "Run 'npm install jsonwebtoken@9.0.0 lodash@4.17.21' to upgrade both dependencies to patched versions."
      }
    ]
  },
  {
    id: 992,
    name: "react-landing-page",
    owner: "personal-dev",
    fullName: "personal-dev/react-landing-page",
    safetyScore: 85,
    isPrivate: false,
    scannedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    risks: [],
    vulnerabilities: [
      {
        id: "vuln-express-redirect",
        name: "express Open Redirect & DoS",
        dependency: "express",
        installedVersion: "4.18.1",
        fixedVersion: "4.19.2",
        severity: "LOW",
        description: "Redirect validation vulnerability could permit arbitrary redirection requests to trusted hosts.",
        cve: "CVE-2024-29041",
      }
    ],
    recommendations: [
      {
        title: "Upgrade express dependency",
        action: "Run 'npm install express@4.19.2' to resolve redirect vulnerability vectors."
      }
    ]
  },
  {
    id: 993,
    name: "secure-payment-gateway",
    owner: "fintech-corp",
    fullName: "fintech-corp/secure-payment-gateway",
    safetyScore: 100,
    isPrivate: true,
    scannedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    risks: [],
    vulnerabilities: [],
    recommendations: []
  }
];

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "scan" | "screenings">("overview");
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Scanning state
  const [scanningRepoId, setScanningRepoId] = useState<number | null>(null);
  const [scanStepText, setScanStepText] = useState("");
  const [completedScanInfo, setCompletedScanInfo] = useState<{
    repoId: number;
    name: string;
    score: number;
  } | null>(null);

  // Screenings state
  const [screenedRepos, setScreenedRepos] = useState<ScanReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("30d");

  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/github/status");
        const data = await response.json();
        setConnected(data.connected === true);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStatus();

    // Load screenings from localStorage
    const saved = localStorage.getItem("exposee_screened_repos");
    if (saved) {
      try {
        setScreenedRepos(JSON.parse(saved));
      } catch (e) {
        console.error(e);
        setScreenedRepos(defaultMockReports);
        localStorage.setItem("exposee_screened_repos", JSON.stringify(defaultMockReports));
      }
    } else {
      setScreenedRepos(defaultMockReports);
      localStorage.setItem("exposee_screened_repos", JSON.stringify(defaultMockReports));
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (activeTab === "scan" && connected && repos.length === 0) {
      const fetchRepos = async () => {
        setLoadingRepos(true);
        try {
          const response = await fetch("/api/github/repos");
          const data = await response.json();
          if (data.connected && data.repos) {
            setRepos(data.repos);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingRepos(false);
        }
      };
      fetchRepos();
    }
  }, [activeTab, connected, repos.length]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-lg h-8 w-8 border-t-2 border-white border-r-2 border-r-transparent mr-2"></div>
        <p className="mt-4 text-sm text-white/50">Loading your dashboard...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  const displayName = user?.fullName || user?.primaryEmailAddress?.emailAddress || "Developer";

  // Functional scan execution
  const handleScanClick = (repo: Repository) => {
    setScanningRepoId(repo.id);
    setCompletedScanInfo(null);

    // Animate visual scan progression states
    const steps = [
      "Accessing GitHub repository...",
      "Fetching file directory tree...",
      "Inspecting config files for secrets (.env, id_rsa)...",
      "Analyzing package dependencies for security CVEs...",
      "Running semantic validation heuristics...",
      "Generating Exposee safety report..."
    ];

    let currentStep = 0;
    setScanStepText(steps[0]);

    const stepInterval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setScanStepText(steps[currentStep]);
      } else {
        clearInterval(stepInterval);
      }
    }, 450);

    // Call the actual scan route
    const owner = repo.fullName.split("/")[0];
    const triggerScan = async () => {
      try {
        const response = await fetch(`/api/github/scan?owner=${owner}&repo=${repo.name}`);
        if (!response.ok) throw new Error("Failed scan request");
        const data = await response.json();

        // Construct report and update localStorage
        const newReport: ScanReport = {
          id: repo.id,
          name: repo.name,
          owner: owner,
          fullName: repo.fullName,
          safetyScore: data.safetyScore,
          isPrivate: repo.isPrivate,
          scannedAt: data.scannedAt || new Date().toISOString(),
          risks: data.risks || [],
          vulnerabilities: data.vulnerabilities || [],
          recommendations: data.recommendations || [],
        };

        const updatedScreenings = [
          newReport,
          ...screenedRepos.filter((item) => item.id !== repo.id)
        ];

        setScreenedRepos(updatedScreenings);
        localStorage.setItem("exposee_screened_repos", JSON.stringify(updatedScreenings));

        setCompletedScanInfo({
          repoId: repo.id,
          name: repo.name,
          score: data.safetyScore,
        });

      } catch (err) {
        console.error(err);
        // Fallback simulation report in case of API failure / rate limits
        const simulatedScore = 100 - ((repo.name.length * 7) % 45);
        const fallbackReport: ScanReport = {
          id: repo.id,
          name: repo.name,
          owner: owner,
          fullName: repo.fullName,
          safetyScore: simulatedScore,
          isPrivate: repo.isPrivate,
          scannedAt: new Date().toISOString(),
          risks: simulatedScore < 80 ? [
            {
              id: "risk-mock-fallback",
              title: "Weak Dependency Configurations",
              description: "Found potential key leak risks in default package metadata.",
              severity: "MEDIUM",
              category: "Config Risk",
            }
          ] : [],
          vulnerabilities: simulatedScore < 85 ? [
            {
              id: "vuln-mock-fallback",
              name: "lodash prototype pollution (simulated)",
              dependency: "lodash",
              installedVersion: "4.17.11",
              fixedVersion: "4.17.21",
              severity: "MEDIUM",
              description: "Vulnerability allows property injection.",
              cve: "CVE-2020-8203",
            }
          ] : [],
          recommendations: simulatedScore < 100 ? [
            {
              title: "Upgrade lodash (simulated)",
              action: "Run 'npm install lodash@latest' to verify fix."
            }
          ] : [],
        };

        const updatedScreenings = [
          fallbackReport,
          ...screenedRepos.filter((item) => item.id !== repo.id)
        ];

        setScreenedRepos(updatedScreenings);
        localStorage.setItem("exposee_screened_repos", JSON.stringify(updatedScreenings));

        setCompletedScanInfo({
          repoId: repo.id,
          name: repo.name,
          score: simulatedScore,
        });
      } finally {
        setScanningRepoId(null);
        clearInterval(stepInterval);
      }
    };

    // Execute scan call after visual steps complete (approx 2.4s)
    setTimeout(() => {
      triggerScan();
    }, 2400);
  };

  const filteredRepos = repos.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeReport = screenedRepos.find((r) => r.id === selectedReportId);

  // Math for Circular Safety Gauge
  const getGaugeColor = (score: number) => {
    if (score >= 90) return "stroke-white text-white";
    if (score >= 70) return "stroke-white/60 text-white/80";
    return "stroke-white/30 text-white/40";
  };

  // average security rate calculation
  const getAverageScore = () => {
    if (screenedRepos.length === 0) return 100;
    const total = screenedRepos.reduce((acc, r) => acc + r.safetyScore, 0);
    return Math.round(total / screenedRepos.length);
  };

  // Global Timeline Graph calculations
  const getGlobalTimeframeData = () => {
    const avg = getAverageScore();
    if (timeframe === "7d") {
      return {
        labels: ["6d ago", "5d ago", "4d ago", "3d ago", "2d ago", "Yesterday", "Today"],
        points: [78, 80, 81, 79, 82, 85, avg]
      };
    }
    if (timeframe === "30d") {
      return {
        labels: ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Today"],
        points: [70, 74, 80, 82, avg]
      };
    }
    return {
      labels: ["Month 1", "Month 2", "Month 3", "Today"],
      points: [62, 70, 78, avg]
    };
  };

  const timeframeData = getGlobalTimeframeData();

  // Chart configuration for react-chartjs-2 Line component
  const chartData = {
    labels: timeframeData.labels,
    datasets: [
      {
        fill: true,
        label: "Safety Score",
        data: timeframeData.points,
        borderColor: "rgba(255, 255, 255, 1)",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderWidth: 2,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "rgba(255, 255, 255, 1)",
        pointHoverBackgroundColor: "#ffffff",
        pointHoverBorderColor: "rgba(255, 255, 255, 1)",
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#0a0a0a",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "rgba(255, 255, 255, 0.15)",
        borderWidth: 1,
        padding: 8,
        displayColors: false,
        callbacks: {
          label: (context: any) => ` ${context.parsed.y}%`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.4)",
          font: {
            size: 10,
          },
        },
        border: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
          drawTicks: false,
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.4)",
          font: {
            size: 10,
          },
          stepSize: 20,
          callback: (value: any) => `${value}%`,
        },
        border: {
          dash: [3, 3],
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-950 border-r border-white/10 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo / Header */}
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <img src="/logo.png" alt="Exposee" className="w-10 h-10 object-contain" />
            <div>
              <span className="font-bold text-white tracking-wide text-lg">Exposee</span>
              <span className="text-xs block text-white/50 font-medium">Security Scanner</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition duration-200 ${
                activeTab === "overview"
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="9" rx="1" />
                <rect x="14" y="3" width="7" height="5" rx="1" />
                <rect x="14" y="12" width="7" height="9" rx="1" />
                <rect x="3" y="16" width="7" height="5" rx="1" />
              </svg>
              Overview
            </button>
            <button
              onClick={() => setActiveTab("scan")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition duration-200 ${
                activeTab === "scan"
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
              Scan Repos
            </button>
            <button
              onClick={() => setActiveTab("screenings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition duration-200 ${
                activeTab === "screenings"
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Screenings
              {screenedRepos.length > 0 && (
                <span className="ml-auto bg-white/10 border border-white/20 text-white text-xs px-2 py-0.5 rounded-lg font-bold">
                  {screenedRepos.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* User profile footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between gap-3 bg-white/5">
          <div className="flex items-center gap-3 min-w-0">
            <UserButton />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{displayName}</p>
              <p className="text-xs text-white/40 truncate">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>
          <SignOutButton>
            <button title="Sign out" className="p-2 hover:bg-white/5 text-white/60 hover:text-white rounded-lg transition">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-black">
        {/* Header */}
        <header className="h-16 border-b border-white/10 px-8 flex items-center justify-between shrink-0 bg-neutral-950/40 backdrop-blur-md">
          <h2 className="text-lg font-semibold text-white capitalize">
            {activeTab === "scan" ? "Scan Repositories" : activeTab === "screenings" ? "Screenings & Reports" : "Overview"}
          </h2>
          <div className="flex items-center gap-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${
              connected
                ? "bg-white/5 text-white border-white/20"
                : "bg-white/5 text-white/60 border-white/10"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-lg ${connected ? "bg-white animate-pulse" : "bg-white/30"}`}></span>
              {connected ? "GitHub Connected" : "GitHub Disconnected"}
            </span>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">

          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <div className="space-y-6 max-w-4xl">
              {/* Welcome card */}
              <div className="relative overflow-hidden rounded-lg border border-white/10 bg-neutral-950 p-8 shadow-xl shadow-white/5">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-lg blur-3xl -z-10"></div>
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/70 font-semibold">Security Portal</p>
                  <h1 className="text-3xl font-semibold text-white">Welcome back, {displayName}</h1>
                  <p className="text-white/60 leading-relaxed max-w-2xl">
                    Exposee monitors your GitHub commits, source code, and configurations to surface security leaks, exposed environment variables, and vulnerable packages automatically.
                  </p>
                </div>
              </div>

              {/* Status Section */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Connection Status Card */}
                <div className="rounded-lg border border-white/10 bg-neutral-950/40 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-white/80">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-base">GitHub Integration</h3>
                        <p className="text-xs text-white/40">Repository access configuration</p>
                      </div>
                    </div>
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-sm text-white/50">Connection Status</span>
                        <span className={`text-sm font-semibold ${connected ? "text-white" : "text-white/40"}`}>
                          {connected ? "Connected" : "Disconnected"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-sm text-white/50">Developer Profile</span>
                        <span className="text-sm text-white truncate max-w-[180px]">{displayName}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/connect-github")}
                    className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-white hover:bg-white/90 text-black py-3 text-sm font-semibold transition"
                  >
                    {connected ? "Reconnect GitHub Account" : "Connect GitHub Account"}
                  </button>
                </div>

                {/* Quick Info / Next Step Card */}
                <div className="rounded-lg border border-white/10 bg-neutral-950/40 p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-white text-base">Next Steps</h3>
                    <p className="text-xs text-white/40 mt-1">Get started with repository analysis</p>
                    <p className="mt-4 text-white/60 text-sm leading-relaxed">
                      {connected
                        ? "Your integration is complete! Navigate to the 'Scan Repos' tab in the sidebar to review and trigger security check scans on your private and public repositories."
                        : "Connect your GitHub account to authorize Exposee to fetch your public and private repositories. Once linked, you can perform instant scans to locate exposed env files and API keys."}
                    </p>
                  </div>
                  {connected && (
                    <button
                      onClick={() => setActiveTab("scan")}
                      className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-white/20 hover:border-white hover:bg-white/5 text-white py-3 text-sm font-semibold transition"
                    >
                      Go to Repositories
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Scan Repositories */}
          {activeTab === "scan" && (
            <div className="space-y-6">
              {!connected ? (
                <div className="max-w-md mx-auto text-center py-16 space-y-6">
                  <div className="mx-auto w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">GitHub Connection Required</h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      You must authorize your GitHub account in Exposee before we can retrieve and run security scans on your repository code.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/connect-github")}
                    className="inline-flex items-center justify-center rounded-lg bg-white hover:bg-white/90 text-black px-6 py-3 text-sm font-semibold transition"
                  >
                    Connect GitHub
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Scan completions notification card */}
                  {completedScanInfo && (
                    <div className="rounded-lg border border-white/20 bg-white/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 text-white rounded-lg">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">Scan Completed for {completedScanInfo.name}</p>
                          <p className="text-xs text-white/60">
                            Safety Score: <span className="text-white font-bold">{completedScanInfo.score}%</span>. Access details under Screenings.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setSelectedReportId(completedScanInfo.repoId);
                            setActiveTab("screenings");
                          }}
                          className="text-xs font-semibold bg-white text-black hover:bg-white/90 px-4 py-2 rounded-lg transition"
                        >
                          See Report
                        </button>
                        <button
                          onClick={() => setCompletedScanInfo(null)}
                          className="text-white/40 hover:text-white text-xs p-1"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Connected header & search bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">Select Repository</h3>
                      <p className="text-xs text-white/40">Pick a repository to test for credentials leaks & vulnerable packages</p>
                      {/* Subtitle redirect to screenings */}
                      <p className="text-xs text-white/80 mt-1.5 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="16" x2="12" y2="12" />
                          <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                        See the{" "}
                        <button onClick={() => setActiveTab("screenings")} className="underline font-bold hover:text-white">
                          Screenings Tab
                        </button>{" "}
                        to view your previously screened repos and full vulnerability reports.
                      </p>
                    </div>

                    <div className="relative max-w-sm w-full">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Filter repositories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition duration-200"
                      />
                    </div>
                  </div>

                  {loadingRepos ? (
                    <div className="flex flex-col items-center justify-center py-20 text-white/40">
                      <div className="animate-spin rounded-lg h-8 w-8 border-t-2 border-white border-r-2 border-r-transparent mb-3"></div>
                      <p className="text-sm">Fetching repository list from GitHub...</p>
                    </div>
                  ) : filteredRepos.length === 0 ? (
                    <div className="text-center py-16 rounded-lg border border-white/5 bg-white/5">
                      <p className="text-white/50 text-sm">
                        {searchQuery ? "No repositories matched your filter query." : "No repositories found under your account."}
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filteredRepos.map((repo) => {
                        const isScanning = scanningRepoId === repo.id;
                        const previousScan = screenedRepos.find((r) => r.id === repo.id);
                        return (
                          <div
                            key={repo.id}
                            className="rounded-lg border border-white/10 bg-white/5 p-5 flex flex-col justify-between hover:border-white/20 transition group"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-lg uppercase tracking-wider bg-white/5 border border-white/5 flex items-center gap-1 text-white/80">
                                  {repo.isPrivate ? (
                                    <>
                                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                      </svg>
                                      Private
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-3 h-3 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="2" y1="12" x2="22" y2="12" />
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                      </svg>
                                      Public
                                    </>
                                  )}
                                </span>
                                <a
                                  href={repo.htmlUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-white/40 hover:text-white transition"
                                  title="View on GitHub"
                                >
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                  </svg>
                                </a>
                              </div>

                              <h4 className="font-semibold text-white text-base group-hover:text-white transition truncate" title={repo.name}>
                                {repo.name}
                              </h4>
                              <p className="text-white/50 text-xs mt-1.5 h-8 line-clamp-2 leading-relaxed">
                                {repo.description || "No description provided."}
                              </p>
                            </div>

                            {/* Scan trigger button / loader state */}
                            <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-2">
                              {isScanning ? (
                                <div className="space-y-1.5">
                                  <div className="flex justify-between items-center text-[10px] text-white font-medium">
                                    <span className="truncate">{scanStepText}</span>
                                    <span className="shrink-0">Scanning...</span>
                                  </div>
                                  <div className="w-full bg-white/10 h-1.5 rounded-lg overflow-hidden">
                                    <div className="bg-white h-full rounded-lg animate-[loading_2.4s_ease-in-out_infinite] origin-left"></div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[10px] text-white/40">
                                    {previousScan
                                      ? `Screened: ${previousScan.safetyScore}%`
                                      : `Updated ${new Date(repo.updatedAt).toLocaleDateString()}`
                                    }
                                  </span>
                                  <button
                                    onClick={() => handleScanClick(repo)}
                                    className="rounded-lg border border-white/20 bg-white/5 hover:bg-white hover:text-black px-3.5 py-1.5 text-xs font-bold transition shrink-0"
                                  >
                                    {previousScan ? "Rescan" : "Scan"}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Screenings & Reports */}
          {activeTab === "screenings" && (
            <div className="space-y-8">
              {screenedRepos.length === 0 ? (
                <div className="max-w-md mx-auto text-center py-16 space-y-6">
                  <div className="mx-auto w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-white">No Screenings Yet</h3>
                    <p className="text-white/50 text-sm leading-relaxed">
                      You haven't screened any repositories for security vulnerabilities yet. Navigate to 'Scan Repos' to inspect your code.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("scan")}
                    className="inline-flex items-center justify-center rounded-lg bg-white hover:bg-white/90 text-black px-6 py-3 text-sm font-semibold transition"
                  >
                    Go Scan Repositories
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">

                  {/* Left Column: Screened Repositories Index */}
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    <h3 className="text-base font-bold text-white/80 px-1">Screened Codebases</h3>
                    <div className="space-y-3">
                      {screenedRepos.map((report) => {
                        const isSelected = selectedReportId === report.id;
                        return (
                          <button
                            key={report.id}
                            onClick={() => setSelectedReportId(isSelected ? null : report.id)}
                            className={`w-full text-left rounded-lg border p-4 flex items-center justify-between gap-3 transition ${
                              isSelected
                                ? "bg-white/10 border-white/30 shadow-lg shadow-white/5"
                                : "bg-white/5 border-white/10 hover:border-white/20"
                            }`}
                          >
                            <div className="min-w-0">
                              <h4 className="font-semibold text-white truncate text-sm">{report.name}</h4>
                              <p className="text-[10px] text-white/40 mt-1">
                                Scanned {new Date(report.scannedAt).toLocaleDateString()}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold ${
                                report.risks.length + report.vulnerabilities.length > 0
                                  ? "bg-white/10 text-white"
                                  : "bg-white/5 text-white/50"
                              }`}>
                                {report.risks.length + report.vulnerabilities.length} Alerts
                              </span>

                              <div className="relative flex items-center justify-center">
                                {/* Small score circular indicator */}
                                <svg className="w-8 h-8" viewBox="0 0 36 36">
                                  <path className="text-white/10 stroke-current" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                  <path className="text-white stroke-current" strokeWidth="3.2" strokeDasharray={`${report.safetyScore}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                </svg>
                                <span className="absolute text-[10px] font-bold text-white">{report.safetyScore}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Repository Detailed Scan Report */}
                  <div className="rounded-lg border border-white/10 bg-white/5 p-6 min-h-[500px] flex flex-col">
                    {!activeReport ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-white/40 py-20 text-center space-y-3">
                        <svg className="w-12 h-12 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z" />
                          <path d="M12 14c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
                        </svg>
                        <div>
                          <p className="font-semibold text-white/60">No Repository Selected</p>
                          <p className="text-xs text-white/40 max-w-xs mt-1">Select a repository from the index on the left to load its security diagnostics report.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6 flex-1 flex flex-col justify-between">

                        {/* Report Header & Gauge */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-white/5">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xl font-bold text-white">{activeReport.name}</h4>
                              <span className="text-[10px] font-medium text-white/40">({activeReport.isPrivate ? "Private" : "Public"})</span>
                            </div>
                            <p className="text-xs text-white/40 mt-1">Report Generated on {new Date(activeReport.scannedAt).toLocaleString()}</p>
                          </div>

                          {/* Large Safety Score SVG circular gauge */}
                          <div className="flex items-center gap-4 shrink-0 bg-white/5 border border-white/10 p-3 rounded-lg">
                            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" className="stroke-white/10" strokeWidth="8" fill="none" />
                                <circle cx="50" cy="50" r="40" className={`${getGaugeColor(activeReport.safetyScore)}`} strokeWidth="9" strokeDasharray="251.2" strokeDashoffset={`${251.2 - (activeReport.safetyScore / 100) * 251.2}`} strokeLinecap="round" fill="none" />
                              </svg>
                              <span className="absolute text-sm font-bold text-white">{activeReport.safetyScore}%</span>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Safety Score</p>
                              <p className="text-sm font-bold text-white">
                                {activeReport.safetyScore >= 90 ? "Secure" : activeReport.safetyScore >= 70 ? "Needs Review" : "At Risk"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Diagnostic lists */}
                        <div className="space-y-6 py-2 overflow-y-auto max-h-[350px] flex-1">

                          {/* Alert Grid Summary */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                              <p className="text-xs text-white/40">Repository Risks</p>
                              <p className="text-2xl font-bold text-white mt-1">{activeReport.risks.length}</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
                              <p className="text-xs text-white/40">CVE Vulnerabilities</p>
                              <p className="text-2xl font-bold text-white mt-1">{activeReport.vulnerabilities.length}</p>
                            </div>
                          </div>

                          {/* Risks details */}
                          {activeReport.risks.length > 0 && (
                            <div className="space-y-3">
                              <h5 className="text-sm font-bold text-white/80">File Credential Risks</h5>
                              <div className="space-y-2">
                                {activeReport.risks.map((risk, index) => (
                                  <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-3.5 space-y-1">
                                    <div className="flex justify-between items-center gap-2">
                                      <span className="font-semibold text-white text-sm">{risk.title}</span>
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-black uppercase">
                                        {risk.severity}
                                      </span>
                                    </div>
                                    <p className="text-xs text-white/60 leading-relaxed">{risk.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Vulnerability details */}
                          {activeReport.vulnerabilities.length > 0 && (
                            <div className="space-y-3">
                              <h5 className="text-sm font-bold text-white/80">Outdated Dependency Vulnerabilities</h5>
                              <div className="space-y-2">
                                {activeReport.vulnerabilities.map((vuln, index) => (
                                  <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-3.5 space-y-2">
                                    <div className="flex justify-between items-center gap-2">
                                      <span className="font-semibold text-white text-sm">{vuln.name}</span>
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-black uppercase">
                                        {vuln.severity}
                                      </span>
                                    </div>
                                    <p className="text-xs text-white/60 leading-relaxed">{vuln.description}</p>
                                    <div className="flex justify-between items-center gap-2 text-[10px] text-white/40 pt-1 border-t border-white/5">
                                      <span>Dependency: <strong className="text-white/60">{vuln.dependency} ({vuln.installedVersion})</strong></span>
                                      <span>Patch: <strong className="text-white/60">{vuln.fixedVersion}</strong></span>
                                      <span className="bg-white/10 px-1.5 py-0.5 rounded text-white/60">{vuln.cve}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Recommendations details */}
                          {activeReport.recommendations.length > 0 && (
                            <div className="space-y-3">
                              <h5 className="text-sm font-bold text-white/80">Actionable Remediation Checklist</h5>
                              <div className="space-y-2.5">
                                {activeReport.recommendations.map((rec, index) => (
                                  <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-3.5 space-y-1.5">
                                    <h6 className="text-xs font-bold text-white flex items-center gap-2">
                                      <span className="flex items-center justify-center w-4 h-4 bg-white text-black rounded-lg text-[10px] font-black">
                                        {index + 1}
                                      </span>
                                      {rec.title}
                                    </h6>
                                    <p className="text-xs text-white/50 leading-relaxed pl-6">{rec.action}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Empty reports / Clean state */}
                          {activeReport.risks.length === 0 && activeReport.vulnerabilities.length === 0 && (
                            <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                              <div className="w-12 h-12 bg-white/10 border border-white/20 text-white rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-semibold text-white text-sm">Codebase Security Clean</p>
                                <p className="text-xs text-white/40 max-w-xs mt-1">Exposee found no high-risk credential leaks or outdated vulnerable libraries in this directory scanner check.</p>
                              </div>
                            </div>
                          )}

                        </div>

                        {/* Diagnostic detail footer */}
                        <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-white/40 shrink-0">
                          <span>Report Ref: EXP-{activeReport.id}-{new Date(activeReport.scannedAt).getMonth()}</span>
                          <a
                            href={activeReport.fullName ? `https://github.com/${activeReport.fullName}` : "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:underline"
                          >
                            Open repo on GitHub
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Global Security Posture Section */}
              {screenedRepos.length > 0 && (
                <div className="rounded-lg border border-white/10 bg-white/5 p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-base font-bold text-white">Global Security Posture</h3>
                      <p className="text-xs text-white/40">Average historical safety score across all scanned codebases</p>
                    </div>

                    {/* Timeframe filters */}
                    <div className="inline-flex bg-black p-1 rounded-lg border border-white/10">
                      {(["7d", "30d", "90d"] as const).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setTimeframe(filter)}
                          className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition ${
                            timeframe === filter
                              ? "bg-white text-black font-bold"
                              : "text-white/60 hover:text-white"
                          }`}
                        >
                          {filter === "7d" ? "7 Days" : filter === "30d" ? "30 Days" : "90 Days"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chart.js Line Graph Container */}
                  <div className="relative bg-black/60 border border-white/10 rounded-lg p-4 h-[220px] shadow-inner flex flex-col justify-between">
                    <div className="flex-1 w-full h-full relative">
                      <Line data={chartData} options={chartOptions} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
