import { Resend } from "resend";
import {
  createDeadlineNotifications,
  getDueNotifications,
  markNotificationSent
} from "@/lib/database";
import type { ContractRecord } from "@/types/contract";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function scheduleContractNotifications(contract: ContractRecord) {
  await createDeadlineNotifications(contract);
}

function formatKind(kind: string) {
  if (kind === "renewal") {
    return "renewal";
  }

  if (kind === "cancellation") {
    return "cancellation notice";
  }

  return "payment";
}

export async function processDueNotifications() {
  if (!resend) {
    return { sent: 0, skipped: 0, reason: "RESEND_API_KEY missing" };
  }

  const due = await getDueNotifications();
  let sent = 0;
  let skipped = 0;

  for (const notification of due) {
    const deadlineDate =
      notification.kind === "renewal"
        ? notification.renewal_date
        : notification.kind === "cancellation"
          ? notification.cancellation_date
          : notification.payment_date;

    if (!deadlineDate) {
      skipped += 1;
      continue;
    }

    await resend.emails.send({
      from: "Contract Deadline Tracker <alerts@updates.contractdeadline.app>",
      to: [notification.email],
      subject: `Upcoming ${formatKind(notification.kind)} deadline: ${notification.title}`,
      html: `<p>Your contract <strong>${notification.title}</strong> has a ${formatKind(
        notification.kind
      )} deadline on <strong>${deadlineDate}</strong>.</p>
      <p>Vendor: ${notification.vendor ?? "Not specified"}</p>
      <p>Open your dashboard to review options and prevent unwanted auto-renewals.</p>`
    });

    await markNotificationSent(notification.id);
    sent += 1;
  }

  return { sent, skipped };
}
