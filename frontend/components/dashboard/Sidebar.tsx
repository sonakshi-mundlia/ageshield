"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "Overview", path: "/dashboard" },
  { name: "Agents", path: "/dashboard/agents" },
  { name: "Tools", path: "/dashboard/tools" },
  { name: "Policies", path: "/dashboard/policies" },
  { name: "Approvals", path: "/dashboard/approvals" },
  { name: "Incidents", path: "/dashboard/incidents" },
  { name: "Audit", path: "/dashboard/audit" },
  { name: "Configuration", path: "/dashboard/configuration" },
  { name: "Settings", path: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Link href="/" className="text-2xl font-bold">
          <span className="text-red-500">Age</span>Shield
        </Link>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => {
          const active =
            pathname === link.path ||
            (link.path !== "/dashboard" &&
              pathname.startsWith(link.path));

          return (
            <Link
              key={link.path}
              href={link.path}
              className={`sidebar-link ${
                active ? "sidebar-link-active" : ""
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}