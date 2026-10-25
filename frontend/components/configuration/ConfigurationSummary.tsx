"use client";

import { useEffect, useState } from "react";
import {
getEffectiveConfiguration,
EffectiveConfigurationResponse,
} from "@/lib/api";

export default function ConfigurationSummary() {
    const [data, setData] =
    useState<EffectiveConfigurationResponse | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadConfiguration() {
            try {
                setLoading(true);
                setError("");

                const result = await getEffectiveConfiguration();

                setData(result);
            } catch (err) {
                setError(
                err instanceof Error
                ? err.message
                : "Failed to load effective configuration."
                );
            } finally {
                setLoading(false);
            }
        }

    loadConfiguration();

}, []);

if (loading) {
return ( <div className="card p-6"> <h2 className="text-lg font-bold text-gray-900">
Effective Configuration </h2>

    <p className="mt-4 text-sm text-gray-500">
      Loading configuration...
    </p>
  </div>
);

}

if (error) {
return ( <div className="card p-6"> <h2 className="text-lg font-bold text-gray-900">
Effective Configuration </h2>

    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-700">{error}</p>
    </div>
  </div>
);

}

if (!data) {
return ( <div className="card p-6"> <h2 className="text-lg font-bold text-gray-900">
Effective Configuration </h2>

    <p className="mt-4 text-sm text-gray-500">
      No configuration available.
    </p>
  </div>
);

}

const configuration = data.configuration;

return ( <div className="card p-6"> <div className="flex items-start justify-between gap-4"> <div> <h2 className="text-lg font-bold text-gray-900">
Effective Configuration </h2>

      <p className="mt-1 text-sm text-gray-500">
        Security settings currently applied to your company.
      </p>
    </div>

    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
      Active
    </span>
  </div>

  <div className="mt-6 grid gap-4 md:grid-cols-2">
    {Object.entries(configuration).map(([key, value]) => (
      <ConfigItem
        key={key}
        name={formatName(key)}
        value={formatValue(value)}
      />
    ))}
  </div>

  {Object.keys(configuration).length === 0 && (
    <div className="mt-6 rounded-lg bg-gray-50 p-4">
      <p className="text-sm text-gray-500">
        No security configuration has been defined yet.
      </p>
    </div>
  )}
</div>

);
}

function ConfigItem({
name,
value,
}: {
name: string;
value: string;
}) {
const isEnabled = value === "Enabled";
const isDisabled = value === "Disabled";

return ( <div className="rounded-xl border border-gray-200 bg-gray-50 p-4"> <p className="text-sm text-gray-500">
{name} </p>

  <p
    className={`mt-1 font-semibold ${
      isEnabled
        ? "text-green-700"
        : isDisabled
          ? "text-red-700"
          : "text-gray-900"
    }`}
  >
    {value}
  </p>
</div>

);
}

function formatName(key: string): string {
    return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(value: unknown): string {
    if (typeof value === "boolean") {
        return value ? "Enabled" : "Disabled";
    }

    if (value === null || value === undefined) {
        return "Not configured";
    }

    if (typeof value === "string" || typeof value === "number") {
        return String(value);
    }

    if (Array.isArray(value)) {
        return value.length === 0
        ? "None"
        : `${value.length} configured`;
    }

    if (typeof value === "object") {
        return `${Object.keys(value).length} settings`;
    }

    return String(value);
}
