import { NextResponse } from "next/server";
import { processDueNotifications } from "@/lib/notification-scheduler";

export const runtime = "nodejs";

export async function POST() {
  const result = await processDueNotifications();
  return NextResponse.json(result);
}
