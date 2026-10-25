"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getAuditEvents,
  SecurityEvent,
} from "@/lib/api";

export default function IncidentList() {
  const [incidents, setIncidents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadIncidents() {
    try {
      setLoading(true);
      setError("");

      const events = await getAuditEvents(100);

      // Treat security-related events as incidents.
      const securityIncidents = events.filter((event) =>
        isSecurityIncident(event)
      );

      setIncidents(securityIncidents);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load security incidents."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIncidents();
  }, []);

  const criticalCount = useMemo(
    () =>
      incidents.filter(
        (incident) => incident.severity.toUpperCase() === "CRITICAL"
      ).length,
    [incidents]
  );

  const highCount = useMemo(
    () =>
      incidents.filter(
        (incident) => incident.severity.toUpperCase() === "HIGH"
      ).length,
    [incidents]
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Security Incidents
            </h1>

            <p className="mt-2 text-gray-500">
              Review security threats and suspicious activity detected
              across your AI agents.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
              <p className="text-xs font-medium text-gray-500">
                Total Incidents
              </p>
              <p className="mt-1 text-xl font-bold text-gray-900">
                {incidents.length}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
              <p className="text-xs font-medium text-gray-500">
                High / Critical
              </p>
              <p className="mt-1 text-xl font-bold text-red-600">
                {highCount + criticalCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Incidents card */}
      <div className="card overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="font-semibold text-gray-900">
              Recent Security Incidents
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Security events detected by AgeShield.
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading security incidents...
          </div>
        )}

        {/* Empty */}
        {!loading && incidents.length === 0 && (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
              ✓
            </div>

            <h3 className="mt-4 font-semibold text-gray-900">
              No security incidents
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              AgeShield has not detected any security incidents for your
              company.
            </p>
          </div>
        )}

        {/* Incident list */}
        {!loading && incidents.length > 0 && (
          <div className="divide-y divide-gray-100">
            {incidents.map((incident) => (
              <IncidentItem
                key={incident.id}
                incident={incident}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Determines whether an audit/security event
 * should appear in the Security Incidents page.
 */
function isSecurityIncident(event: SecurityEvent): boolean {
  const eventType = event.event_type.toUpperCase();

  const securityKeywords = [
    "SECURITY",
    "INCIDENT",
    "THREAT",
    "ATTACK",
    "INJECTION",
    "SENSITIVE",
    "BLOCKED",
    "VIOLATION",
    "UNAUTHORIZED",
    "SUSPICIOUS",
  ];

  return (
    securityKeywords.some((keyword) =>
      eventType.includes(keyword)
    ) ||
    ["HIGH", "CRITICAL"].includes(
      event.severity.toUpperCase()
    )
  );
}

/* ---------------- Incident Item ---------------- */

function IncidentItem({
  incident,
}: {
  incident: SecurityEvent;
}) {
  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          {/* Title row */}
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-semibold text-gray-900">
              {formatEventType(incident.event_type)}
            </h3>

            <SeverityBadge severity={incident.severity} />
          </div>

          {/* Message */}
          <p className="mt-2 text-sm leading-6 text-gray-600">
            {incident.message}
          </p>

          {/* Metadata */}
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-400">
            <span>Incident #{incident.id}</span>

            <span>
              Detected {formatDate(incident.created_at)}
            </span>
          </div>

          {/* Additional metadata */}
          {Object.keys(incident.metadata_json || {}).length > 0 && (
            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Event Details
              </p>

              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(incident.metadata_json).map(
                  ([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-medium text-gray-600">
                        {formatMetadataKey(key)}:
                      </span>{" "}
                      <span className="text-gray-500">
                        {formatMetadataValue(value)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Incident indicator */}
        <div className="flex shrink-0 items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500" />

          <span className="text-xs font-medium text-gray-500">
            Security Event
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Severity Badge ---------------- */

function SeverityBadge({
  severity,
}: {
  severity: string;
}) {
  const normalizedSeverity = severity.toUpperCase();

  const styles: Record<string, string> = {
    LOW: "bg-green-50 text-green-700",
    MEDIUM: "bg-yellow-50 text-yellow-700",
    HIGH: "bg-orange-50 text-orange-700",
    CRITICAL: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[normalizedSeverity] ||
        "bg-gray-100 text-gray-600"
      }`}
    >
      {normalizedSeverity}
    </span>
  );
}

/* ---------------- Helpers ---------------- */

function formatEventType(value: string): string {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatMetadataKey(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatMetadataValue(value: unknown): string {
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
