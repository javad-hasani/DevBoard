import { NextResponse } from "next/server";
import { getDemoAnalysis } from "@/infrastructure/demo-data";

export async function GET() {
  return NextResponse.json(getDemoAnalysis());
}
