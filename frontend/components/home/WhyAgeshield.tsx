export default function WhyAgeShield() {
  const items = [
    {
      number: "01",
      title: "Uncontrolled actions",
      text: "AI agents can move beyond generating text and directly call tools, APIs, and business systems. A single unsafe action can have real-world consequences.",
      color: "bg-red-50 text-red-600",
    },
    {
      number: "02",
      title: "Sensitive data exposure",
      text: "Agent workflows can access credentials, customer information, financial records, and other sensitive data that requires controlled handling.",
      color: "bg-yellow-50 text-yellow-700",
    },
    {
      number: "03",
      title: "Company-specific policies",
      text: "Security requirements are different for every organization. Teams need control over which actions agents can perform and when approval is required.",
      color: "bg-pink-50 text-pink-600",
    },
  ];

  return (
    <section className="section bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold tracking-[0.2em] text-red-500">
            THE PROBLEM
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
            AI agents need more than intelligence.
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            As AI agents gain access to real systems and sensitive information,
            organizations need a way to control what those agents can actually do.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold ${item.color}`}
                >
                  {item.number}
                </div>

                <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Risk
                </span>
              </div>

              <h3 className="mt-7 text-xl font-bold tracking-tight text-gray-900">
                {item.title}
              </h3>

              <p className="mt-4 leading-7 text-gray-600">
                {item.text}
              </p>

              <div className="mt-7 h-px w-full bg-gray-100" />

              <p className="mt-4 text-sm font-medium text-gray-500">
                Requires policy-based control
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
