type GitHubUser = { login: string; name: string | null; avatar_url: string; bio: string | null; followers: number; following: number; public_repos: number };
type GitHubRepo = { id: number; name: string; description: string | null; html_url: string; language: string | null; stargazers_count: number; forks_count: number; open_issues_count: number; updated_at: string; default_branch: string; fork: boolean };
type GitHubTree = { tree: Array<{ path: string; type: "blob" | "tree" }> };
type GitHubEvent = { type: string; created_at: string; payload: { commits?: unknown[]; pull_request?: unknown } };

export class GitHubClient {
  private readonly baseUrl = "https://api.github.com";
  private readonly headers: HeadersInit;

  constructor(token = process.env.GITHUB_TOKEN) {
    this.headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  }

  private async response(path: string) {
    const response = await fetch(`${this.baseUrl}${path}`, { headers: this.headers, next: { revalidate: 300 } });
    if (!response.ok) throw new Error(response.status === 404 ? "NOT_FOUND" : `GITHUB_${response.status}`);
    return response;
  }

  private async request<T>(path: string): Promise<T> {
    const response = await this.response(path);
    return response.json() as Promise<T>;
  }

  user(username: string) {
    return this.request<GitHubUser>(`/users/${username}`);
  }

  repositories(username: string) {
    return this.request<GitHubRepo[]>(`/users/${username}/repos?per_page=100&sort=updated`);
  }

  events(username: string) {
    return this.request<GitHubEvent[]>(`/users/${username}/events/public?per_page=100`);
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
