type GitHubUser = { login: string; name: string | null; avatar_url: string; bio: string | null; followers: number; following: number; public_repos: number };
type GitHubRepo = { id: number; name: string; description: string | null; html_url: string; language: string | null; stargazers_count: number; forks_count: number; open_issues_count: number; updated_at: string; default_branch: string; fork: boolean };
type GitHubTree = { tree: Array<{ path: string; type: "blob" | "tree" }> };
type GitHubEvent = { type: string; created_at: string; payload: { commits?: unknown[]; pull_request?: unknown } };

export class GitHubApiError extends Error {
  constructor(public readonly status: number, public readonly retryAfter?: string) {
    super(status === 404 ? "NOT_FOUND" : status === 403 || status === 429 ? "RATE_LIMITED" : `GITHUB_${status}`);
  }
}

export class GitHubClient {
  private readonly baseUrl = "https://api.github.com";
  private readonly headers: HeadersInit;

  constructor(token = process.env.GITHUB_TOKEN) {
    this.headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  }

  private async response(path: string) {
    const response = await fetch(`${this.baseUrl}${path}`, { headers: this.headers, next: { revalidate: 300 } });
    if (!response.ok) {
      const reset = response.headers.get("x-ratelimit-reset");
      const retryAfter = response.headers.get("retry-after") ?? (reset ? String(Math.max(Number(reset) - Math.floor(Date.now() / 1000), 1)) : undefined);
      throw new GitHubApiError(response.status, retryAfter);
    }
    return response;
  }

  private async request<T>(path: string): Promise<T> {
    const response = await this.response(path);
    return response.json() as Promise<T>;
  }

  user(username: string) {
    return this.request<GitHubUser>(`/users/${encodeURIComponent(username)}`);
  }

  repositories(username: string) {
    return this.request<GitHubRepo[]>(`/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`);
  }

  events(username: string) {
    return this.request<GitHubEvent[]>(`/users/${encodeURIComponent(username)}/events/public?per_page=100`);
  }

  tree(owner: string, repository: string, branch: string) {
    return this.request<GitHubTree>(`/repos/${owner}/${repository}/git/trees/${encodeURIComponent(branch)}?recursive=1`);
  }

  async count(path: string) {
    const response = await this.response(`${path}${path.includes("?") ? "&" : "?"}per_page=1`);
    const items = await response.json() as unknown[];
    const last = response.headers.get("link")?.match(/[?&]page=(\d+)>; rel="last"/);
    return last ? Number(last[1]) : items.length;
  }
}

export type { GitHubEvent, GitHubRepo, GitHubUser };
