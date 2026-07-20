type GitHubUser = { login: string; name: string | null; avatar_url: string; bio: string | null; followers: number; following: number; public_repos: number };
type GitHubRepo = { id: number; name: string; description: string | null; html_url: string; language: string | null; stargazers_count: number; forks_count: number; open_issues_count: number; updated_at: string; default_branch: string; fork: boolean };

export class GitHubClient {
  private readonly baseUrl = "https://api.github.com";
  private readonly headers: HeadersInit;

  constructor(token = process.env.GITHUB_TOKEN) {
    this.headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  }

  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, { headers: this.headers, next: { revalidate: 300 } });
    if (!response.ok) throw new Error(response.status === 404 ? "NOT_FOUND" : `GITHUB_${response.status}`);
    return response.json() as Promise<T>;
  }

  user(username: string) {
    return this.request<GitHubUser>(`/users/${username}`);
  }

  repositories(username: string) {
    return this.request<GitHubRepo[]>(`/users/${username}/repos?per_page=100&sort=updated`);
  }

  async count(path: string) {
    const items = await this.request<unknown[]>(`${path}${path.includes("?") ? "&" : "?"}per_page=100`);
    return items.length;
  }

  async exists(path: string) {
    try {
      await this.request<unknown>(path);
      return true;
    } catch {
      return false;
    }
  }
}

export type { GitHubRepo, GitHubUser };
