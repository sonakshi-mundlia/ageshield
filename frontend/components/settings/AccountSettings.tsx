"use client";

import { useAuth } from "@/components/auth/AuthProvider";

export default function AccountSettings() {
const { user } = useAuth();

if (!user) {
return ( <section className="card p-6"> <div className="border-b border-gray-200 pb-5"> <h2 className="text-lg font-bold text-gray-900">
Account Settings </h2>
      <p className="mt-1 text-sm text-gray-500">
        Information about your AgeShield account.
      </p>
    </div>

    <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm text-gray-500">
        Account information is not available.
      </p>
    </div>
  </section>
);

}

return ( <section className="card p-6"> <div className="border-b border-gray-200 pb-5"> <h2 className="text-lg font-bold text-gray-900">
Account Settings </h2>

    <p className="mt-1 text-sm text-gray-500">
      Information about your AgeShield account.
    </p>
  </div>

  <div className="mt-6 grid gap-5 md:grid-cols-2">
    <SettingField
      label="Name"
      value={user.name || "Not available"}
    />

    <SettingField
      label="Email"
      value={user.email || "Not available"}
    />

  </div>
</section>

);
}

function SettingField({
label,
value,
}: {
label: string;
value: string;
}) {
return ( <div> <label className="mb-2 block text-sm font-semibold text-gray-700">
{label} </label>

  <input
    type="text"
    value={value}
    readOnly
    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600 outline-none"
  />
</div>

);
}
