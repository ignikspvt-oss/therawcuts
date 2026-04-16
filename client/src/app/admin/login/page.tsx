"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { adminLogin } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit: NonNullable<React.ComponentProps<"form">["onSubmit"]> = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await adminLogin(email, password);
      localStorage.setItem("admin_token", data.token);
      if (data.refreshToken) {
        localStorage.setItem("admin_refresh_token", data.refreshToken);
      }
      router.replace("/admin");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image
            src="/images/logo.jpeg"
            alt="The Raw Cuts"
            width={48}
            height={48}
            style={{ height: "auto" }}
            className="rounded mx-auto"
          />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="mt-1 text-gray-500 text-sm">The Raw Cuts Dashboard</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@therawcuts.com"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-crimson text-white py-2.5 rounded-lg font-medium hover:bg-crimson-dark transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
