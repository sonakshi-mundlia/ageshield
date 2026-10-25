export default function WhatIsAgeShield() {
  return (
    <section id="what" className="section bg-gray-50">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold tracking-[0.2em] text-red-500">
            WHAT IS AGESHIELD?
          </p>

          <h2 className="mt-5 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
            Security infrastructure for
            <span className="block">AI-powered actions.</span>
          </h2>

          <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-gray-600 sm:text-xl">
            AgeShield sits between your AI agents and the tools they control,
            evaluating every sensitive action before it reaches your systems.
            It applies your security policies, risk controls, and company
            configuration to help keep AI-driven operations safe.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
              01
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              Connect your agents
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Integrate your AI agents and the tools they use with a centralized
              security layer.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
              02
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              Evaluate every action
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              AgeShield analyzes sensitive requests and checks them against
              security policies before execution.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
              03
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              Control what happens
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-600">
              Allow, block, or flag risky actions based on your organization’s
              security requirements.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
