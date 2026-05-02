import { Pool } from "pg";
import type { ContractRecord, ExtractedContractDates, NotificationRecord } from "@/types/contract";
import { addDays, formatISO, parseISO, startOfDay } from "date-fns";

type ContractInput = {
  title: string;
  vendor: string | null;
  fileName: string;
  notificationEmail: string;
  rawText: string;
  extracted: ExtractedContractDates;
};

type SubscriptionInput = {
  email: string;
  stripeSessionId: string;
  stripeCustomerId: string | null;
  status: string;
};

let schemaReady = false;

const pool =
  globalThis.__contractDeadlinePool ??
  new Pool({
    connectionString: process.env.DATABASE_URL
  });

if (!globalThis.__contractDeadlinePool) {
  globalThis.__contractDeadlinePool = pool;
}

declare global {
  // eslint-disable-next-line no-var
  var __contractDeadlinePool: Pool | undefined;
}

function pickNextDeadline(extracted: ExtractedContractDates) {
  const dates = [extracted.renewalDate, extracted.cancellationDate, extracted.paymentDate]
    .filter((value): value is string => Boolean(value))
    .map((value) => parseISO(value))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  return dates[0] ? formatISO(startOfDay(dates[0]), { representation: "date" }) : null;
}

export async function ensureSchema() {
  if (schemaReady) {
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS contracts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      vendor TEXT,
      file_name TEXT NOT NULL,
      notification_email TEXT NOT NULL,
      uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      renewal_date DATE,
      cancellation_date DATE,
      payment_date DATE,
      next_deadline DATE,
      raw_text TEXT NOT NULL,
      extracted JSONB NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      stripe_session_id TEXT UNIQUE NOT NULL,
      stripe_customer_id TEXT,
      status TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS access_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      used_at TIMESTAMPTZ
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      send_at TIMESTAMPTZ NOT NULL,
      kind TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      sent_at TIMESTAMPTZ
    );
  `);

  schemaReady = true;
}

function mapContractRow(row: Record<string, unknown>): ContractRecord {
  return {
    id: String(row.id),
    title: String(row.title),
    vendor: row.vendor ? String(row.vendor) : null,
    fileName: String(row.file_name),
    notificationEmail: String(row.notification_email),
    uploadedAt: new Date(String(row.uploaded_at)).toISOString(),
    renewalDate: row.renewal_date ? String(row.renewal_date) : null,
    cancellationDate: row.cancellation_date ? String(row.cancellation_date) : null,
    paymentDate: row.payment_date ? String(row.payment_date) : null,
    nextDeadline: row.next_deadline ? String(row.next_deadline) : null,
    rawText: String(row.raw_text),
    extracted: row.extracted as ExtractedContractDates
  };
}

export async function saveContract(input: ContractInput) {
  await ensureSchema();

  const nextDeadline = pickNextDeadline(input.extracted);

  const { rows } = await pool.query(
    `
      INSERT INTO contracts (
        title,
        vendor,
        file_name,
        notification_email,
        renewal_date,
        cancellation_date,
        payment_date,
        next_deadline,
        raw_text,
        extracted
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
      RETURNING *
    `,
    [
      input.title,
      input.vendor,
      input.fileName,
      input.notificationEmail,
      input.extracted.renewalDate,
      input.extracted.cancellationDate,
      input.extracted.paymentDate,
      nextDeadline,
      input.rawText,
      JSON.stringify(input.extracted)
    ]
  );

  return mapContractRow(rows[0] as Record<string, unknown>);
}

export async function getContracts() {
  await ensureSchema();

  const { rows } = await pool.query(`SELECT * FROM contracts ORDER BY next_deadline NULLS LAST, uploaded_at DESC`);
  return rows.map((row) => mapContractRow(row as Record<string, unknown>));
}

export async function saveSubscription(input: SubscriptionInput) {
  await ensureSchema();

  await pool.query(
    `
      INSERT INTO subscriptions (email, stripe_session_id, stripe_customer_id, status)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email)
      DO UPDATE SET
        stripe_session_id = EXCLUDED.stripe_session_id,
        stripe_customer_id = EXCLUDED.stripe_customer_id,
        status = EXCLUDED.status,
        updated_at = NOW()
    `,
    [input.email, input.stripeSessionId, input.stripeCustomerId, input.status]
  );
}

export async function createAccessToken(email: string) {
  await ensureSchema();

  const token = crypto.randomUUID().replace(/-/g, "");

  await pool.query(
    `
      INSERT INTO access_tokens (email, token)
      VALUES ($1, $2)
    `,
    [email, token]
  );

  return token;
}

export async function consumeAccessToken(token: string) {
  await ensureSchema();

  const { rows } = await pool.query(
    `
      UPDATE access_tokens
      SET used_at = NOW()
      WHERE token = $1
      AND used_at IS NULL
      RETURNING email
    `,
    [token]
  );

  return rows[0]?.email ? String(rows[0].email) : null;
}

export async function createDeadlineNotifications(contract: ContractRecord) {
  await ensureSchema();

  const reminders = [30, 14, 7, 1];
  const targets: Array<{ kind: "renewal" | "cancellation" | "payment"; date: string | null }> = [
    { kind: "renewal", date: contract.renewalDate },
    { kind: "cancellation", date: contract.cancellationDate },
    { kind: "payment", date: contract.paymentDate }
  ];

  for (const target of targets) {
    if (!target.date) {
      continue;
    }

    const deadline = parseISO(target.date);
    if (Number.isNaN(deadline.getTime())) {
      continue;
    }

    for (const days of reminders) {
      const sendAt = addDays(deadline, -days);

      if (sendAt.getTime() <= Date.now()) {
        continue;
      }

      await pool.query(
        `
          INSERT INTO notifications (contract_id, email, send_at, kind)
          VALUES ($1, $2, $3, $4)
        `,
        [contract.id, contract.notificationEmail, sendAt.toISOString(), target.kind]
      );
    }
  }
}

export async function getDueNotifications() {
  await ensureSchema();

  const { rows } = await pool.query(
    `
      SELECT n.id, n.contract_id, n.email, n.send_at, n.kind, n.status, n.sent_at,
             c.title, c.vendor, c.renewal_date, c.cancellation_date, c.payment_date
      FROM notifications n
      JOIN contracts c ON c.id = n.contract_id
      WHERE n.status = 'scheduled'
      AND n.send_at <= NOW()
      ORDER BY n.send_at ASC
      LIMIT 100
    `
  );

  return rows as Array<
    NotificationRecord & {
      title: string;
      vendor: string | null;
      renewal_date: string | null;
      cancellation_date: string | null;
      payment_date: string | null;
    }
  >;
}

export async function markNotificationSent(notificationId: string) {
  await ensureSchema();

  await pool.query(
    `
      UPDATE notifications
      SET status = 'sent', sent_at = NOW()
      WHERE id = $1
    `,
    [notificationId]
  );
}
