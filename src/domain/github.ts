export type LanguageShare = { name: string; value: number; color: string };

export type ActivityPoint = { date: string; commits: number; contributions: number };

export type RepositoryQuality = {
  total: number;
  readme: number;
  tests: number;
  license: number;
  actions: number;
  maintenance: number;
};

export type Repository = {
  id: number;
  name: string;
  description: string;
  url: string;
  language: string;
  stars: number;
  forks: number;
  openIssues: number;
  commits: number;
  pullRequests: number;
  updatedAt: string;
  hasReadme: boolean;
  hasTests: boolean;
  hasLicense: boolean;
  hasActions: boolean;
  quality: RepositoryQuality;
  suggestions: string[];
};

export type Profile = {
  login: string;
  name: string;
  avatarUrl: string;
  bio: string;
  followers: number;
  following: number;
  publicRepos: number;
  totalStars: number;
  totalCommits: number;
  totalPullRequests: number;
};

export type Analysis = {
  profile: Profile;
  repositories: Repository[];
  languages: LanguageShare[];
  activity: ActivityPoint[];
  generatedAt: string;
  source: "github" | "demo";
};
