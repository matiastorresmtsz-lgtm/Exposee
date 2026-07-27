import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Helper to calculate CVSS v3.1 score from a vector string
function calculateCvss3Score(vector: string): number {
  const parts: Record<string, string> = {};
  vector.split('/').forEach(part => {
    const [key, val] = part.split(':');
    if (key && val) parts[key] = val;
  });

  const AV: Record<string, number> = { N: 0.85, A: 0.62, L: 0.55, P: 0.20 };
  const AC: Record<string, number> = { L: 0.77, H: 0.44 };
  const UI: Record<string, number> = { N: 0.85, R: 0.62 };
  const CIA: Record<string, number> = { N: 0, L: 0.22, H: 0.56 };

  const scope = parts.S || 'U';
  const av = AV[parts.AV] || 0.85;
  const ac = AC[parts.AC] || 0.77;
  const ui = UI[parts.UI] || 0.85;

  let pr = 0.85;
  if (parts.PR === 'L') {
    pr = scope === 'C' ? 0.68 : 0.62;
  } else if (parts.PR === 'H') {
    pr = scope === 'C' ? 0.50 : 0.27;
  } else if (parts.PR === 'N') {
    pr = 0.85;
  }

  const c = CIA[parts.C] || 0;
  const i = CIA[parts.I] || 0;
  const a = CIA[parts.A] || 0;

  const iscBase = 1 - (1 - c) * (1 - i) * (1 - a);
  if (iscBase <= 0) return 0;

  let impact = 0;
  if (scope === 'U') {
    impact = 6.42 * iscBase;
  } else {
    impact = 7.52 * (iscBase - 0.029) - 3.25 * Math.pow(iscBase - 0.029, 15);
  }

  const exploitability = 8.22 * av * ac * pr * ui;

  let score = 0;
  if (scope === 'U') {
    score = Math.min(impact + exploitability, 10);
  } else {
    score = Math.min(1.08 * (impact + exploitability), 10);
  }

  return Math.ceil(score * 10) / 10;
}

