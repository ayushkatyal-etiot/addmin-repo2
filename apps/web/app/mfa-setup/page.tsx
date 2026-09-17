"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { apiPost } from "../lib/api";

export default function MfaSetupPage() {
  const router = useRouter();
  const [secret, setSecret] = useState<string | null>(null);
  const [otpauthUrl, setOtpauthUrl] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiPost<{ secret: string; otpauthUrl: string }>("/auth/mfa/setup", {})
      .then((res) => {
        setSecret(res.secret);
        setOtpauthUrl(res.otpauthUrl);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not start MFA setup"));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiPost("/auth/mfa/enable", { code });
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-24">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set up multi-factor authentication</CardTitle>
          <CardDescription>Admin accounts require MFA before you can use AddMin.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {secret && (
            <div className="flex flex-col gap-2 rounded-md border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">
                Scan this URL in an authenticator app, or enter the secret manually:
              </p>
              <pre className="overflow-x-auto rounded bg-muted p-2 text-xs">{otpauthUrl}</pre>
              <p className="text-sm text-muted-foreground">
                Manual entry secret: <code className="font-semibold text-foreground">{secret}</code>
              </p>
            </div>
          )}
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="code">6-digit code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                pattern="[0-9]{6}"
                required
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" disabled={submitting || !secret}>
              {submitting ? "Verifying..." : "Enable MFA"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
