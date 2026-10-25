export default function SecurityDecisions() {
  const decisions = [
    {
      number: "01",
      name: "ALLOW",
      title: "Safe to proceed",
      description:
        "The requested action satisfies the organization's security policies and can proceed without additional intervention.",
      className: "border-green-200 bg-green-50",
      badgeClass: "bg-green-100 text-green-700",
      textClass: "text-green-800",
    },
    {
      number: "02",
      name: "APPROVAL REQUIRED",
      title: "Human oversight",
      description:
        "The action is sensitive or requires additional authorization. AgeShield pauses execution until an approved reviewer allows it.",
      className: "border-yellow-200 bg-yellow-50",
      badgeClass: "bg-yellow-100 text-yellow-700",
      textClass: "text-yellow-800",
    },
    {
      number: "03",
      name: "BLOCK",
      title: "Action denied",
      description:
        "The request violates a security policy or exceeds the agent's permissions, so the action is prevented from executing.",
      className: "border-red-200 bg-red-50",
      badgeClass: "bg-red-100 text-red-700",
      textClass: "text-red-800",
    },
  ];

  return (
    <section className="section bg-white">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold tracking-[0.2em] text-red-500">
            ENFORCEMENT
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
            One request. One security decision.
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            Every action evaluated by AgeShield receives a clear outcome based
            on your organization's policies, permissions, and risk controls.
          </p>
        </div>

        {/* Decisions */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {decisions.map((decision) => (
            <div
              key={decision.name}
              className={`group rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${decision.className}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold ${decision.badgeClass}`}
                >
                  {decision.number}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold tracking-wider ${decision.badgeClass}`}
                >
                  {decision.name}
                </span>
              </div>

              <h3 className={`mt-8 text-2xl font-bold ${decision.textClass}`}>
                {decision.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-gray-700">
                {decision.description}
              </p>

              <div className="mt-7 border-t border-black/5 pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  AgeShield outcome
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom message */}
        <div className="mx-auto mt-14 max-w-4xl text-center">
          <p className="text-base font-medium text-gray-600">
            Security policies stay in control while AI agents continue to
            operate at machine speed.
          </p>
        </div>
      </div>
    </section>
  );
}
