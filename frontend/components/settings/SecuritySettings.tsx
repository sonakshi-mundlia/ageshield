"use client";

import { useEffect, useState } from "react";
import {
getEffectiveConfiguration,
EffectiveConfigurationResponse,
} from "@/lib/api";

const securitySettings = [
{
key: "prompt_injection_detection",
label: "Prompt injection detection",
},
{
key: "sensitive_data_detection",
label: "Sensitive data detection",
},
{
key: "tool_permission_check",
label: "Tool permission checks",
},
{
key: "audit_logging",
label: "Audit logging",
},
];

export default function SecuritySettings() {
const [data, setData] =
useState<EffectiveConfigurationResponse | null>(null);

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
async function loadSettings() {
try {
setLoading(true);
setError("");

    const result = await getEffectiveConfiguration();

    setData(result);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Failed to load security settings."
    );
  } finally {
    setLoading(false);
  }
}

loadSettings();

}, []);

function isEnabled(key: string): boolean {
const value = data?.configuration?.[key];

return value === true;

}

return ( <section className="card p-6"> <div className="border-b border-gray-200 pb-5"> <h2 className="text-lg font-bold text-gray-900">
Security Settings </h2>

    <p className="mt-1 text-sm text-gray-500">
      Global security protections applied by AgeShield.
    </p>
  </div>

  {loading && (
    <p className="mt-6 text-sm text-gray-500">
      Loading security settings...
    </p>
  )}

  {error && (
    <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-700">{error}</p>
    </div>
  )}

  {!loading && !error && data && (
    <div className="mt-6 space-y-4">
      {securitySettings.map((setting) => {
        const enabled = isEnabled(setting.key);

        return (
          <div
            key={setting.key}
            className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
          >
            <span className="text-sm font-medium text-gray-700">
              {setting.label}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                enabled
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {enabled ? "Enabled" : "Disabled"}
            </span>
          </div>
        );
      })}
    </div>
  )}

  {!loading &&
    !error &&
    data &&
    Object.keys(data.configuration).length === 0 && (
      <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-500">
          No effective security configuration is currently available.
        </p>
      </div>
    )}
</section>

);
}
