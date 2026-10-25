export default function ProtectionBanner() {
  return (
    <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
      <div className="flex items-center gap-3">
        <div className="h-3 w-3 rounded-full bg-green-500" />

        <div>
          <h2 className="font-bold text-green-800">
            AgeShield protection is active
          </h2>

          <p className="mt-1 text-sm text-green-700">
            Your configured security controls are being applied to AI
            agent activity.
          </p>
        </div>
      </div>
    </div>
  );
}