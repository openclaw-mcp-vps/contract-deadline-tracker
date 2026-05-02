"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function UnlockContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runUnlock = async (value: string) => {
    if (!value) {
      return;
    }

    setLoading(true);
    setStatus(null);

    const response = await fetch("/api/unlock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token: value })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(payload?.error ?? "Unlock failed. Check your token.");
      setLoading(false);
      return;
    }

    setStatus("Access enabled. Redirecting to dashboard...");
    setLoading(false);
    router.push("/dashboard");
  };

  useEffect(() => {
    const urlToken = params.get("token");
    if (urlToken) {
      setToken(urlToken);
      void runUnlock(urlToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-6 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Unlock paid access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-300">
            Paste the unlock token from your purchase email to activate dashboard and upload access on this browser.
          </p>
          <Input value={token} onChange={(e) => setToken(e.target.value.trim())} placeholder="Paste unlock token" />
          <Button onClick={() => runUnlock(token)} disabled={!token || loading}>
            {loading ? "Verifying token..." : "Unlock account"}
          </Button>
          {status ? <p className="text-sm text-slate-300">{status}</p> : null}
        </CardContent>
      </Card>
    </main>
  );
}

export default function UnlockPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-6 py-10">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Unlock paid access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300">Loading unlock form...</p>
            </CardContent>
          </Card>
        </main>
      }
    >
      <UnlockContent />
    </Suspense>
  );
}
