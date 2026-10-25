"use client";

import { useEffect, useState } from "react";
import {
  getAuditEvents,
  SecurityEvent,
} from "@/lib/api";

export default function AuditList() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAuditEvents() {
    try {
      setLoading(true);
      setError("");

      const data = await getAuditEvents(100);
      setEvents(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load audit events."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAuditEvents();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Audit Log
        </h1>

        <p className="mt-2 text-gray-500">
          Track security decisions and important activity in your
          company.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        {/* Table header */}
        <div className="hidden grid-cols-5 border-b border-gray-200 bg-gray-50 px-6 py-4 text-sm font-semibold text-gray-600 md:grid">
          <span>Event</span>
          <span>Agent</span>
          <span>Decision</span>
          <span>Severity</span>
          <span>Time</span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading audit events...
          </div>
        )}

        {/* Empty */}
        {!loading && events.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500">
              No audit events recorded yet.
            </p>
          </div>
        )}

        {/* Events */}
        {!loading && events.length > 0 && (
          <div className="divide-y divide-gray-100">
            {events.map((event) => (
              <AuditRow
                key={event.id}
                event={event}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Audit Row ---------------- */

function AuditRow({
  event,
}: {
  event: SecurityEvent;
}) {
  const agent = getMetadataValue(
    event.metadata_json,
    ["agent", "agent_name", "agent_id"]
  );

  const decision = getMetadataValue(
    event.metadata_json,
    ["decision", "security_decision"]
  );

  return (
    <div className="px-6 py-5">
      {/* Desktop */}
      <div className="hidden grid-cols-5 items-center gap-4 md:grid">
        <div>
          <p className="font-medium text-gray-900">
            {formatEventType(event.event_type)}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Event #{event.id}
          </p>
        </div>

        <div className="text-sm text-gray-600">
          {agent || "—"}
        </div>

        <div>
          {decision ? (
            <DecisionBadge decision={decision} />
          ) : (
            <span className="text-sm text-gray-400">
              —
            </span>
          )}
        </div>

        <div>
          <SeverityBadge severity={event.severity} />
        </div>

        <div className="text-sm text-gray-500">
          {formatDate(event.created_at)}
        </div>
      </div>

      {/* Mobile */}
      <div className="space-y-4 md:hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-gray-900">
              {formatEventType(event.event_type)}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Event #{event.id}
            </p>
          </div>

          <SeverityBadge severity={event.severity} />
        </div>

        <p className="text-sm leading-6 text-gray-600">
          {event.message}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400">
              Agent
            </p>

            <p className="mt-1 text-gray-700">
              {agent || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">
              Decision
            </p>

            <div className="mt-1">
              {decision ? (
                <DecisionBadge decision={decision} />
              ) : (
                <span className="text-gray-400">
                  —
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          {formatDate(event.created_at)}
        </p>
      </div>
    </div>
  );
}

/* ---------------- Decision Badge ---------------- */

function DecisionBadge({
  decision,
}: {
  decision: string;
}) {
  const normalized = decision.toUpperCase();

  const styles: Record<string, string> = {
    ALLOW: "bg-green-50 text-green-700",
    APPROVED: "bg-green-50 text-green-700",
    BLOCK: "bg-red-50 text-red-700",
    BLOCKED: "bg-red-50 text-red-700",
    APPROVAL_REQUIRED: "bg-yellow-50 text-yellow-700",
    REJECTED: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[normalized] || "bg-gray-100 text-gray-600"
      }`}
    >
      {normalized}
    </span>
  );
}

/* ---------------- Severity Badge ---------------- */

function SeverityBadge({
  severity,
}: {
  severity: string;
}) {
  const normalized = severity.toUpperCase();

  const styles: Record<string, string> = {
    LOW: "bg-green-50 text-green-700",
    MEDIUM: "bg-yellow-50 text-yellow-700",
    HIGH: "bg-orange-50 text-orange-700",
    CRITICAL: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[normalized] || "bg-gray-100 text-gray-600"
      }`}
    >
      {normalized}
    </span>
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

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}