"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="topbar">
      <div>
        <h1 className="font-semibold text-gray-900">
          Security Dashboard
        </h1>

        <p className="text-xs text-gray-500">
          {user?.company_name || "Your company"}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>

        <button onClick={handleLogout} className="btn-secondary">
          Logout
        </button>
      </div>
    </header>
  );
}