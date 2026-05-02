import { NextResponse } from "next/server";
import { parseContractFile } from "@/lib/contract-parser";
import { saveContract } from "@/lib/database";
import { scheduleContractNotifications } from "@/lib/notification-scheduler";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const title = String(formData.get("title") || "").trim();
  const vendorValue = String(formData.get("vendor") || "").trim();
  const notificationEmail = String(formData.get("email") || "").trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Contract file is required" }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json({ error: "Contract title is required" }, { status: 400 });
  }

  if (!notificationEmail || !notificationEmail.includes("@")) {
    return NextResponse.json({ error: "Valid reminder email is required" }, { status: 400 });
  }

  const parsed = await parseContractFile(file);

  const contract = await saveContract({
    title,
    vendor: vendorValue || null,
    fileName: file.name,
    notificationEmail,
    rawText: parsed.text,
    extracted: parsed.extracted
  });

  await scheduleContractNotifications(contract);

  return NextResponse.json({ contract });
}
