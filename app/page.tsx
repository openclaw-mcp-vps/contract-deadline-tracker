import Link from "next/link";
import { ArrowRight, BellRing, CalendarClock, FileSearch, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  {
    question: "How accurate is date extraction?",
    answer:
      "Contract Deadline Tracker uses AI parsing with fallback heuristics and provides confidence scores plus supporting clauses so you can verify each date quickly."
  },
  {
    question: "Do I need legal experience to use this?",
    answer:
      "No. The dashboard highlights renewal, cancellation, and payment deadlines in plain language and sends reminders before each critical window."
  },
  {
    question: "How do reminders work?",
    answer:
      "For each detected deadline, reminders are scheduled 30, 14, 7, and 1 day before the due date to help you act early."
  },
  {
    question: "What happens after I pay?",
    answer:
      "After Stripe checkout completes, you receive an unlock email link. Clicking it sets a secure access cookie and opens the full app."
  }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <p className="text-sm font-semibold text-emerald-300">Contract Deadline Tracker</p>
        <div className="flex items-center gap-3">
          <Link href="/unlock" className="text-sm text-slate-300 hover:text-slate-100">
            Unlock access
          </Link>
          <a
            href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK}
            className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-300"
          >
            Start for $12/mo
          </a>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 pb-16 pt-6 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
            Never miss another contract renewal deadline
          </p>
          <h1 className="text-4xl font-bold leading-tight text-slate-100 md:text-5xl">
            Stop auto-renewal surprises before they hit your cash flow.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-300">
            Upload any contract and get critical dates extracted automatically. Contract Deadline Tracker monitors renewals,
            cancellation notice windows, and payment due dates so small teams never lose leverage to missed timing.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK}
              className="inline-flex items-center gap-2 rounded-md bg-emerald-400 px-5 py-3 font-semibold text-emerald-950 hover:bg-emerald-300"
            >
              Buy now for $12/mo
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-md border border-slate-700 px-5 py-3 font-semibold text-slate-200 hover:bg-slate-800"
            >
              View app preview
            </Link>
          </div>
        </div>

        <Card className="border-slate-800 bg-slate-900/80">
          <CardHeader>
            <CardTitle>Why teams choose this</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300">
            <div className="flex gap-3">
              <FileSearch className="mt-0.5 h-5 w-5 text-emerald-300" />
              <p>Extracts renewal, cancellation, and payment dates from uploaded contracts in minutes.</p>
            </div>
            <div className="flex gap-3">
              <CalendarClock className="mt-0.5 h-5 w-5 text-emerald-300" />
              <p>Builds a forward deadline calendar so upcoming obligations are visible in one place.</p>
            </div>
            <div className="flex gap-3">
              <BellRing className="mt-0.5 h-5 w-5 text-emerald-300" />
              <p>Sends reminders before key dates, helping you renegotiate instead of accepting auto-renewals.</p>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-300" />
              <p>Designed for legal-compliance workflows where timing precision protects margins.</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="border-y border-slate-800 bg-slate-900/40 py-14">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>$50B annual leakage</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              Businesses lose leverage and money from missed contract milestones and silent auto-renewals.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Small team reality</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              Owners and freelancers juggle many agreements without a dedicated legal ops workflow.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Fast setup</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              Upload a contract, confirm extracted dates, and start receiving reminders the same day.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-6 py-16">
        <h2 className="text-center text-3xl font-bold">Simple pricing for deadline protection</h2>
        <Card className="mx-auto mt-8 max-w-xl border-emerald-600/30 bg-emerald-500/10">
          <CardHeader>
            <CardTitle className="text-center text-3xl">$12/month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center text-sm text-slate-200">
            <p>Unlimited contracts, AI date extraction, smart reminders, and deadline dashboard.</p>
            <a
              href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK}
              className="inline-flex items-center justify-center rounded-md bg-emerald-400 px-5 py-3 font-semibold text-emerald-950 hover:bg-emerald-300"
            >
              Continue to Stripe Checkout
            </a>
            <p className="text-xs text-slate-400">Hosted checkout. Cancel anytime.</p>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto w-full max-w-3xl px-6 pb-20">
        <h2 className="text-2xl font-bold">FAQ</h2>
        <div className="mt-6 space-y-4">
          {faqs.map((item) => (
            <Card key={item.question}>
              <CardHeader>
                <CardTitle className="text-base">{item.question}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300">{item.answer}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        Contract Deadline Tracker • Legal-compliance support for small businesses and freelancers
      </footer>
    </main>
  );
}
