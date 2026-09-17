"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    <main className="mx-auto flex max-w-md flex-col gap-6 px-6 py-24">
      <h1 className="text-2xl font-bold text-gray-900">Set up multi-factor authentication</h1>
      <p className="text-gray-600">Admin accounts require MFA before you can use AddMin.</p>
      {secret && (
        <div className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-white p-4">
          <p className="text-sm text-gray-600">
            Scan this URL in an authenticator app, or enter the secret manually:
          </p>
          <pre className="overflow-x-auto rounded bg-gray-50 p-2 text-xs text-gray-800">
            {otpauthUrl}
          </pre>
          <p className="text-sm text-gray-600">
            Manual entry secret: <code className="font-bold text-gray-900">{secret}</code>
          </p>
        </div>
      )}
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
          disabled={submitting || !secret}
          className="rounded-lg bg-primary-600 px-6 py-3 font-bold text-white transition duration-200 hover:bg-primary-700 disabled:opacity-50"
        >
          {submitting ? "Verifying..." : "Enable MFA"}
        </button>
      </form>
    </main>
  );
}
