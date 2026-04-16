"use client";

import { useEffect, useState, useCallback } from "react";
import { getCoupons, createCoupon, deleteCoupon } from "@/lib/api";
import { HiOutlineTrash, HiPlus } from "react-icons/hi2";

interface Coupon {
  _id: string;
  name: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  expiresAt: string;
  isActive: boolean;
  usageCount: number;
  maxUses: number;
  country: "india" | "canada" | "both";
  createdAt: string;
}

const countryLabel: Record<string, string> = {
  india: "🇮🇳 India",
  canada: "🇨🇦 Canada",
  both: "🌐 Both",
};

function formatDiscount(coupon: Coupon): string {
  if (coupon.type === "percentage") return `${coupon.value}%`;
  if (coupon.country === "canada") {
    return `CA$${coupon.value.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`;
  }
  if (coupon.country === "both") {
    return `${coupon.value} (per currency)`;
  }
  return `₹${coupon.value.toLocaleString("en-IN")}`;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    expiresAt: "",
    maxUses: "100",
    country: "both" as "india" | "canada" | "both",
  });

  const fetchCoupons = useCallback(async () => {
    try {
      const { data } = await getCoupons();
      setCoupons(data.coupons);
    } catch {
      console.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleCreate: NonNullable<React.ComponentProps<"form">["onSubmit"]> = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      await createCoupon({
        name: form.name,
        code: form.code,
        type: form.type,
        value: parseFloat(form.value),
        expiresAt: form.expiresAt,
        maxUses: parseInt(form.maxUses) || 100,
        country: form.country,
      });

      setForm({ name: "", code: "", type: "percentage", value: "", expiresAt: "", maxUses: "100", country: "both" });
      setShowForm(false);
      fetchCoupons();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setFormError(error.response?.data?.error || "Failed to create coupon");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      setDeleteConfirm(null);
    } catch {
      console.error("Failed to delete coupon");
    }
  };

  const fixedValueLabel = () => {
    if (form.type !== "fixed") return "(%)";
    if (form.country === "canada") return "(CA$)";
    if (form.country === "both") return "(per currency)";
    return "(₹)";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Coupons</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 bg-crimson text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-crimson-dark transition-colors"
        >
          <HiPlus className="w-4 h-4" />
          Create Coupon
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">New Coupon</h3>

          {formError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. First-time Discount"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="e.g. FIRST10"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <select
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value as "india" | "canada" | "both" })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
              >
                <option value="both">🌐 Both Countries</option>
                <option value="india">🇮🇳 India only</option>
                <option value="canada">🇨🇦 Canada only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "percentage" | "fixed" })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value {fixedValueLabel()}
              </label>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder={form.type === "percentage" ? "10" : form.country === "canada" ? "20" : "500"}
                required
                min="0"
                step={form.type === "fixed" && form.country === "canada" ? "0.01" : "1"}
                max={form.type === "percentage" ? "100" : undefined}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
              />
              {form.type === "fixed" && form.country === "both" && (
                <p className="text-xs text-gray-400 mt-1">Applied in each country's currency (₹ for India, CA$ for Canada)</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                min="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson"
              />
            </div>

            <div className="sm:col-span-2 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-4 py-2 bg-crimson text-white rounded-lg text-sm font-medium hover:bg-crimson-dark disabled:opacity-50"
              >
                {formLoading ? "Creating..." : "Create Coupon"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Code</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Region</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Discount</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Usage</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Expires</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400">Loading...</td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400">No coupons created yet</td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const isExpired = new Date(coupon.expiresAt) <= new Date();
                  const isMaxed = coupon.usageCount >= coupon.maxUses;

                  return (
                    <tr key={coupon._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900">{coupon.name}</td>
                      <td className="px-5 py-3.5">
                        <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">
                          {coupon.code}
                        </code>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 text-xs">
                        {countryLabel[coupon.country] ?? "🌐 Both"}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{formatDiscount(coupon)}</td>
                      <td className="px-5 py-3.5 text-gray-500">{coupon.usageCount} / {coupon.maxUses}</td>
                      <td className="px-5 py-3.5 text-gray-500">
                        {new Date(coupon.expiresAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        {isExpired ? (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-700">Expired</span>
                        ) : isMaxed ? (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">Maxed Out</span>
                        ) : coupon.isActive ? (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">Active</span>
                        ) : (
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">Inactive</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {deleteConfirm === coupon._id ? (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleDelete(coupon._id)} className="text-xs text-red-600 font-medium hover:underline">
                              Confirm
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="text-xs text-gray-500 hover:underline">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(coupon._id)} className="text-gray-400 hover:text-red-600 transition-colors">
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
