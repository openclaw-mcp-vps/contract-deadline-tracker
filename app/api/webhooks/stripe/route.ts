import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { createAccessToken, saveSubscription } from "@/lib/database";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing stripe-signature or STRIPE_WEBHOOK_SECRET" }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Webhook signature verification failed",
        details: error instanceof Error ? error.message : "unknown"
      },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email;

    if (email) {
      await saveSubscription({
        email,
        stripeSessionId: session.id,
        stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
        status: "active"
      });

      const token = await createAccessToken(email);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const unlockUrl = `${appUrl}/unlock?token=${token}`;

      if (resend) {
        await resend.emails.send({
          from: "Contract Deadline Tracker <billing@updates.contractdeadline.app>",
          to: [email],
          subject: "Your Contract Deadline Tracker access link",
          html: `<p>Thanks for subscribing to Contract Deadline Tracker.</p>
          <p>Activate your access with this secure link:</p>
          <p><a href=\"${unlockUrl}\">${unlockUrl}</a></p>`
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
