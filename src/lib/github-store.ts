type GitHubContentResponse = {
  sha: string;
  content: string;
  encoding: string;
};

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

function assertGitHubConfig() {
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    throw new Error("Missing GitHub config: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO");
  }
}

function githubUrl(path: string) {
  return `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
}

async function githubRequest(url: string, init?: RequestInit) {
  assertGitHubConfig();
  const connector = url.includes("?") ? "&" : "?";
  const finalUrl = `${url}${connector}t=${Date.now()}`;

  const response = await fetch(finalUrl, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  return response;
}

export async function readRepoFile(path: string): Promise<{ content: string | null; sha: string | null }> {
  const response = await githubRequest(`${githubUrl(path)}?ref=${encodeURIComponent(GITHUB_BRANCH)}`);
  if (response.status === 404) {
    return { content: null, sha: null };
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to read ${path}: ${response.status} ${text}`);
  }

  const data = (await response.json()) as GitHubContentResponse;
  const raw = Buffer.from(data.content, "base64").toString("utf8");
  return { content: raw, sha: data.sha };
}

export async function writeRepoFile(path: string, content: string, message: string, sha?: string | null) {
  const response = await githubRequest(githubUrl(path), {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf8").toString("base64"),
      branch: GITHUB_BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    const error = new Error(`Failed to write ${path}: ${response.status} ${text}`) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
}

export async function writeRepoBinaryFile(path: string, base64Content: string, message: string, sha?: string | null) {
  const response = await githubRequest(githubUrl(path), {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: base64Content,
      branch: GITHUB_BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    const error = new Error(`Failed to write binary ${path}: ${response.status} ${text}`) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
}

export async function deleteRepoFile(path: string, message: string, sha: string) {
  const response = await githubRequest(githubUrl(path), {
    method: "DELETE",
    body: JSON.stringify({
      message,
      sha,
      branch: GITHUB_BRANCH,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to delete ${path}: ${response.status} ${text}`);
  }
}

type DbShape = {
  User: any[];
  PasswordReset: any[];
  SessionToken: any[];
  Theme: any[];
  ThemeLike: any[];
  ThemeView: any[];
  AppSettings: any[];
};

const DB_PATH = "data/db.json";

function createDefaultDb(): DbShape {
  return {
    User: [],
    PasswordReset: [],
    SessionToken: [],
    Theme: [],
    ThemeLike: [],
    ThemeView: [],
    AppSettings: [],
  };
}

export async function loadDb(): Promise<{ db: DbShape; sha: string | null }> {
  const file = await readRepoFile(DB_PATH);
  if (!file.content) {
    const initial = createDefaultDb();
    await writeRepoFile(DB_PATH, JSON.stringify(initial, null, 2), "chore(db): initialize db.json");
    const created = await readRepoFile(DB_PATH);
    return { db: JSON.parse(created.content || "{}"), sha: created.sha };
  }

  const parsed = JSON.parse(file.content);
  return { db: { ...createDefaultDb(), ...parsed }, sha: file.sha };
}

export async function saveDb(db: DbShape, sha: string | null, message: string) {
  await writeRepoFile(DB_PATH, JSON.stringify(db, null, 2), message, sha);
}

export async function saveDbWithRetry(db: DbShape, sha: string | null, message: string, retries = 5) {
  let currentSha = sha;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      if (attempt > 0) {
        console.log(`[db] Retry attempt ${attempt}/${retries} with SHA: ${currentSha?.substring(0, 7)}`);
      }
      await saveDb(db, currentSha, message);
      return;
    } catch (error: any) {
      const isConflict = error?.status === 409 || String(error?.message || "").toLowerCase().includes("sha");
      if (!isConflict || attempt === retries) {
        if (isConflict) {
          console.error(`[db] Conflict persistent after ${retries} retries. Final SHA was: ${currentSha?.substring(0, 7)}`);
        }
        throw error;
      }
      
      console.warn(`[db] Conflict detected (409), reloading DB to get latest SHA...`);
      const latest = await loadDb();
      currentSha = latest.sha;
      
      // Exponential backoff
      const delay = Math.min(200 * (attempt + 1), 1000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export function repoRawUrl(path: string) {
  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;
}

