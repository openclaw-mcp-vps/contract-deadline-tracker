import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContractRecord } from "@/types/contract";

type DeadlineCalendarProps = {
  contracts: ContractRecord[];
};

type CalendarItem = {
  date: string;
  title: string;
  kind: "Renewal" | "Cancellation" | "Payment";
};

export function DeadlineCalendar({ contracts }: DeadlineCalendarProps) {
  const items: CalendarItem[] = [];

  for (const contract of contracts) {
    if (contract.renewalDate) {
      items.push({ date: contract.renewalDate, title: contract.title, kind: "Renewal" });
    }
    if (contract.cancellationDate) {
      items.push({ date: contract.cancellationDate, title: contract.title, kind: "Cancellation" });
    }
    if (contract.paymentDate) {
      items.push({ date: contract.paymentDate, title: contract.title, kind: "Payment" });
    }
  }

  const sorted = items.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()).slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming deadline calendar</CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="text-sm text-slate-400">No deadlines detected yet.</p>
        ) : (
          <div className="space-y-3">
            {sorted.map((item, index) => (
              <div key={`${item.title}-${item.kind}-${index}`} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                <div>
                  <p className="text-sm font-medium text-slate-100">{item.title}</p>
                  <p className="text-xs text-slate-400">{item.kind}</p>
                </div>
                <p className="text-sm text-emerald-300">{format(parseISO(item.date), "MMM d, yyyy")}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
