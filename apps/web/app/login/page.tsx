"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { apiPost } from "../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await apiPost<{ status: string }>("/auth/login", { email, password });
      if (result.status === "mfa_required") {
        setMfaRequired(true);
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function onSubmitMfa(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiPost("/auth/login/mfa", { code });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid MFA code");
    } finally {
      setSubmitting(false);
    }
  }

  if (mfaRequired) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-24">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Enter your MFA code</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmitMfa} className="flex flex-col gap-4">
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
              <Button type="submit" disabled={submitting}>
                {submitting ? "Verifying..." : "Verify"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-24">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <span className="text-primary">A</span>ddMin
          </CardTitle>
          <CardDescription>Log in to see what&apos;s due across your offices.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmitPassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting ? "Logging in..." : "Log in"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </a>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
