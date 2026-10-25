export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Agent sends a request",
      text: "An AI agent attempts to perform an action through a connected tool or API.",
    },
    {
      number: "02",
      title: "AgeShield intercepts it",
      text: "The request passes through AgeShield before the action reaches the target system.",
    },
    {
      number: "03",
      title: "Risk is evaluated",
      text: "AgeShield checks the request against security policies, permissions, sensitive data rules, and risk controls.",
    },
    {
      number: "04",
      title: "A decision is returned",
      text: "The action is allowed, blocked, or flagged for additional review based on the configured policies.",
    },
  ];

  return (
    <section id="how" className="section bg-gray-50">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold tracking-[0.2em] text-red-500">
            HOW IT WORKS
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
            Security decisions before execution.
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            AgeShield evaluates agent actions before they reach your systems,
            giving organizations a control point between AI decisions and
            real-world execution.
          </p>
        </div>

        {/* Flow */}
        <div className="relative mt-16">
          {/* Connecting line */}
          <div className="absolute left-[12%] right-[12%] top-7 hidden h-px bg-gray-200 md:block" />

          <div className="grid gap-8 md:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                {/* Step number */}
                <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 border-gray-50 bg-red-500 text-sm font-bold text-white shadow-sm">
                  {step.number}
                </div>

                {/* Content */}
                <div className="mt-7 rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <h3 className="text-lg font-bold tracking-tight text-gray-900">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom statement */}
        <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-red-100 bg-white px-6 py-5 text-center shadow-sm">
          <p className="text-sm font-medium text-gray-700">
            <span className="font-bold text-red-500">Key principle:</span>{" "}
            AI can decide what it wants to do — AgeShield helps determine
            whether it is allowed to do it.
          </p>
        </div>
      </div>
    </section>
  );
}
