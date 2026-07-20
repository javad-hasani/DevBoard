import type { Analysis, LanguageShare, Repository } from "@/domain/github";
import { buildSuggestions, calculateQuality } from "@/domain/scoring";
import { GitHubClient, type GitHubRepo } from "@/infrastructure/github-client";

const languageColors: Record<string, string> = { TypeScript: "#7c6cff", JavaScript: "#f3c84b", Python: "#4f8dcc", Go: "#43c6db", Rust: "#e69766", Java: "#ee6b64", Shell: "#62d393" };

export class AnalyzeProfile {
  constructor(private readonly github = new GitHubClient()) {}

  private async inspectRepo(owner: string, repo: GitHubRepo): Promise<Repository> {
    const root = `/repos/${owner}/${repo.name}`;
    const [hasReadme, hasTests, hasLicense, hasActions, commits, pullRequests] = await Promise.all([
      this.github.exists(`${root}/readme`),
      Promise.all(["test", "tests", "__tests__", "src/__tests__"].map((path) => this.github.exists(`${root}/contents/${path}`))).then((results) => results.some(Boolean)),
      this.github.exists(`${root}/license`),
      this.github.exists(`${root}/contents/.github/workflows`),
      this.github.count(`${root}/commits?sha=${repo.default_branch}`),
      this.github.count(`${root}/pulls?state=all`),
    ]);
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
    const [user, rawRepos] = await Promise.all([this.github.user(username), this.github.repositories(username)]);
    const repositories = await Promise.all(rawRepos.filter((repo) => !repo.fork).slice(0, 12).map((repo) => this.inspectRepo(username, repo)));
    const languageCounts = repositories.reduce<Record<string, number>>((acc, repo) => ({ ...acc, [repo.language]: (acc[repo.language] ?? 0) + 1 }), {});
    const languages: LanguageShare[] = Object.entries(languageCounts).map(([name, value]) => ({ name, value: Math.round((value / Math.max(repositories.length, 1)) * 100), color: languageColors[name] ?? "#94a3b8" }));
    const activity = Array.from({ length: 14 }, (_, index) => ({ date: new Date(Date.now() - (13 - index) * 86400000).toISOString().slice(0, 10), commits: index % 4, contributions: (index * 3) % 9 }));
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
