"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
      <main className="mx-auto flex max-w-md flex-col gap-6 px-6 py-24">
        <h1 className="text-2xl font-bold text-gray-900">Enter your MFA code</h1>
        <form onSubmit={onSubmitMfa} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            6-digit code
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              pattern="[0-9]{6}"
              required
              className="rounded-lg border-2 border-gray-200 px-4 py-2 text-gray-900 focus:border-primary-600 focus:outline-none"
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-primary-600 px-6 py-3 font-bold text-white transition duration-200 hover:bg-primary-700 disabled:opacity-50"
          >
            {submitting ? "Verifying..." : "Verify"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-6 py-24">
      <h1 className="text-2xl font-bold text-gray-900">Log in to AddMin</h1>
      <form onSubmit={onSubmitPassword} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-lg border-2 border-gray-200 px-4 py-2 text-gray-900 focus:border-primary-600 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-lg border-2 border-gray-200 px-4 py-2 text-gray-900 focus:border-primary-600 focus:outline-none"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary-600 px-6 py-3 font-bold text-white transition duration-200 hover:bg-primary-700 disabled:opacity-50"
        >
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p className="text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <a href="/signup" className="font-bold text-primary-600 hover:text-primary-700">
          Sign up
        </a>
      </p>
    </main>
  );
}
