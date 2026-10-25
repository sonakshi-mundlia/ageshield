"use client";

import { ChangeEvent, useState } from "react";
import {
  uploadConfiguration,
  ConfigurationResponse,
} from "@/lib/api";

export default function ConfigurationUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] =
    useState<ConfigurationResponse | null>(null);

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    setMessage("");
    setError("");
    setResult(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (
      !selectedFile.name.toLowerCase().endsWith(".json")
    ) {
      setFile(null);
      setError("Please select a JSON configuration file.");
      return;
    }

    setFile(selectedFile);
    setMessage(`${selectedFile.name} selected.`);
  }

  async function handleUpload() {
    if (!file) {
      setError("Please select a JSON configuration file first.");
      return;
    }

    try {
      setUploading(true);
      setMessage("");
      setError("");
      setResult(null);

      const data = await uploadConfiguration(file);

      setResult(data);
      setMessage(data.message || "Configuration uploaded successfully.");
      setFile(null);

      // Reset file input
      const input = document.getElementById(
        "configuration-file"
      ) as HTMLInputElement | null;

      if (input) {
        input.value = "";
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload configuration."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="card p-6">
      {/* Header */}
      <h2 className="text-lg font-bold text-gray-900">
        Upload Configuration
      </h2>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        Upload your company-specific security configuration.
        AgeShield will validate and apply it to your company
        protection settings.
      </p>

      {/* File input */}
      <input
        id="configuration-file"
        type="file"
        accept=".json,application/json"
        onChange={handleFile}
        disabled={uploading}
        className="mt-6 block w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
      />

      {/* Selected file */}
      {file && !error && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Selected File
          </p>

          <p className="mt-1 text-sm font-medium text-gray-900">
            {file.name}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
      )}

      {/* Upload button */}
      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || uploading}
        className="mt-5 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {uploading ? "Uploading..." : "Upload Configuration"}
      </button>

      {/* Success message */}
      {message && !error && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm font-medium text-green-700">
            {message}
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* Upload result */}
      {result && (
        <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Configuration Applied
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-400">
                Configuration ID
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                #{result.configuration_id}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Version
              </p>

              <p className="mt-1 text-sm font-medium text-gray-900">
                {result.version}
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-400">
              Configuration Summary
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <SummaryBadge
                label="Policies"
                value={result.summary.policies}
              />

              <SummaryBadge
                label="Approval Rules"
                value={result.summary.approval_rules}
              />

              <SummaryBadge
                label="Data Patterns"
                value={result.summary.data_patterns}
              />

              <SummaryBadge
                label="Guidelines"
                value={result.summary.guidelines}
              />

              <SummaryBadge
                label="Agents"
                value={result.summary.agents}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryBadge({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200">
      {label}: {value}
    </span>
  );
}