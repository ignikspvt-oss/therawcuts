"use client";

import { useEffect, useState, useCallback } from "react";
import { getTransactions } from "@/lib/api";

type CountryFilter = "all" | "india" | "canada";

interface Transaction {
  _id: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  originalAmount: number;
  discountAmount: number;
  couponCode: string;
  status: string;
  currency?: string;
  country?: string;
  createdAt: string;
  bookingId?: {
    fullName: string;
    selectedCollection: string;
    status: string;
    country?: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const statusColors: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  created: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
};

function formatAmount(amount: number, currency?: string, country?: string) {
  const isCanada = currency === "CAD" || country === "canada";
  if (isCanada) {
    return `CA$${amount.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [countryFilter, setCountryFilter] = useState<CountryFilter>("all");

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const country = countryFilter === "all" ? undefined : countryFilter;
      const { data } = await getTransactions(page, 20, country);
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch {
      console.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [page, countryFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    setPage(1);
  }, [countryFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>

        {/* Country filter */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {(["all", "india", "canada"] as CountryFilter[]).map((v) => (
            <button
              key={v}
              onClick={() => setCountryFilter(v)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                countryFilter === v
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {v === "all" ? "All" : v === "india" ? "🇮🇳 India" : "🇨🇦 Canada"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 font-medium text-gray-500">Customer</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Collection</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Location</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Amount</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Discount</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Coupon</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400">Loading...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400">No transactions found</td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const txCountry = tx.country || tx.bookingId?.country || "india";
                  const txCurrency = tx.currency;
                  return (
                    <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900">
                        {tx.bookingId?.fullName || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 capitalize">
                        {tx.bookingId?.selectedCollection || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">
                        {txCountry === "canada" ? "🇨🇦 Canada" : "🇮🇳 India"}
                      </td>
                      <td className="px-5 py-3.5 text-gray-900 text-right font-medium">
                        {formatAmount(tx.amount, txCurrency, txCountry)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {tx.discountAmount > 0 ? (
                          <span className="text-green-600">
                            -{formatAmount(tx.discountAmount, txCurrency, txCountry)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">{tx.couponCode || "—"}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                            statusColors[tx.status] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.pages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
