"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { register } from "@/lib/api";

export default function Register() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await register(
        companyName,
        name,
        email,
        password
      );

      await refreshUser();

      router.replace("/dashboard");

      router.refresh();

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Signup failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <Link href="/" className="text-2xl font-bold">
          <span className="text-red-500">Age</span>Shield
        </Link>

        <h1 className="mt-8 text-3xl font-bold">
          Create your company
        </h1>

        <p className="mt-2 text-gray-500">
          Start protecting your AI agents with AgeShield.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />

          <input
            placeholder="Company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            autoComplete="organization"
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />

          <input
            type="email"
            placeholder="Work email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 px-4 py-3"
          />

          {error && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-red-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}


// DELETE FROM users
// WHERE email = 'mohini@gmail.com';


// psql -U myadmin -d ageshield

