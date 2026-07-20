import type { RepositoryQuality } from "./github";

export type QualityInput = {
  hasReadme: boolean;
  hasTests: boolean;
  hasLicense: boolean;
  hasActions: boolean;
  updatedAt: string;
};

export const calculateQuality = (input: QualityInput): RepositoryQuality => {
  const days = Math.max(0, (Date.now() - new Date(input.updatedAt).getTime()) / 86400000);
  const maintenance = days <= 30 ? 20 : days <= 90 ? 15 : days <= 180 ? 10 : days <= 365 ? 5 : 0;
  const result = {
    readme: input.hasReadme ? 25 : 0,
    tests: input.hasTests ? 25 : 0,
    license: input.hasLicense ? 15 : 0,
    actions: input.hasActions ? 15 : 0,
    maintenance,
  };
  return { ...result, total: Object.values(result).reduce((sum, value) => sum + value, 0) };
};

export const buildSuggestions = (input: QualityInput) => {
  const items: string[] = [];
  if (!input.hasReadme) items.push("readme");
  if (!input.hasTests) items.push("tests");
  if (!input.hasLicense) items.push("license");
  if (!input.hasActions) items.push("actions");
  if (Date.now() - new Date(input.updatedAt).getTime() > 15552000000) items.push("maintenance");
  return items;
};
