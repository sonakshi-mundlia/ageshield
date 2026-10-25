"use client";

import { Agent } from "@/lib/api";

interface AgentDetailsProps {
  agent: Agent;
}

export default function AgentDetails({
  agent,
}: AgentDetailsProps) {
  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            AI Agent
          </p>

          <h2 className="mt-1 text-xl font-bold text-gray-900">
            {agent.name}
          </h2>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            agent.active
              ? "bg-green-50 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {agent.active ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Description */}
      <div className="mt-6">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          Description
        </p>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          {agent.description || "No description available."}
        </p>
      </div>

      {/* Agent information */}
      <div className="mt-6 grid gap-5 border-t border-gray-100 pt-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-gray-400">
            Agent ID
          </p>

          <p className="mt-1 text-sm font-medium text-gray-900">
            #{agent.id}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-400">
            Status
          </p>

          <p className="mt-1 text-sm font-medium text-gray-900">
            {agent.active ? "Currently active" : "Currently inactive"}
          </p>
        </div>
      </div>
    </div>
  );
}