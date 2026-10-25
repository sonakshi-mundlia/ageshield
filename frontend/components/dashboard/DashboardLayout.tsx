"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="dashboard-shell">
        <Sidebar />

        <div className="dashboard-content">
          <Topbar />

          <main className="dashboard-main">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}