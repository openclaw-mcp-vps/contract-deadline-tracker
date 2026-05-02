"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CircleCheckBig, FileText, LoaderCircle, UploadCloud, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ContractRecord } from "@/types/contract";

export function ContractUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [vendor, setVendor] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ContractRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    maxFiles: 1,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt", ".md"]
    },
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0] ?? null);
    }
  });

  const uploadDisabled = useMemo(() => {
    return !file || !title.trim() || !email.trim() || isUploading;
  }, [file, title, email, isUploading]);

  const onSubmit = async () => {
    if (!file) {
      return;
    }

    setIsUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("vendor", vendor);
    formData.append("email", email);
    formData.append("notes", notes);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Upload failed. Please retry.");
      setIsUploading(false);
      return;
    }

    const payload = (await response.json()) as { contract: ContractRecord };
    setResult(payload.contract);
    setIsUploading(false);
  };

  return (
    <Card className="border-slate-800 bg-slate-900/60">
      <CardHeader>
        <CardTitle>Upload a contract</CardTitle>
        <CardDescription>
          Drop your contract, extract key deadlines instantly, and schedule reminder emails before expensive misses.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-xl border border-dashed p-8 text-center transition ${
            isDragActive ? "border-emerald-400 bg-emerald-400/10" : "border-slate-700 hover:border-slate-500"
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto mb-3 h-8 w-8 text-emerald-300" />
          <p className="text-sm text-slate-300">
            {file ? `Selected: ${file.name}` : "Drag and drop a PDF or text contract, or click to browse."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-slate-300" htmlFor="title">
              Contract title
            </label>
            <Input id="title" placeholder="Website Hosting Agreement" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-300" htmlFor="vendor">
              Vendor or counterparty
            </label>
            <Input id="vendor" placeholder="Acme Hosting LLC" value={vendor} onChange={(e) => setVendor(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-300" htmlFor="email">
            Reminder email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="owner@business.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-300" htmlFor="notes">
            Optional context
          </label>
          <Textarea
            id="notes"
            placeholder="Monthly payment is due on the 1st. We need 45 days notice for cancellation."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={onSubmit} disabled={uploadDisabled}>
            {isUploading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Extracting deadlines
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Parse contract
              </>
            )}
          </Button>
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          {result ? <p className="text-sm text-emerald-300">Contract analyzed and reminders scheduled.</p> : null}
        </div>

        <Dialog.Root open={Boolean(result)} onOpenChange={(open) => !open && setResult(null)}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-slate-950/75" />
            <Dialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-700 bg-slate-900 p-6">
              <div className="mb-4 flex items-center justify-between">
                <Dialog.Title className="text-lg font-semibold text-slate-100">Deadlines extracted</Dialog.Title>
                <Dialog.Close className="rounded-md p-1 text-slate-300 hover:bg-slate-800" aria-label="Close">
                  <X className="h-4 w-4" />
                </Dialog.Close>
              </div>

              {result ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                    <div className="mb-1 flex items-center gap-2 font-medium">
                      <CircleCheckBig className="h-4 w-4" />
                      {Math.round(result.extracted.confidence * 100)}% extraction confidence
                    </div>
                    <p>{result.extracted.summary}</p>
                  </div>

                  <div className="grid gap-3 text-sm md:grid-cols-3">
                    <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-3">
                      <p className="text-slate-400">Renewal</p>
                      <p className="mt-1 font-semibold">{result.renewalDate ?? "Not found"}</p>
                    </div>
                    <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-3">
                      <p className="text-slate-400">Cancellation notice</p>
                      <p className="mt-1 font-semibold">{result.cancellationDate ?? "Not found"}</p>
                    </div>
                    <div className="rounded-lg border border-slate-700 bg-slate-950/50 p-3">
                      <p className="text-slate-400">Payment date</p>
                      <p className="mt-1 font-semibold">{result.paymentDate ?? "Not found"}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-300">Supporting clauses</p>
                    <ul className="mt-2 space-y-2 text-sm text-slate-400">
                      {result.extracted.keyClauses.length === 0 ? <li>No clear clauses were found.</li> : null}
                      {result.extracted.keyClauses.map((clause, index) => (
                        <li key={`${clause}-${index}`} className="rounded border border-slate-700 bg-slate-950/40 p-2">
                          {clause}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </CardContent>
    </Card>
  );
}
