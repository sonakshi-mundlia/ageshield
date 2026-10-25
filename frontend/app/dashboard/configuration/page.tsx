import ConfigurationStatus from "@/components/configuration/ConfigurationStatus";
import ConfigurationSummary from "@/components/configuration/ConfigurationSummary";
import ConfigurationUpload from "@/components/configuration/ConfigurationUpload";

export default function ConfigurationPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Company Configuration</h1>

        <p className="mt-2 text-gray-500">
          Configure how AgeShield protects your company.
        </p>
      </div>

      <div className="space-y-6">
        <ConfigurationStatus />
        <ConfigurationUpload />
        <ConfigurationSummary />
      </div>
    </div>
  );
}