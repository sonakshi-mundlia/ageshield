"use client";

import { SecurityEvent } from "@/lib/api";

interface IncidentDetailsProps {
  incident: SecurityEvent;
}

export default function IncidentDetails({
  incident,
}: IncidentDetailsProps) {
  const severity = incident.severity.toUpperCase();

  const severityClass =
    {
      LOW: "bg-green-100 text-green-700",
      MEDIUM: "bg-yellow-100 text-yellow-700",
      HIGH: "bg-orange-100 text-orange-700",
      CRITICAL: "bg-red-100 text-red-700",
    }[severity] || "bg-gray-100 text-gray-700";

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Security Incident
          </p>

          <h2 className="mt-1 text-lg font-bold text-gray-900">
            {formatEventType(incident.event_type)}
          </h2>
        </div>

        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${severityClass}`}
        >
          {severity}
        </span>
      </div>

      {/* Message */}
      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Description
        </p>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          {incident.message}
        </p>
      </div>

      {/* Incident information */}
      <div className="mt-6 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-gray-400">
            Incident ID
          </p>

          <p className="mt-1 text-sm font-medium text-gray-900">
            #{incident.id}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-400">
            Detected
          </p>

          <p className="mt-1 text-sm font-medium text-gray-900">
            {formatDate(incident.created_at)}
          </p>
        </div>
      </div>

      {/* Metadata */}
      {Object.keys(incident.metadata_json || {}).length > 0 && (
        <div className="mt-6 border-t border-gray-100 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Event Details
          </p>

          <div className="mt-3 rounded-lg bg-gray-50 p-4">
            <div className="space-y-2">
              {Object.entries(incident.metadata_json).map(
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
