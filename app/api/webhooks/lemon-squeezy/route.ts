import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Lemon Squeezy webhook is not active in this build. Use Stripe payment links and /api/webhooks/stripe."
    },
    { status: 410 }
  );
}
