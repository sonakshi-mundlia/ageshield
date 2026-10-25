export default function ProtectionStatus() {
  return (
    <div className="card p-6">
      <h2 className="text-lg font-bold">Protection Status</h2>

      <div className="mt-6 space-y-4">
        <StatusRow name="Prompt Injection Detection" />
        <StatusRow name="Sensitive Data Detection" />
        <StatusRow name="Tool Permission Check" />
        <StatusRow name="Audit Logging" />
      </div>
    </div>
  );
}

function StatusRow({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{name}</span>

      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
        Enabled
      </span>
    </div>
  );
}