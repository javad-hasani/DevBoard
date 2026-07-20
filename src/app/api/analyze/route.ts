import { NextResponse } from "next/server";
import { AnalyzeProfile } from "@/application/analyze-profile";
import { analysisRequestSchema } from "@/application/schemas";
import { getDemoAnalysis } from "@/infrastructure/demo-data";

export async function POST(request: Request) {
  const parsed = analysisRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "INVALID_USERNAME" }, { status: 400 });
  try {
    const analysis = await new AnalyzeProfile().execute(parsed.data.username);
    return NextResponse.json(analysis);
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    return NextResponse.json(getDemoAnalysis(parsed.data.username), { headers: { "X-DevBoard-Source": "demo" } });
  }
}
