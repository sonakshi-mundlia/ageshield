"use client";

import { SecurityEvent } from "@/lib/api";

interface AuditDetailsProps {
  event: SecurityEvent;
}

export default function AuditDetails({
  event,
}: AuditDetailsProps) {
  const decision = getMetadataValue(
    event.metadata_json,
    ["decision", "security_decision"]
  );

  const agent = getMetadataValue(
    event.metadata_json,
    ["agent", "agent_name", "agent_id"]
  );

  const severity = event.severity.toUpperCase();

  const severityClass =
    {
      LOW: "bg-green-50 text-green-700",
      MEDIUM: "bg-yellow-50 text-yellow-700",
      HIGH: "bg-orange-50 text-orange-700",
      CRITICAL: "bg-red-50 text-red-700",
    }[severity] || "bg-gray-100 text-gray-600";

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Audit Event
          </p>

          <h2 className="mt-1 text-lg font-bold text-gray-900">
            {formatEventType(event.event_type)}
          </h2>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${severityClass}`}
        >
          {severity}
        </span>
      </div>

      {/* Event message */}
      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Activity
        </p>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          {event.message}
        </p>
      </div>

      {/* Details */}
      <div className="mt-6 grid gap-5 border-t border-gray-100 pt-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-gray-400">
            Event ID
          </p>

          <p className="mt-1 text-sm font-medium text-gray-900">
            #{event.id}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-400">
            Agent
          </p>

          <p className="mt-1 text-sm text-gray-600">
            {agent || "—"}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-400">
            Decision
          </p>

          <p className="mt-1 text-sm font-medium text-gray-900">
            {decision || "—"}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-400">
            Time
          </p>

          <p className="mt-1 text-sm text-gray-600">
            {formatDate(event.created_at)}
          </p>
        </div>
      </div>

      {/* Metadata */}
      {Object.keys(event.metadata_json || {}).length > 0 && (
        <div className="mt-6 border-t border-gray-100 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Event Metadata
          </p>

          <div className="mt-3 rounded-lg bg-gray-50 p-4">
            <div className="space-y-2">
              {Object.entries(event.metadata_json).map(
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

/* ---------------- Helpers ---------------- */

function getMetadataValue(
  metadata: Record<string, unknown>,
  keys: string[]
): string | null {
  for (const key of keys) {
    const value = metadata?.[key];

    if (
      typeof value === "string" ||
      typeof value === "number"
    ) {
      return String(value);
    }
  }

  return null;
}

function formatEventType(value: string): string {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}
