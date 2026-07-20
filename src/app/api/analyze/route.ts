import { NextResponse } from "next/server";
import { AnalyzeProfile } from "@/application/analyze-profile";
import { analysisRequestSchema } from "@/application/schemas";
import { GitHubApiError } from "@/infrastructure/github-client";

export async function POST(request: Request) {
  const parsed = analysisRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "INVALID_USERNAME" }, { status: 400 });
  try {
    const analysis = await new AnalyzeProfile().execute(parsed.data.username);
    return NextResponse.json(analysis, { headers: { "X-DevBoard-Source": "github" } });
  } catch (error) {
    if (error instanceof GitHubApiError && error.status === 404) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    if (error instanceof GitHubApiError && (error.status === 403 || error.status === 429)) {
      return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429, headers: error.retryAfter ? { "Retry-After": error.retryAfter } : undefined });
    }
    return NextResponse.json({ error: "GITHUB_UNAVAILABLE" }, { status: 502 });
  }
}
