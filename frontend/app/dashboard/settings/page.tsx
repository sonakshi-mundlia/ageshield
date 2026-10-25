import CompanySettings from "@/components/settings/CompanySettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import AccountSettings from "@/components/settings/AccountSettings";

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Settings
        </h1>

        <p className="mt-2 text-gray-500">
          Manage your company, security and account settings.
        </p>
      </div>

      <div className="space-y-6">
        <CompanySettings />
        <SecuritySettings />
        <AccountSettings />
      </div>
    </div>
  );
}