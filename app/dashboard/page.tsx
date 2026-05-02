import Link from "next/link";
import { redirect } from "next/navigation";
import { ContractList } from "@/components/ContractList";
import { DeadlineCalendar } from "@/components/DeadlineCalendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPaidAccess } from "@/lib/auth";
import { getContracts } from "@/lib/database";
import type { ContractRecord } from "@/types/contract";

export default async function DashboardPage() {
  if (!(await hasPaidAccess())) {
    redirect("/unlock");
  }

  const contracts: ContractRecord[] = await getContracts().catch(() => [] as ContractRecord[]);
  const urgentCount = contracts.filter((item) => {
    if (!item.nextDeadline) {
      return false;
    }
    const diff = new Date(item.nextDeadline).getTime() - Date.now();
    return diff <= 1000 * 60 * 60 * 24 * 30;
  }).length;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Deadline dashboard</h1>
          <p className="mt-2 text-slate-400">Track every renewal, cancellation, and payment milestone in one workflow.</p>
        </div>
        <Link href="/upload">
          <Button>Upload a contract</Button>
        </Link>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total contracts</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-emerald-300">{contracts.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Urgent in 30 days</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold text-amber-300">{urgentCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reminder cadence</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">30d, 14d, 7d, and 1d before each detected deadline.</CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ContractList contracts={contracts} />
        <DeadlineCalendar contracts={contracts} />
      </div>
    </main>
  );
}
