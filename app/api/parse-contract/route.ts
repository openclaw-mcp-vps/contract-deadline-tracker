import { NextResponse } from "next/server";
import { parseContractFromText } from "@/lib/contract-parser";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { text?: string } | null;

  if (!body?.text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const extracted = await parseContractFromText(body.text);
  return NextResponse.json({ extracted });
}
