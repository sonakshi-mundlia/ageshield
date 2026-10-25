
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAgents,
  createAgent,
  deactivateAgent,
  deleteAgent,
  getAgentApiKey,
  type Agent,
  type AgentRegistrationResponse,
} from "@/lib/api";

export default function AgentList() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const [createdApiKey, setCreatedApiKey] = useState("");
  const [createdAgentName, setCreatedAgentName] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const [viewingAgentId, setViewingAgentId] = useState<number | null>(null);
  const [viewingApiKey, setViewingApiKey] = useState("");
  const [loadingApiKey, setLoadingApiKey] = useState(false);

  const [deactivatingId, setDeactivatingId] = useState<number | null>(
    null
  );
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Load agents belonging to the authenticated company.
  const loadAgents = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      const data = await getAgents();
      setAgents(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load agents."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadAgents();
  }, [loadAgents]);

  // Register an agent and show its API key once.
  async function handleCreateAgent(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (
      !trimmedName ||
      creating ||
      deactivatingId !== null ||
      deletingId !== null
    ) {
      return;
    }

    try {
      setCreating(true);
      setError("");
      setSuccess("");

      const result: AgentRegistrationResponse = await createAgent(
        trimmedName,
        trimmedDescription
      );

      if (!result.api_key) {
        setError(
          "The server did not return an API key. Check the agent list before attempting registration again."
        );
        await loadAgents(true);
        return;
      }

      const { api_key, ...agentDetails } = result;

      setAgents((current) =>
        [
          ...current.filter((agent) => agent.id !== agentDetails.id),
          agentDetails,
        ].sort((a, b) => b.id - a.id)
      );

      setCreatedApiKey(api_key);
      setCreatedAgentName(result.name);
      setCopied(false);
      setCopyError("");

      setName("");
      setDescription("");
      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to register agent."
      );
    } finally {
      setCreating(false);
    }
  }
  
  async function handleViewApiKey(agent: Agent) {
  try {
    setViewingAgentId(agent.id);
    setViewingApiKey("");
    setError("");
    setLoadingApiKey(true);

    const result = await getAgentApiKey(agent.id);
    setViewingApiKey(result.api_key);
  } catch (err) {
    setViewingAgentId(null);
    setError(
      err instanceof Error
        ? err.message
        : "Failed to retrieve API key."
    );
  } finally {
    setLoadingApiKey(false);
  }
}

