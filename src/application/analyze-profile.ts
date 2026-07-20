import type { Analysis, LanguageShare, Repository } from "@/domain/github";
import { buildSuggestions, calculateQuality } from "@/domain/scoring";
import { GitHubClient, type GitHubEvent, type GitHubRepo } from "@/infrastructure/github-client";

const languageColors: Record<string, string> = { TypeScript: "#7c6cff", JavaScript: "#f3c84b", Python: "#4f8dcc", Go: "#43c6db", Rust: "#e69766", Java: "#ee6b64", Shell: "#62d393" };

export class AnalyzeProfile {
  constructor(private readonly github = new GitHubClient()) {}

  private async inspectRepo(owner: string, repo: GitHubRepo): Promise<Repository> {
    const root = `/repos/${owner}/${repo.name}`;
    const [tree, commits, pullRequests] = await Promise.all([
      this.github.tree(owner, repo.name, repo.default_branch),
      this.github.count(`${root}/commits?sha=${repo.default_branch}`),
      this.github.count(`${root}/pulls?state=all`),
    ]);
    const paths = tree.tree.map((item) => item.path.toLowerCase());
    const hasReadme = paths.some((path) => /^readme(?:\.|$)/.test(path));
    const hasTests = paths.some((path) => /(^|\/)(__tests__|tests?|spec)(\/|\.|$)/.test(path));
    const hasLicense = paths.some((path) => /^licen[cs]e(?:\.|$)/.test(path));
    const hasActions = paths.some((path) => path.startsWith(".github/workflows/") && /\.ya?ml$/.test(path));
    const input = { hasReadme, hasTests, hasLicense, hasActions, updatedAt: repo.updated_at };
    return {
      id: repo.id,
      name: repo.name,
      description: repo.description ?? "",
      url: repo.html_url,
      language: repo.language ?? "Other",
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      openIssues: repo.open_issues_count,
      commits,
      pullRequests,
      ...input,
      quality: calculateQuality(input),
      suggestions: buildSuggestions(input),
    };
  }

  async execute(username: string): Promise<Analysis> {
    const [user, rawRepos, events] = await Promise.all([this.github.user(username), this.github.repositories(username), this.github.events(username)]);
    const repositories = await Promise.all(rawRepos.filter((repo) => !repo.fork).slice(0, 12).map((repo) => this.inspectRepo(username, repo)));
    const languageCounts = repositories.reduce<Record<string, number>>((acc, repo) => ({ ...acc, [repo.language]: (acc[repo.language] ?? 0) + 1 }), {});
    const languages: LanguageShare[] = Object.entries(languageCounts).map(([name, value]) => ({ name, value: Math.round((value / Math.max(repositories.length, 1)) * 100), color: languageColors[name] ?? "#94a3b8" }));
    const eventTotals = events.reduce<Record<string, { commits: number; contributions: number }>>((acc, event: GitHubEvent) => {
      const date = event.created_at.slice(0, 10);
      const current = acc[date] ?? { commits: 0, contributions: 0 };
      const commits = event.type === "PushEvent" ? event.payload.commits?.length ?? 0 : 0;
      return { ...acc, [date]: { commits: current.commits + commits, contributions: current.contributions + 1 } };
    }, {});
    const activity = Array.from({ length: 14 }, (_, index) => {
      const date = new Date(Date.now() - (13 - index) * 86400000).toISOString().slice(0, 10);
      return { date, commits: eventTotals[date]?.commits ?? 0, contributions: eventTotals[date]?.contributions ?? 0 };
    });
    return {
      profile: {
        login: user.login,
        name: user.name ?? user.login,
        avatarUrl: user.avatar_url,
        bio: user.bio ?? "",
        followers: user.followers,
        following: user.following,
        publicRepos: user.public_repos,
        totalStars: repositories.reduce((sum, repo) => sum + repo.stars, 0),
        totalCommits: repositories.reduce((sum, repo) => sum + repo.commits, 0),
        totalPullRequests: repositories.reduce((sum, repo) => sum + repo.pullRequests, 0),
      },
      repositories,
      languages,
      activity,
      generatedAt: new Date().toISOString(),
      source: "github",
    };
  }
}
