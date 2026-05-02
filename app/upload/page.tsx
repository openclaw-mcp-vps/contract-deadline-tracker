import Link from "next/link";
import { ContractUpload } from "@/components/ContractUpload";

export default function UploadPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-8">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-slate-200">
          ← Back to dashboard
        </Link>
        <h1 className="mt-3 text-3xl font-bold">Upload and parse a contract</h1>
        <p className="mt-2 text-slate-400">
          Extract deadlines from a PDF, verify key clauses, and schedule reminders automatically.
        </p>
      </div>
      <ContractUpload />
    </main>
  );
}
