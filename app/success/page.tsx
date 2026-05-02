import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SuccessPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-6 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Purchase received</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-300">
          <p>
            Your payment was completed in Stripe. If webhooks are configured, an unlock email has been sent with your private
            access link.
          </p>
          <p>
            If you already have an unlock token, continue below and paste it to activate paid access on this browser.
          </p>
          <Link
            href="/unlock"
            className="inline-flex rounded-md bg-emerald-400 px-4 py-2 font-semibold text-emerald-950 hover:bg-emerald-300"
          >
            Open unlock page
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
