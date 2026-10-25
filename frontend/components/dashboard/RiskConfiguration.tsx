export default function RiskConfiguration() {
  return (
    <div className="card p-6">
      <h2 className="text-lg font-bold">Risk Configuration</h2>

      <div className="mt-6 space-y-4">
        <RiskRow label="Low threshold" value="30" />
        <RiskRow label="Medium threshold" value="60" />
        <RiskRow label="High threshold" value="80" />
      </div>
    </div>
  );
}

function RiskRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}