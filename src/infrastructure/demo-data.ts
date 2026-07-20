import type { Analysis } from "@/domain/github";
import { calculateQuality } from "@/domain/scoring";

const repositorySeeds = [
  { name: "DevBoard", description: "GitHub intelligence dashboard for modern engineering teams", language: "TypeScript", stars: 1284, forks: 116, commits: 487, pullRequests: 68, openIssues: 14, days: 2, flags: [true, true, true, true] },
  { name: "PulseKit", description: "Composable observability tools for the web", language: "TypeScript", stars: 782, forks: 54, commits: 312, pullRequests: 41, openIssues: 8, days: 14, flags: [true, true, true, false] },
  { name: "AtlasAPI", description: "A compact, typed API starter", language: "Go", stars: 429, forks: 31, commits: 194, pullRequests: 22, openIssues: 5, days: 48, flags: [true, true, false, true] },
  { name: "NexaUI", description: "Accessible React components with thoughtful motion", language: "JavaScript", stars: 241, forks: 19, commits: 132, pullRequests: 18, openIssues: 11, days: 126, flags: [true, false, true, false] },
  { name: "dotfiles", description: "A fast and calm development environment", language: "Shell", stars: 86, forks: 7, commits: 91, pullRequests: 3, openIssues: 1, days: 340, flags: [true, false, false, false] },
];

const colors: Record<string, string> = { TypeScript: "#7c6cff", JavaScript: "#f3c84b", Go: "#43c6db", Shell: "#62d393" };

export const getDemoAnalysis = (login = "octocat"): Analysis => {
  const repositories = repositorySeeds.map((repo, index) => {
    const updatedAt = new Date(Date.now() - repo.days * 86400000).toISOString();
    const input = { hasReadme: repo.flags[0], hasTests: repo.flags[1], hasLicense: repo.flags[2], hasActions: repo.flags[3], updatedAt };
    return {
      id: index + 1,
      name: repo.name,
      description: repo.description,
      url: `https://github.com/${login}/${repo.name}`,
      language: repo.language,
      stars: repo.stars,
      forks: repo.forks,
      openIssues: repo.openIssues,
      commits: repo.commits,
      pullRequests: repo.pullRequests,
      ...input,
      quality: calculateQuality(input),
      suggestions: ["readme", "tests", "license", "actions", "maintenance"].filter((_, flagIndex) => flagIndex > 3 ? repo.days > 180 : !repo.flags[flagIndex]),
    };
  });
  const activity = Array.from({ length: 24 }, (_, index) => ({
    date: new Date(Date.now() - (23 - index) * 86400000).toISOString().slice(0, 10),
    commits: 2 + ((index * 7) % 13),
    contributions: 4 + ((index * 11) % 22),
  }));
  return {
    profile: {
      login,
      name: "Alex Morgan",
      avatarUrl: `https://github.com/${login}.png`,
      bio: "Building useful software and delightful developer experiences.",
      followers: 2841,
      following: 312,
      publicRepos: repositories.length,
      totalStars: repositories.reduce((sum, repo) => sum + repo.stars, 0),
      totalCommits: repositories.reduce((sum, repo) => sum + repo.commits, 0),
      totalPullRequests: repositories.reduce((sum, repo) => sum + repo.pullRequests, 0),
    },
    repositories,
    languages: [
      { name: "TypeScript", value: 58, color: colors.TypeScript },
      { name: "Go", value: 19, color: colors.Go },
      { name: "JavaScript", value: 15, color: colors.JavaScript },
      { name: "Shell", value: 8, color: colors.Shell },
    ],
    activity,
    generatedAt: new Date().toISOString(),
    source: "demo",
  };
};
