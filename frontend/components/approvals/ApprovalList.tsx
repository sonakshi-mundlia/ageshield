"use client";

import { useEffect, useState } from "react";
import {
  getPendingApprovals,
  decideApproval,
  Approval,
} from "@/lib/api";

export default function ApprovalList() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [decidingId, setDecidingId] =
    useState<number | null>(null);

  // ----------------------------------------------------------
  // LOAD PENDING APPROVALS
  // ----------------------------------------------------------

  async function loadApprovals() {
    try {
      setLoading(true);
      setError("");

      const data = await getPendingApprovals();
      setApprovals(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load approval requests."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApprovals();
  }, []);

  // ----------------------------------------------------------
  // DECIDE APPROVAL
  // ----------------------------------------------------------

  async function handleDecision(
    approvalId: number,
    decision: "approved" | "rejected"
  ) {
    try {
      setDecidingId(approvalId);
      setError("");

      await decideApproval(
        approvalId,
        decision
      );

      // Remove the request from the pending list
      // after the decision is successfully saved.
      setApprovals((current) =>
        current.filter(
          (approval) =>
            approval.id !== approvalId
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to process approval."
      );
    } finally {
      setDecidingId(null);
    }
  }

  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------

  return (
    <div>
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Approvals
        </h1>

        <p className="mt-2 text-gray-500">
          Review AI agent actions that require human
          approval.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* APPROVALS */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading approval requests...
          </div>
        ) : approvals.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <span className="text-lg font-semibold text-gray-500">
                ✓
              </span>
            </div>

            <h2 className="mt-4 font-semibold text-gray-900">
              No pending approvals
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              There are currently no AI agent actions
              waiting for human approval.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {approvals.map((approval) => (
              <ApprovalItem
                key={approval.id}
                approval={approval}
                deciding={
                  decidingId === approval.id
                }
                onDecision={handleDecision}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// APPROVAL ITEM
// ============================================================

function ApprovalItem({
  approval,
  deciding,
  onDecision,
}: {
  approval: Approval;
  deciding: boolean;
  onDecision: (
    approvalId: number,
    decision: "approved" | "rejected"
  ) => void;
}) {
  return (
    <div className="p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* REQUEST DETAILS */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-semibold text-gray-900">
              Approval Request #{approval.id}
            </h2>

            <span className="rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700">
              Pending
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Tool Call
              </p>

              <p className="mt-1 text-sm font-medium text-gray-700">
                #{approval.tool_call_id}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Requested
              </p>

              <p className="mt-1 text-sm text-gray-700">
                {formatDate(approval.created_at)}
              </p>
            </div>
          </div>

          {/* DETAILS */}
          {Object.keys(approval.details || {}).length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                Request Details
              </p>

              <div className="rounded-lg bg-gray-50 p-4">
                <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs text-gray-600">
                  {JSON.stringify(
                    approval.details,
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex shrink-0 gap-3 lg:pt-1">
          <button
            onClick={() =>
              onDecision(
                approval.id,
                "rejected"
              )
            }
            disabled={deciding}
            className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deciding
              ? "Processing..."
              : "Reject"}
          </button>

          <button
            onClick={() =>
              onDecision(
                approval.id,
                "approved"
              )
            }
            disabled={deciding}
            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deciding
              ? "Processing..."
              : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DATE FORMATTER
// ============================================================

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}
