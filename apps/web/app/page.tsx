export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-start gap-4 px-6 py-24">
      <h1 className="text-3xl font-bold text-gray-900">AddMin</h1>
      <p className="text-gray-600">
        Welcome back. Sign in to see what&apos;s due, overdue, or expiring across your offices.
      </p>
      <a
        href="/login"
        className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-3 font-bold text-white transition duration-200 hover:bg-primary-700"
      >
        Log in
      </a>
    </main>
  );
}
