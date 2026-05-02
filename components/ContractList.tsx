import { format, formatDistanceToNowStrict, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContractRecord } from "@/types/contract";

type ContractListProps = {
  contracts: ContractRecord[];
};

function statusBadge(nextDeadline: string | null) {
  if (!nextDeadline) {
    return <Badge variant="outline">No deadlines</Badge>;
  }

  const diff = parseISO(nextDeadline).getTime() - Date.now();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));

  if (days <= 14) {
    return <Badge variant="danger">Due in {Math.max(days, 0)}d</Badge>;
  }

  if (days <= 45) {
    return <Badge variant="warning">Due in {days}d</Badge>;
  }

  return <Badge variant="default">On track</Badge>;
}

export function ContractList({ contracts }: ContractListProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Tracked contracts</CardTitle>
      </CardHeader>
      <CardContent>
        {contracts.length === 0 ? (
          <p className="text-sm text-slate-400">No contracts yet. Upload your first agreement to start reminders.</p>
        ) : (
          <div className="space-y-3">
            {contracts.map((contract) => (
              <div key={contract.id} className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-100">{contract.title}</p>
                    <p className="text-sm text-slate-400">{contract.vendor ?? "Vendor not specified"}</p>
                  </div>
                  {statusBadge(contract.nextDeadline)}
                </div>
                <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
                  <p>
                    Renewal: <span className="text-slate-200">{contract.renewalDate ?? "-"}</span>
                  </p>
                  <p>
                    Cancellation: <span className="text-slate-200">{contract.cancellationDate ?? "-"}</span>
                  </p>
                  <p>
                    Payment: <span className="text-slate-200">{contract.paymentDate ?? "-"}</span>
                  </p>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Added {formatDistanceToNowStrict(parseISO(contract.uploadedAt), { addSuffix: true })} • Next deadline {" "}
                  {contract.nextDeadline ? format(parseISO(contract.nextDeadline), "PPP") : "not detected"}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
