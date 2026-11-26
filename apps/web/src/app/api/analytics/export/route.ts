import { NextResponse } from "next/server";


export async function GET() {
  return NextResponse.json(
    {
      error: "Analytics export is temporarily disabled.",
      reason: "The previous implementation used legacy Prisma models.",
      status: "awaiting-operational-schema-integration",
    },
    {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}