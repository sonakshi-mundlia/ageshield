"use client";

import { useEffect, useState } from "react";
import MetricCard from "@/components/dashboard/MetricCard";
import ProtectionStatus from "@/components/dashboard/ProtectionStatus";
import RiskConfiguration from "@/components/dashboard/RiskConfiguration";
import SecurityActivity from "@/components/dashboard/SecurityActivity";
import PendingApprovals from "@/components/dashboard/PendingApprovals";
import ProtectionBanner from "@/components/dashboard/ProtectionBanner";

import {
  getAgents,
  getTools,
  getPolicies,
  getPendingApprovals,
} from "@/lib/api";

export default function DashboardPage() {
  const [activeAgents, setActiveAgents] = useState<number | string>("—");
  const [registeredTools, setRegisteredTools] = useState<number | string>("—");
  const [securityPolicies, setSecurityPolicies] = useState<number | string>("—");
  const [pendingApprovals, setPendingApprovals] = useState<number | string>("—");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMetrics() {
      try {
        const results = await Promise.allSettled([
          getAgents(),
          getTools(),
          getPolicies(),
          getPendingApprovals(),
        ]);

        if (cancelled) return;

        const [agents, tools, policies, approvals] = results;

        if (agents.status === "fulfilled") {
          setActiveAgents(agents.value.filter((agent) => agent.active).length);
        }

        if (tools.status === "fulfilled") {
          setRegisteredTools(tools.value.length);
        }

        if (policies.status === "fulfilled") {
          setSecurityPolicies(policies.value.length);
        }

        if (approvals.status === "fulfilled") {
          setPendingApprovals(
            approvals.value.filter(
              (approval) => approval.status.toLowerCase() === "pending"
            ).length
          );
        }

        const failed = results.some((result) => result.status === "rejected");
        setLoadError(
          failed
            ? "Some metrics could not be loaded. Check your login and backend API."
            : ""
        );
      } catch {
        if (!cancelled) {
          setLoadError("Dashboard metrics could not be loaded.");
        }
      }
    }

    loadMetrics();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
        <p className="mt-2 text-gray-500">
          Monitor the security of your AI agents.
        </p>
      </div>

      <ProtectionBanner />

      {loadError && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {loadError}
        </p>
      )}

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Active Agents" value={String(activeAgents)} />
        <MetricCard title="Registered Tools" value={String(registeredTools)} />
        <MetricCard title="Security Policies" value={String(securityPolicies)} />
        <MetricCard title="Pending Approvals" value={String(pendingApprovals)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ProtectionStatus />
        <RiskConfiguration />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SecurityActivity />
        <PendingApprovals />
      </div>
    </div>
  );
}
