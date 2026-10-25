"use client";

import { useEffect, useState } from "react";
import {
  getTools,
  createTool,
  Tool,
  RiskLevel,
} from "@/lib/api";

export default function ToolList() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [riskLevel, setRiskLevel] =
    useState<RiskLevel>("low");
  const [creating, setCreating] = useState(false);

  // ----------------------------------------------------------
  // LOAD TOOLS
  // ----------------------------------------------------------

  async function loadTools() {
    try {
      setLoading(true);
      setError("");

      const data = await getTools();
      setTools(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load tools."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTools();
  }, []);

  // ----------------------------------------------------------
  // CREATE TOOL
  // ----------------------------------------------------------

  async function handleCreateTool(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    try {
      setCreating(true);
      setError("");

      const newTool = await createTool(
        name.trim(),
        description.trim(),
        riskLevel
      );

      setTools((current) => [
        ...current,
        newTool,
      ]);

      setName("");
      setDescription("");
      setRiskLevel("low");
      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create tool."
      );
    } finally {
      setCreating(false);
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
            Tools
          </h1>

          <p className="mt-2 text-gray-500">
            Manage tools available to your AI agents.
          </p>
        </div>

        <button
          onClick={() => setShowForm((value) => !value)}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          {showForm ? "Cancel" : "Add Tool"}
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
            Register Tool
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Add a tool that your AI agents can use.
          </p>

          <form
            onSubmit={handleCreateTool}
            className="mt-5 space-y-4"
          >
            {/* TOOL NAME */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Tool Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="e.g. Send Email"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                required
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe what this tool allows an AI agent to do..."
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>

            {/* RISK LEVEL */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Risk Level
              </label>

              <select
                value={riskLevel}
                onChange={(event) =>
                  setRiskLevel(
                    event.target.value as RiskLevel
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">
                  Critical
                </option>
              </select>
            </div>

            {/* SUBMIT */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating
                  ? "Registering..."
                  : "Register Tool"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TOOLS */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Loading tools...
          </div>
        ) : tools.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <span className="text-lg text-gray-500">
                T
              </span>
            </div>

            <h2 className="mt-4 font-semibold text-gray-900">
              No tools registered
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Register a tool to make it available to your
              AI agents.
            </p>

            <button
              onClick={() => setShowForm(true)}
              className="mt-5 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Add Tool
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center justify-between p-6"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <h2 className="font-semibold text-gray-900">
                      {tool.name}
                    </h2>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        tool.risk_level === "low"
                          ? "bg-green-50 text-green-700"
                          : tool.risk_level === "medium"
                          ? "bg-yellow-50 text-yellow-700"
                          : tool.risk_level === "high"
                          ? "bg-orange-50 text-orange-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {tool.risk_level}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-gray-500">
                    {tool.description ||
                      "No description provided."}
                  </p>
                </div>

                <div className="ml-6 text-right">
                  <p className="text-xs text-gray-400">
                    Tool ID
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-700">
                    #{tool.id}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
