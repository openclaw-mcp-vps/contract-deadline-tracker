import { NextResponse } from "next/server";
import { getContracts } from "@/lib/database";

export const runtime = "nodejs";

export async function GET() {
  const contracts = await getContracts();
  return NextResponse.json({ contracts });
}
