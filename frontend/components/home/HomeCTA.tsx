import Link from "next/link";

export default function HomeCTA() {
  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gray-950 px-8 py-16 text-center sm:px-12 lg:px-20">
        {/* Label */}
        <p className="text-sm font-bold tracking-[0.2em] text-red-400">
          SECURE YOUR AI OPERATIONS
        </p>

        {/* Heading */}
        <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Give your AI agents a security layer.
        </h2>

        {/* Description */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-300">
          Connect your agents, define your organization's security
          requirements, and control sensitive actions before they reach your
          systems.
        </p>

        {/* CTA */}
        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-xl bg-red-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-600"
          >
            Create Company Account
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-gray-700 px-7 py-3.5 text-sm font-semibold text-gray-200 transition hover:border-gray-500 hover:bg-gray-900"
          >
            Sign In
          </Link>
        </div>

        {/* Supporting text */}
        <p className="mt-7 text-xs text-gray-500">
          Configure policies. Evaluate risk. Control execution.
        </p>
      </div>
    </section>
  );
}
