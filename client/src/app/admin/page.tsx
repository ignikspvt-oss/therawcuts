"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/api";
import {
  HiOutlineCalendarDays,
  HiOutlineCurrencyRupee,
  HiOutlineCheckCircle,
  HiOutlineClock,
} from "react-icons/hi2";

interface Stats {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  indiaRevenue: number;
  canadaRevenue: number;
  totalPaidTransactions: number;
}

interface Booking {
  _id: string;
  fullName: string;
  selectedCollection: string;
  status: string;
  country?: string;
  createdAt: string;
}

interface Transaction {
  _id: string;
  amount: number;
  status: string;
  couponCode: string;
  currency?: string;
  createdAt: string;
  bookingId?: { fullName: string; selectedCollection: string; country?: string };
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  paid: "bg-green-100 text-green-700",
  created: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
};

const countryFlag: Record<string, string> = {
  india: "🇮🇳",
  canada: "🇨🇦",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getDashboardStats();
        setStats(data.stats);
        setRecentBookings(data.recentBookings);
        setRecentTransactions(data.recentTransactions);
      } catch {
        console.error("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Bookings",
      value: stats?.totalBookings ?? 0,
      icon: HiOutlineCalendarDays,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "India Revenue",
      value: `₹${(stats?.indiaRevenue ?? 0).toLocaleString("en-IN")}`,
      icon: HiOutlineCurrencyRupee,
      color: "text-green-600 bg-green-50",
      sub: "Paid via Razorpay",
    },
    {
      label: "Canada Revenue",
      value: `CA$${(stats?.canadaRevenue ?? 0).toLocaleString("en-CA", { minimumFractionDigits: 2 })}`,
      icon: HiOutlineCurrencyRupee,
      color: "text-red-600 bg-red-50",
      sub: "Confirmed bookings",
    },
    {
      label: "Confirmed",
      value: stats?.confirmedBookings ?? 0,
      icon: HiOutlineCheckCircle,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Pending",
      value: stats?.pendingBookings ?? 0,
      icon: HiOutlineClock,
      color: "text-yellow-600 bg-yellow-50",
    },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-xl font-bold text-gray-900">{card.value}</p>
                {"sub" in card && card.sub && (
                  <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Recent Bookings</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {recentBookings.length === 0 ? (
              <p className="px-5 py-8 text-center text-gray-400 text-sm">No bookings yet</p>
            ) : (
              recentBookings.map((booking) => (
                <div key={booking._id} className="px-5 py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                      {countryFlag[booking.country ?? "india"]}
                      {booking.fullName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {booking.selectedCollection} &middot;{" "}
                      {new Date(booking.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                      statusColors[booking.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {recentTransactions.length === 0 ? (
              <p className="px-5 py-8 text-center text-gray-400 text-sm">No transactions yet</p>
            ) : (
              recentTransactions.map((tx) => {
                const isCanada = tx.currency === "CAD" || tx.bookingId?.country === "canada";
                const amountDisplay = isCanada
                  ? `CA$${tx.amount.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`
                  : `₹${tx.amount.toLocaleString("en-IN")}`;
                return (
                  <div key={tx._id} className="px-5 py-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {tx.bookingId?.fullName || "—"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {amountDisplay}
                        {tx.couponCode && (
                          <span className="ml-1 text-crimson">({tx.couponCode})</span>
                        )}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                        statusColors[tx.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
