"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

export default function HomeNavbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold">
          <span className="text-red-500">Age</span>
          <span className="text-gray-900">Shield</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#what" className="text-sm text-gray-600 hover:text-red-500">
            What is AgeShield?
          </a>

          <a href="#how" className="text-sm text-gray-600 hover:text-red-500">
            How it works
          </a>

          <a
            href="#features"
            className="text-sm text-gray-600 hover:text-red-500"
          >
            Features
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="btn-primary">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-secondary">
                Login
              </Link>

              <Link href="/signup" className="btn-primary">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}