// Helper to determine qualitative severity rating
function getSeverity(vulnDetail: any): "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" {
  const rawSeverity =
    vulnDetail.database_specific?.severity ||
    vulnDetail.ecosystem_specific?.severity;
  if (typeof rawSeverity === "string") {
    const clean = rawSeverity.toUpperCase();
    if (clean === "MODERATE") return "MEDIUM";
    if (["CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(clean)) {
      return clean as any;
    }
  }

  if (Array.isArray(vulnDetail.severity)) {
    for (const sev of vulnDetail.severity) {
      if (sev.type === "CVSS_V3" && typeof sev.score === "string") {
        const score = calculateCvss3Score(sev.score);
        if (score >= 9.0) return "CRITICAL";
        if (score >= 7.0) return "HIGH";
        if (score >= 4.0) return "MEDIUM";
        if (score >= 0.1) return "LOW";
      }
    }
  }

  return "MEDIUM";
}

// Helper to find version that fixes a vulnerability
function getFixedVersion(vulnDetail: any, packageName: string): string {
  if (!vulnDetail.affected) return "Unknown";
  for (const aff of vulnDetail.affected) {
    if (aff.package && aff.package.name === packageName) {
      if (aff.ranges) {
        for (const range of aff.ranges) {
          if (range.events) {
            for (const event of range.events) {
              if (event.fixed) {
                return event.fixed;
              }
            }
          }
        }
      }
    }
  }
  return "N/A";
}

// Helper to search aliases for CVE ID
function getCve(vulnDetail: any): string {
  if (Array.isArray(vulnDetail.aliases)) {
    const cveAlias = vulnDetail.aliases.find((a: string) => a.startsWith("CVE-"));
    if (cveAlias) return cveAlias;
  }
  return vulnDetail.id;
}

// Secret detection patterns with high precision and low false positives
const SECRET_PATTERNS = [
  {
    name: "AWS Access Key ID",
    regex: /\b(AKIA|ASCA|ASIA)[0-9A-Z]{16}\b/,
    severity: "CRITICAL" as const,
    category: "Secret Leak",
  },
  {
    name: "GitHub Personal Access Token",
    regex: /\b(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9]{82})\b/,
    severity: "CRITICAL" as const,
    category: "Secret Leak",
  },
  {
    name: "Slack Webhook URL",
    regex: /https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9_]{8,11}\/B[A-Z0-9_]{8,11}\/[A-Za-z0-9_]{24}/,
    severity: "HIGH" as const,
    category: "Secret Leak",
  },
  {
    name: "Slack Bot Token",
    regex: /\bxox[baprs]-[0-9]{10,12}-[a-zA-Z0-9]{24}\b/,
    severity: "CRITICAL" as const,
    category: "Secret Leak",
  },
  {
    name: "Stripe API Key",
    regex: /\bsk_live_[0-9a-zA-Z]{24}\b/,
    severity: "CRITICAL" as const,
    category: "Secret Leak",
  },
  {
    name: "Google API Key",
    regex: /\bAIzaSy[A-Za-z0-9_-]{33}\b/,
    severity: "HIGH" as const,
    category: "Secret Leak",
  },
  {
    name: "Generic Private Key Header",
    regex: /-----BEGIN[ A-Z0-9_-]+PRIVATE KEY-----/,
    severity: "CRITICAL" as const,
    category: "Secret Leak",
  }
];

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!owner || !repo) {
    return NextResponse.json({ error: "Missing owner or repo query parameters" }, { status: 400 });
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const githubAccessToken = user.privateMetadata?.githubAccessToken as string;

    if (!githubAccessToken) {
      return NextResponse.json({ error: "GitHub account not connected" }, { status: 400 });
    }

    // 1. Fetch repository details to get the default branch
    const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const repoResponse = await fetch(repoUrl, {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Exposee-App",
      },
    });

    if (!repoResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch repository metadata from GitHub" }, { status: repoResponse.status });
    }

    const repoData = await repoResponse.json();
    const defaultBranch = repoData.default_branch || "main";

    // 2. Fetch the repository git tree recursively
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
    const treeResponse = await fetch(treeUrl, {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Exposee-App",
      },
    });

    let files: any[] = [];
    if (treeResponse.ok) {
      const treeData = await treeResponse.json();
      files = treeData.tree || [];
    }

    const risks: any[] = [];
    const vulnerabilities: any[] = [];
    const recommendations: any[] = [];

    let hasEnvFile = false;
    let hasKeys = false;

    const envFilePaths: string[] = [];
    const keyFilePaths: string[] = [];
    const packageJsonFiles: any[] = [];
    const packageLockJsonFiles: any[] = [];

    // Analyze files in the recursive tree list
    for (const file of files) {
      if (file.type === "blob") {
        const pathLower = file.path.toLowerCase();
        const name = pathLower.split("/").pop() || "";

        if (name.includes(".env")) {
          hasEnvFile = true;
          envFilePaths.push(file.path);
        } else if (name.endsWith(".pem") || name === "id_rsa" || name === "id_dsa" || name.endsWith(".key")) {
          hasKeys = true;
          keyFilePaths.push(file.path);
        } else if (name === "package.json") {
          packageJsonFiles.push(file);
        } else if (name === "package-lock.json") {
          packageLockJsonFiles.push(file);
        }
      }
    }

    // Flag exposed environment files
    if (hasEnvFile) {
      risks.push({
        id: "risk-env-exposed",
        title: "Exposed Environment Configuration File",
        description: `Found environment configuration file(s) committed: ${envFilePaths.slice(0, 3).join(", ")}${envFilePaths.length > 3 ? "..." : ""}. Environment files should never be committed to git.`,
        severity: "HIGH",
        category: "Secret Leak",
      });
      recommendations.push({
        title: "Remove environment files from version control",
        action: `Run 'git rm --cached <file_path>' and add them to your .gitignore. Immediately rotate any secrets, credentials, or keys exposed in these files.`,
      });
    }

    // Flag exposed private keys
    if (hasKeys) {
      risks.push({
        id: "risk-key-exposed",
        title: "Exposed Private Key File",
        description: `Found private key file(s) committed: ${keyFilePaths.slice(0, 3).join(", ")}${keyFilePaths.length > 3 ? "..." : ""}. Private keys should never be committed to version control.`,
        severity: "CRITICAL",
        category: "Credentials Leak",
      });
      recommendations.push({
        title: "Revoke and rotate exposed keys/certificates",
        action: "Immediately revoke these keys from all authenticated systems, delete them from the repository history, and rotate credentials.",
      });
    }

    // Helper to fetch content of a blob by its SHA
    const fetchBlobContent = async (sha: string) => {
      try {
        const blobUrl = `https://api.github.com/repos/${owner}/${repo}/git/blobs/${sha}`;
        const res = await fetch(blobUrl, {
          headers: {
            Authorization: `Bearer ${githubAccessToken}`,
            Accept: "application/vnd.github.v3.raw",
            "User-Agent": "Exposee-App",
          },
        });
        if (res.ok) return await res.text();
      } catch (e) {
        console.error("Error fetching blob content:", e);
      }
      return null;
    };

    // 3. Extract dependencies to query OSV API
    const dependenciesToQuery = new Map<string, string>(); // name -> version

    if (packageLockJsonFiles.length > 0) {
      for (const lockFile of packageLockJsonFiles) {
        const content = await fetchBlobContent(lockFile.sha);
        if (content) {
          try {
            const data = JSON.parse(content);
            if (data.packages) {
              for (const [path, pkg] of Object.entries<any>(data.packages)) {
                if (path.includes("node_modules/") && pkg.version) {
                  const name = path.split("node_modules/").pop() || "";
                  if (name) dependenciesToQuery.set(name, pkg.version);
                }
              }
            } else if (data.dependencies) {
              for (const [name, dep] of Object.entries<any>(data.dependencies)) {
                if (dep.version) {
                  dependenciesToQuery.set(name, dep.version);
                }
              }
            }
          } catch (e) {
            console.error(`Error parsing package-lock.json at ${lockFile.path}`, e);
          }
        }
      }
    }

    // Fallback to package.json if lockfile parsing yielded no dependencies
    if (dependenciesToQuery.size === 0 && packageJsonFiles.length > 0) {
      for (const pkgFile of packageJsonFiles) {
        const content = await fetchBlobContent(pkgFile.sha);
        if (content) {
          try {
            const data = JSON.parse(content);
            const combined = {
              ...(data.dependencies || {}),
              ...(data.devDependencies || {}),
            };
            for (const [name, version] of Object.entries(combined)) {
              if (typeof version === "string") {
                const clean = version.replace(/^[~^>=<]+/g, "").split(" ")[0].trim();
                if (/^\d+\.\d+(\.\d+)?/.test(clean)) {
                  dependenciesToQuery.set(name, clean);
                }
              }
            }
          } catch (e) {
            console.error(`Error parsing package.json at ${pkgFile.path}`, e);
          }
        }
      }
    }

    // 4. Query live OSV.dev Database
    if (dependenciesToQuery.size > 0) {
      const queries = Array.from(dependenciesToQuery.entries()).map(([name, version]) => ({
        package: {
          name,
          ecosystem: "npm",
        },
        version,
      }));

      const batchSize = 500;
      const osvResults: any[] = [];

      for (let i = 0; i < queries.length; i += batchSize) {
        const chunk = queries.slice(i, i + batchSize);
        try {
          const res = await fetch("https://api.osv.dev/v1/querybatch", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ queries: chunk }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.results) {
              osvResults.push(...data.results);
            }
          }
        } catch (e) {
          console.error("OSV batch query failed:", e);
        }
      }

      // Map vulnerabilities back to package names
      const vulnIdToPkgMap = new Map<string, { name: string; version: string }[]>();
      for (let i = 0; i < osvResults.length; i++) {
        const query = queries[i];
        const res = osvResults[i];
        if (res && Array.isArray(res.vulns)) {
          for (const v of res.vulns) {
            if (v.id) {
              if (!vulnIdToPkgMap.has(v.id)) {
                vulnIdToPkgMap.set(v.id, []);
              }
              vulnIdToPkgMap.get(v.id)!.push({
                name: query.package.name,
                version: query.version,
              });
            }
          }
        }
      }

      // Fetch detailed vulnerability profiles in parallel
      const uniqueVulnIds = Array.from(vulnIdToPkgMap.keys());
      const vulnDetails = await Promise.all(
        uniqueVulnIds.map(async (id) => {
          try {
            const res = await fetch(`https://api.osv.dev/v1/vulns/${id}`);
            if (res.ok) {
              return await res.json();
            }
          } catch (e) {
            console.error(`Error resolving detailed vuln fields for ${id}:`, e);
          }
          return null;
        })
      );

      // Populate results and recommendations
      for (const detail of vulnDetails) {
        if (!detail) continue;

        const packagesAffected = vulnIdToPkgMap.get(detail.id) || [];
        for (const pkg of packagesAffected) {
          const severity = getSeverity(detail);
          const cve = getCve(detail);
          const fixedVersion = getFixedVersion(detail, pkg.name);
          const rawDescription = detail.summary || detail.details || "No vulnerability details available.";
          const description = rawDescription.length > 250
            ? rawDescription.substring(0, 247) + "..."
            : rawDescription;

          vulnerabilities.push({
            id: `vuln-${detail.id}-${pkg.name}`,
            name: detail.summary || detail.id,
            dependency: pkg.name,
            installedVersion: pkg.version,
            fixedVersion,
            severity,
            description,
            cve,
          });

          const recTitle = `Upgrade ${pkg.name}`;
          const alreadyRecommended = recommendations.some(r => r.title === recTitle);
          if (!alreadyRecommended) {
            recommendations.push({
              title: recTitle,
              action: `Upgrade '${pkg.name}' from ${pkg.version} to at least ${fixedVersion} to resolve ${cve}.`,
            });
          }
        }
      }
    }

    // 5. Hardcoded secrets scanning inside candidate source/config files
    const candidateFiles = files.filter(f => {
      if (f.type !== "blob") return false;
      const pathLower = f.path.toLowerCase();
      if (
        pathLower.includes("package-lock.json") ||
        pathLower.includes("yarn.lock") ||
        pathLower.includes("pnpm-lock.yaml") ||
        pathLower.includes("node_modules/") ||
        pathLower.includes(".git/") ||
        pathLower.includes("dist/") ||
        pathLower.includes("build/") ||
        pathLower.includes(".next/") ||
        pathLower.endsWith(".png") ||
        pathLower.endsWith(".jpg") ||
        pathLower.endsWith(".jpeg") ||
        pathLower.endsWith(".gif") ||
        pathLower.endsWith(".svg") ||
        pathLower.endsWith(".ico") ||
        pathLower.endsWith(".md") ||
        pathLower.endsWith(".pdf") ||
        pathLower.endsWith(".woff") ||
        pathLower.endsWith(".woff2") ||
        pathLower.endsWith(".ttf")
      ) {
        return false;
      }

      return (
        pathLower.includes("config") ||
        pathLower.includes("setting") ||
        pathLower.includes("secret") ||
        pathLower.includes("auth") ||
        pathLower.includes("key") ||
        pathLower.includes("cred") ||
        pathLower.includes("db") ||
        pathLower.includes("env") ||
        pathLower.includes("server") ||
        pathLower.includes("app.js") ||
        pathLower.includes("app.ts") ||
        pathLower.includes("index.js") ||
        pathLower.includes("index.ts")
      );
    }).slice(0, 15); // Scan at most 15 files to maintain speed

    await Promise.all(
      candidateFiles.map(async (f) => {
        const content = await fetchBlobContent(f.sha);
        if (content) {
          for (const pattern of SECRET_PATTERNS) {
            if (pattern.regex.test(content)) {
              risks.push({
                id: `risk-secret-${f.sha}`,
                title: `Hardcoded ${pattern.name}`,
                description: `Detected potential hardcoded ${pattern.name} in '${f.path}'. Committing secrets exposes credentials.`,
                severity: pattern.severity,
                category: pattern.category,
              });

              recommendations.push({
                title: `Rotate hardcoded ${pattern.name} in ${f.path}`,
                action: `Rotate the leaked credential, remove it from '${f.path}', load it via environment variables, and scrub git history.`,
              });
            }
          }
        }
      })
    );

    // Calculate dynamic Safety Score
    let score = 100;
    for (const r of risks) {
      if (r.severity === "CRITICAL") score -= 40;
      else if (r.severity === "HIGH") score -= 25;
      else if (r.severity === "MEDIUM") score -= 15;
      else if (r.severity === "LOW") score -= 5;
    }
    for (const v of vulnerabilities) {
      if (v.severity === "CRITICAL") score -= 40;
      else if (v.severity === "HIGH") score -= 25;
      else if (v.severity === "MEDIUM") score -= 15;
      else if (v.severity === "LOW") score -= 5;
    }
    score = Math.max(0, Math.min(100, score));

    return NextResponse.json({
      repoName: repo,
      repoOwner: owner,
      safetyScore: score,
      risks,
      vulnerabilities,
      recommendations,
      scannedAt: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error("Scanning process failed:", error);
    return NextResponse.json({ error: error.message || "Failed to scan repository" }, { status: 500 });
  }
}
