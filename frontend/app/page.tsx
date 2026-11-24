import Link from "next/link";

// Phase 1 placeholder — real landing/dashboard routing in Phase 4.
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-bold">English Test Prep Platform</h1>
      <p className="text-gray-600">
        Phase 1 scaffolding complete. See CHANGELOG.md.
      </p>
      <Link href="/dashboard" className="underline">
        Go to dashboard
      </Link>
    </main>
  );
}