function closeViewingApiKey() {
  setViewingAgentId(null);
  setViewingApiKey("");
}

  // Copy the newly generated API key.
  async function handleCopyApiKey() {
    if (!createdApiKey) return;

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard access is unavailable.");
      }

      await navigator.clipboard.writeText(createdApiKey);
      setCopied(true);
      setCopyError("");
    } catch {
      setCopied(false);
      setCopyError(
        "Automatic copying failed. Select the API key and copy it manually."
      );
    }
  }

  function closeApiKeyDialog() {
    setCreatedApiKey("");
    setCreatedAgentName("");
    setCopied(false);
    setCopyError("");
  }

  // Deactivate an agent without deleting its database record.
  async function handleDeactivateAgent(agent: Agent) {
    if (
      !agent.active ||
      deactivatingId !== null ||
      deletingId !== null
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Deactivate "${agent.name}"? Its API key will no longer authenticate requests.`
    );

    if (!confirmed) return;

    try {
      setDeactivatingId(agent.id);
      setError("");
      setSuccess("");

      await deactivateAgent(agent.id);

      setAgents((current) =>
        current.map((item) =>
          item.id === agent.id ? { ...item, active: false } : item
        )
      );

      setSuccess(`${agent.name} has been deactivated.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to deactivate agent."
      );
    } finally {
      setDeactivatingId(null);
    }
  }

  // Permanently delete an agent.
  async function handleDeleteAgent(agent: Agent) {
    if (
      creating ||
      deactivatingId !== null ||
      deletingId !== null
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Permanently delete "${agent.name}" (Agent ID: ${agent.id})? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(agent.id);
      setError("");
      setSuccess("");

      await deleteAgent(agent.id);

      setAgents((current) =>
        current.filter((item) => item.id !== agent.id)
      );

      setSuccess(`${agent.name} has been permanently deleted.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to permanently delete agent."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const busy =
    creating || deactivatingId !== null || deletingId !== null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agents</h1>
          <p className="mt-2 text-sm text-gray-500">
            Register and manage the AI agents connected to your
            company&apos;s AgeShield security layer.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => void loadAgents(true)}
            disabled={loading || refreshing || busy}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowForm((current) => !current);
              setError("");
              setSuccess("");
            }}
            disabled={busy}
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {showForm ? "Cancel" : "+ Add Agent"}
          </button>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      {/* Registration form */}
      {showForm && (
        <section className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Register an AI Agent
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Create an identity and API key for an external agent, such as
            your Udyamix AI assistant.
          </p>

          <form onSubmit={handleCreateAgent} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="agent-name"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Agent name <span className="text-red-600">*</span>
              </label>

              <input
                id="agent-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Udyamix Business Assistant"
                minLength={1}
                maxLength={200}
                autoComplete="off"
                required
                disabled={creating}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="agent-description"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                Description
              </label>

              <textarea
                id="agent-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What tasks does this agent perform?"
                rows={3}
                maxLength={500}
                disabled={creating}
                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:bg-gray-100"
              />

              <p className="mt-1 text-right text-xs text-gray-400">
                {description.length}/500
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setName("");
                  setDescription("");
                  setError("");
                }}
                disabled={creating}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={busy || !name.trim()}
                className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? "Registering..." : "Register Agent"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Registered agents */}
      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="font-semibold text-gray-900">
              Registered Agents
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {agents.length} {agents.length === 1 ? "agent" : "agents"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading registered agents...
          </div>
        ) : agents.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-lg font-semibold text-gray-600">
              AI
            </div>

            <h3 className="mt-4 font-semibold text-gray-900">
              No agents registered
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
              Register an external AI agent to give it an identity in
              AgeShield. Its requests must use its API key and pass through
              your security policies.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowForm(true);
                setError("");
              }}
              className="mt-5 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Register First Agent
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {agents.map((agent) => (
              <article
                key={agent.id}
                className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="break-words font-semibold text-gray-900">
                      {agent.name}
                    </h3>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        agent.active
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {agent.active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="mt-1 break-words text-sm text-gray-500">
                    {agent.description || "No description provided."}
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    Agent ID: #{agent.id}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-3">
                  {agent.active ? (
                    <button
                      type="button"
                      onClick={() => void handleDeactivateAgent(agent)}
                      disabled={busy}
                      className="rounded-lg border border-amber-200 px-3 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deactivatingId === agent.id
                        ? "Deactivating..."
                        : "Deactivate"}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">
                      API access disabled
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => void handleDeleteAgent(agent)}
                    disabled={busy}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === agent.id ? "Deleting..." : "Delete"}
                  </button>
                  <button
  type="button"
  onClick={() => void handleViewApiKey(agent)}
  disabled={busy}
  className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
>
  View API Key
</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* One-time API key dialog */}
      {createdApiKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="api-key-title"
            className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-xl font-bold text-green-700">
              ✓
            </div>

            <h2
              id="api-key-title"
              className="mt-4 text-xl font-bold text-gray-900"
            >
              Agent Registered Successfully
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              <span className="font-medium">{createdAgentName}</span>{" "}
              has been registered with AgeShield.
            </p>

            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm font-semibold text-amber-900">
                Save this API key now
              </p>
              <p className="mt-1 text-xs leading-5 text-amber-800">
                AgeShield displays this secret only at registration.
                Store it in your agent&apos;s server-side environment
                variables or secret manager. Never expose it in frontend
                code or public repositories.
              </p>
            </div>

            <label
              htmlFor="created-api-key"
              className="mb-2 mt-5 block text-sm font-medium text-gray-700"
            >
              Agent API key
            </label>

            <textarea
              id="created-api-key"
              readOnly
              value={createdApiKey}
              rows={3}
              spellCheck={false}
              autoComplete="off"
              onFocus={(event) => event.currentTarget.select()}
              className="w-full resize-none break-all rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-sm text-gray-800 outline-none focus:border-gray-900"
            />

            {copyError && (
              <p role="alert" className="mt-2 text-sm text-red-600">
                {copyError}
              </p>
            )}

            {copied && (
              <p role="status" className="mt-2 text-sm text-green-700">
                API key copied to clipboard.
              </p>
            )}

            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => void handleCopyApiKey()}
                className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                {copied ? "Copy Again" : "Copy API Key"}
              </button>

              <button
                type="button"
                onClick={closeApiKeyDialog}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                I&apos;ve Saved It — Close
              </button>
            </div>
          </section>
        </div>
      )}
      {viewingAgentId !== null && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-api-key-title"
      className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
    >
      <h2
        id="view-api-key-title"
        className="text-xl font-bold text-gray-900"
      >
        Agent API Key
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        Agent ID: #{viewingAgentId}
      </p>

      {loadingApiKey ? (
        <p className="mt-5 text-sm text-gray-500">
          Retrieving API key...
        </p>
      ) : (
        <>
          <textarea
            readOnly
            value={viewingApiKey}
            rows={3}
            onFocus={(event) => event.currentTarget.select()}
            className="mt-5 w-full resize-none break-all rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-sm"
          />

          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(viewingApiKey);
            }}
            disabled={!viewingApiKey}
            className="mt-4 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            Copy API Key
          </button>
        </>
      )}

      <button
        type="button"
        onClick={closeViewingApiKey}
        className="ml-3 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700"
      >
        Close
      </button>
    </section>
  </div>
)}
    </div>
  );
}
