"use client";

import { useEffect, useState } from "react";
import {
  getEffectiveConfiguration,
  EffectiveConfigurationResponse,
} from "@/lib/api";

export default function ConfigurationStatus() {
  const [configuration, setConfiguration] =
    useState<EffectiveConfigurationResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadConfiguration() {
    try {
      setLoading(true);
      setError("");

      const data = await getEffectiveConfiguration();
      setConfiguration(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load configuration."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConfiguration();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <h2 className="font-bold text-gray-900">
          Protection configuration
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Loading your effective security configuration...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-bold text-red-800">
          Configuration unavailable
        </h2>

        <p className="mt-2 text-sm text-red-700">
          {error}
        </p>
      </div>
    );
  }

  if (!configuration) {
    return null;
  }

  const configurationKeys = Object.keys(
    configuration.configuration || {}
  );

  return (
    <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

            <h2 className="font-bold text-green-800">
              Protection configuration active
            </h2>
          </div>

          <p className="mt-2 text-sm leading-6 text-green-700">
            Your company configuration is combined with AgeShield
            global security defaults to create the effective
            protection configuration.
          </p>
        </div>

        <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          Active
        </span>
      </div>

      <div className="mt-5 grid gap-4 border-t border-green-200 pt-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-green-600">
            Company
          </p>

          <p className="mt-1 text-sm font-semibold text-green-900">
            Company #{configuration.company_id}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-green-600">
            Configuration Sections
          </p>

          <p className="mt-1 text-sm font-semibold text-green-900">
            {configurationKeys.length}
          </p>
        </div>
      </div>

      {configurationKeys.length > 0 && (
        <div className="mt-5 border-t border-green-200 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
            Active Configuration
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {configurationKeys.map((key) => (
              <span
                key={key}
                className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-green-700 ring-1 ring-green-200"
              >
                {formatKey(key)}
              </span>
            ))}
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
