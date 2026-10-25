import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-2">
        <div>
          <div className="mb-5 inline-flex rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-600">
            AI Agent Security Platform
          </div>

          <h1 className="text-5xl font-bold leading-tight text-gray-900 md:text-6xl">
            Secure every
            <span className="text-red-500"> AI agent action.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
            AgeShield evaluates AI agent tool calls using permissions,
            policies, risk analysis, data protection and approval rules before
            actions are executed.
          </p>

          <div className="mt-8 flex gap-4">
            <Link href="/signup" className="btn-primary">
              Start Protecting
            </Link>

            <a href="#how" className="btn-secondary">
              See How It Works
            </a>
          </div>
        </div>

        <div className="rounded-3xl border border-red-100 bg-gradient-to-br from-red-50 via-white to-yellow-50 p-8">
          <div className="rounded-2xl bg-white p-6 shadow-xl">
            <p className="text-sm font-medium text-gray-500">
              Security Decision
            </p>

            <div className="mt-5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">
                  database_delete
                </p>
                <p className="text-sm text-gray-500">
                  Agent: Finance Assistant
                </p>
              </div>

              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-600">
                BLOCKED
              </span>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-lg bg-gray-50 p-3 text-sm">
                <span className="font-semibold">Risk:</span> High
              </div>

              <div className="rounded-lg bg-orange-50 p-3 text-sm text-orange-700">
                Company policy prohibits destructive database operations.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}