"use client";

import { Approval } from "@/lib/api";

interface ApprovalDetailsProps {
  approval: Approval;
}

export default function ApprovalDetails({
  approval,
}: ApprovalDetailsProps) {
  const status = approval.status.toUpperCase();

  const statusClass =
    status === "APPROVED"
      ? "bg-green-50 text-green-700"
      : status === "REJECTED"
        ? "bg-red-50 text-red-700"
        : "bg-yellow-50 text-yellow-700";

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Human Approval
          </p>

          <h2 className="mt-1 text-lg font-bold text-gray-900">
            Approval Request
          </h2>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
        >
          {status}
        </span>
      </div>

      {/* Basic information */}
      <div className="mt-6 grid gap-5 border-t border-gray-100 pt-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-gray-400">
            Approval ID
          </p>

          <p className="mt-1 text-sm font-medium text-gray-900">
            #{approval.id}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-400">
            Tool Call ID
          </p>

          <p className="mt-1 text-sm font-medium text-gray-900">
            #{approval.tool_call_id}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-400">
            Requested
          </p>

          <p className="mt-1 text-sm text-gray-600">
            {formatDate(approval.created_at)}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-400">
            Decided
          </p>

          <p className="mt-1 text-sm text-gray-600">
            {approval.decided_at
              ? formatDate(approval.decided_at)
              : "Awaiting decision"}
          </p>
        </div>
      </div>

      {/* Details */}
      {Object.keys(approval.details || {}).length > 0 && (
        <div className="mt-6 border-t border-gray-100 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Request Details
          </p>

          <div className="mt-3 rounded-lg bg-gray-50 p-4">
            <div className="space-y-2">
              {Object.entries(approval.details).map(
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

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}
