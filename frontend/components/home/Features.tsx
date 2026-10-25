export default function Features() {
  const features = [
    {
      category: "Agent Security",
      items: [
        "AI agent registration",
        "Tool permissions",
        "Company security policies",
      ],
    },
    {
      category: "Risk & Detection",
      items: [
        "Risk evaluation",
        "Prompt injection detection",
        "Sensitive data detection",
      ],
    },
    {
      category: "Governance",
      items: [
        "Human approvals",
        "Security incidents",
        "Audit logging",
      ],
    },
    {
      category: "Configuration",
      items: [
        "Company-specific configuration",
      ],
    },
  ];

  return (
    <section id="features" className="section bg-gray-50">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold tracking-[0.2em] text-red-500">
            PLATFORM CAPABILITIES
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
            Security built around your company.
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            AgeShield brings the controls, detection, governance, and
            configuration needed to operate AI agents safely in real-world
            environments.
          </p>
        </div>

        {/* Feature groups */}
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.category}
              className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="h-2 w-10 rounded-full bg-red-400" />

                <h3 className="text-lg font-bold text-gray-900">
                  {feature.category}
                </h3>
              </div>

              <div className="mt-6 space-y-3">
                {feature.items.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-50 text-xs font-bold text-red-500">
                      ✓
                    </span>

                    <span className="text-sm font-medium text-gray-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom statement */}
        <div className="mx-auto mt-14 max-w-3xl text-center">
          <p className="text-sm font-medium text-gray-500">
            Configure the security layer to match your organization's
            requirements, workflows, and risk tolerance.
          </p>
        </div>
      </div>
    </section>
  );
}
