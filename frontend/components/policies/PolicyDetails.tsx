"use client";

import { Policy } from "@/lib/api";

interface PolicyDetailsProps {
  policy: Policy;
}

export default function PolicyDetails({
  policy,
}: PolicyDetailsProps) {
  const actionClass = {
    ALLOW: "bg-green-50 text-green-700",
    BLOCK: "bg-red-50 text-red-700",
    APPROVAL_REQUIRED: "bg-yellow-50 text-yellow-700",
  }[policy.action] || "bg-gray-100 text-gray-600";

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Security Policy
          </p>

          <h2 className="mt-1 text-lg font-bold text-gray-900">
            {policy.name}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${actionClass}`}
          >
            {policy.action}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              policy.enabled
                ? "bg-green-50 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {policy.enabled ? "Enabled" : "Disabled"}
          </span>
        </div>
      </div>

      {/* Policy information */}
      <div className="mt-6 grid gap-5 border-t border-gray-100 pt-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-gray-400">
            Policy ID
          </p>

          <p className="mt-1 text-sm font-medium text-gray-900">
            #{policy.id}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-400">
            Tool
          </p>

          <p className="mt-1 text-sm font-medium text-gray-900">
            {policy.tool_name}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-400">
            Minimum Amount
          </p>

          <p className="mt-1 text-sm text-gray-600">
            {policy.min_amount !== null
              ? policy.min_amount
              : "No minimum"}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-400">
            Maximum Amount
          </p>

          <p className="mt-1 text-sm text-gray-600">
            {policy.max_amount !== null
              ? policy.max_amount
              : "No maximum"}
          </p>
        </div>
      </div>

      {/* Conditions */}
      {Object.keys(policy.conditions || {}).length > 0 && (
        <div className="mt-6 border-t border-gray-100 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Conditions
          </p>

          <div className="mt-3 rounded-lg bg-gray-50 p-4">
            <div className="space-y-2">
              {Object.entries(policy.conditions).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className="flex flex-col gap-1 sm:flex-row sm:gap-2"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {formatKey(key)}:
                    </span>

                    <span className="text-sm text-gray-500">
                      {formatValue(value)}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatKey(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}
