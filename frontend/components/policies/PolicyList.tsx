"use client";

import { useEffect, useState } from "react";
import {
  getPolicies,
  createPolicy,
  deletePolicy,
  Policy,
} from "@/lib/api";

export default function PolicyList() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [toolName, setToolName] = useState("");
  const [action, setAction] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [enabled, setEnabled] = useState(true);

  // ----------------------------------------------------------
  // LOAD POLICIES
  // ----------------------------------------------------------

  async function loadPolicies() {
    try {
      setLoading(true);
      setError("");

      const data = await getPolicies();
      setPolicies(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load policies."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPolicies();
  }, []);

  // ----------------------------------------------------------
  // CREATE POLICY
  // ----------------------------------------------------------

  async function handleCreatePolicy(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!name.trim() || !toolName.trim() || !action.trim()) {
      return;
    }

    try {
      setCreating(true);
      setError("");

      const newPolicy = await createPolicy({
        name: name.trim(),
        tool_name: toolName.trim(),
        action: action.trim(),
        min_amount:
          minAmount.trim() === ""
            ? null
            : Number(minAmount),
        max_amount:
          maxAmount.trim() === ""
            ? null
            : Number(maxAmount),
        enabled,
        conditions: {},
      });

      setPolicies((current) => [
        ...current,
        newPolicy,
      ]);

      setName("");
      setToolName("");
      setAction("");
      setMinAmount("");
      setMaxAmount("");
      setEnabled(true);
      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create policy."
      );
    } finally {
      setCreating(false);
    }
  }

  // ----------------------------------------------------------
  // DELETE POLICY
  // ----------------------------------------------------------

  async function handleDeletePolicy(
    policyId: number
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this policy?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(policyId);
      setError("");

      await deletePolicy(policyId);

      setPolicies((current) =>
        current.filter(
          (policy) => policy.id !== policyId
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete policy."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------

  return (
    <div>
      {/* HEADER */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Security Policies
          </h1>

          <p className="mt-2 text-gray-500">
            Define what your AI agents are allowed to do.
          </p>
        </div>

        <button
          onClick={() => setShowForm((value) => !value)}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          {showForm ? "Cancel" : "Add Policy"}
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* CREATE FORM */}
      {showForm && (
        <div className="card mb-6 p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Create Security Policy
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Define a rule that AgeShield will use when evaluating
            agent actions.
          </p>

          <form
            onSubmit={handleCreatePolicy}
            className="mt-5 space-y-4"
          >
            {/* POLICY NAME */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Policy Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="e.g. Require approval for large payments"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                required
              />
            </div>

            {/* TOOL */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Tool Name
              </label>

              <input
                type="text"
                value={toolName}
                onChange={(event) =>
                  setToolName(event.target.value)
                }
                placeholder="e.g. payment_tool"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                required
              />
            </div>

            {/* ACTION */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Action
              </label>

              <input
                type="text"
                value={action}
                onChange={(event) =>
                  setAction(event.target.value)
                }
                placeholder="e.g. transfer_money"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                required
              />
            </div>

            {/* AMOUNT RANGE */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Minimum Amount
                </label>

                <input
                  type="number"
                  min="0"
                  value={minAmount}
                  onChange={(event) =>
                    setMinAmount(event.target.value)
                  }
                  placeholder="Optional"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Maximum Amount
                </label>

                <input
                  type="number"
                  min="0"
                  value={maxAmount}
                  onChange={(event) =>
                    setMaxAmount(event.target.value)
                  }
                  placeholder="Optional"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>
            </div>

            {/* ENABLED */}
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(event) =>
                  setEnabled(event.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300"
              />

              <span className="text-sm font-medium text-gray-700">
                Enable policy immediately
              </span>
            </label>

            {/* SUBMIT */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating
                  ? "Creating..."
                  : "Create Policy"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* POLICIES */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading policies...
          </div>
        ) : policies.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <span className="text-lg font-semibold text-gray-500">
                P
              </span>
            </div>

            <h2 className="mt-4 font-semibold text-gray-900">
              No policies configured
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Create your first security policy to control what
              your AI agents can do.
            </p>

            <button
              onClick={() => setShowForm(true)}
              className="mt-5 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Add Policy
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="p-6"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-semibold text-gray-900">
                        {policy.name}
                      </h2>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          policy.enabled
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {policy.enabled
                          ? "Enabled"
                          : "Disabled"}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                      <div>
                        <span className="text-gray-400">
                          Tool
                        </span>

                        <p className="font-medium text-gray-700">
                          {policy.tool_name}
                        </p>
                      </div>

                      <div>
                        <span className="text-gray-400">
                          Action
                        </span>

                        <p className="font-medium text-gray-700">
                          {policy.action}
                        </p>
                      </div>

                      <div>
                        <span className="text-gray-400">
                          Amount
                        </span>

                        <p className="font-medium text-gray-700">
                          {policy.min_amount !== null ||
                          policy.max_amount !== null
                            ? `${policy.min_amount ?? 0} - ${
                                policy.max_amount ?? "No limit"
                              }`
                            : "No limit"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleDeletePolicy(policy.id)
                    }
                    disabled={deletingId === policy.id}
                    className="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === policy.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
