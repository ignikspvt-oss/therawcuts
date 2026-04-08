"use client";

import { useEffect, useState, useCallback } from "react";
import { getBookings, getBooking, updateBookingStatus } from "@/lib/api";
import { HiXMark, HiChevronDown } from "react-icons/hi2";

interface Booking {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  eventDetails: string;
  referenceUrl: string;
  selectedCollection: string;
  couponCode: string;
  status: string;
  country?: string;
  createdAt: string;
}

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
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

type CountryFilter = "all" | "india" | "canada";

const countryLabel: Record<string, string> = {
  india: "🇮🇳 India",
  canada: "🇨🇦 Canada",
};

function formatAmount(amount: number, currency?: string) {
  if (currency === "CAD") {
    return `CA$${amount.toLocaleString("en-CA", { minimumFractionDigits: 2 })}`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

function statusBadge(status: string, country?: string) {
  // Canada confirmed → display as "Paid"
  if (status === "confirmed" && country === "canada") {
    return { label: "Paid", cls: "bg-green-100 text-green-700" };
  }
  const map: Record<string, { label: string; cls: string }> = {
    pending:   { label: "Pending",   cls: "bg-yellow-100 text-yellow-700" },
    confirmed: { label: "Confirmed", cls: "bg-green-100 text-green-700"  },
    cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-700"       },
  };
  return map[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" };
}

function StatusDropdown({
  booking,
  onUpdated,
}: {
  booking: Booking;
  onUpdated: (updated: Booking) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const options: { value: string; label: string }[] = booking.country === "canada"
    ? [
        { value: "confirmed", label: "Paid"      },
        { value: "cancelled", label: "Cancelled" },
      ]
    : [
        { value: "pending",   label: "Pending"   },
        { value: "confirmed", label: "Confirmed" },
        { value: "cancelled", label: "Cancelled" },
      ];

  const current = statusBadge(booking.status, booking.country);

  const handleSelect = async (value: string) => {
    if (value === booking.status) { setOpen(false); return; }
    setLoading(true);
    setOpen(false);
    try {
      const { data } = await updateBookingStatus(booking._id, value);
      onUpdated(data.booking);
    } catch {
      console.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        disabled={loading}
        className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full capitalize transition-opacity ${current.cls} ${loading ? "opacity-50" : ""}`}
      >
        {current.label}
        <HiChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden min-w-[120px]">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={(e) => { e.stopPropagation(); handleSelect(opt.value); }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${
                  opt.value === booking.status ? "font-semibold text-gray-900" : "text-gray-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [countryFilter, setCountryFilter] = useState<CountryFilter>("all");

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const country = countryFilter === "all" ? undefined : countryFilter;
      const { data } = await getBookings(page, 20, country);
      setBookings(data.bookings);
      setPagination(data.pagination);
    } catch {
      console.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [page, countryFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [countryFilter]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const { data } = await getBooking(id);
      setSelectedBooking(data.booking);
      setSelectedTransaction(data.transaction || null);
    } catch {
      console.error("Failed to load booking detail");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusUpdated = (updated: Booking) => {
    setBookings((prev) =>
      prev.map((b) => (b._id === updated._id ? updated : b))
    );
    if (selectedBooking?._id === updated._id) {
      setSelectedBooking(updated);
    }
  };

  const filterButtons: { value: CountryFilter; label: string }[] = [
    { value: "all",    label: "All"       },
    { value: "india",  label: "🇮🇳 India"  },
    { value: "canada", label: "🇨🇦 Canada" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>

        {/* Country filter */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {filterButtons.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setCountryFilter(value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                countryFilter === value
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Email</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Collection</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Location</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  const badge = statusBadge(booking.status, booking.country);
                  return (
                    <tr
                      key={booking._id}
                      onClick={() => openDetail(booking._id)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5 font-medium text-gray-900">
                        {booking.fullName}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">
                        {booking.email}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 capitalize">
                        {booking.selectedCollection}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 text-xs">
                        {countryLabel[booking.country ?? "india"] ?? "🇮🇳 India"}
                      </td>
                      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <StatusDropdown booking={booking} onUpdated={handleStatusUpdated} />
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString("en-IN", {
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

      {/* Detail Modal */}
      {(selectedBooking || detailLoading) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {detailLoading ? (
              <div className="p-10 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
              </div>
            ) : selectedBooking ? (
              <>
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
                  <button
                    onClick={() => {
                      setSelectedBooking(null);
                      setSelectedTransaction(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <HiXMark className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="text-sm font-medium text-gray-900">{selectedBooking.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">{selectedBooking.email}</p>
                    </div>
                    {selectedBooking.phone && (
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm text-gray-900">{selectedBooking.phone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm font-medium text-gray-900">
                        {countryLabel[selectedBooking.country ?? "india"] ?? "🇮🇳 India"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Collection</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {selectedBooking.selectedCollection}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <StatusDropdown booking={selectedBooking} onUpdated={handleStatusUpdated} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedBooking.createdAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Event Details</p>
                    <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                      {selectedBooking.eventDetails}
                    </p>
                  </div>

                  {selectedBooking.referenceUrl && (
                    <div>
                      <p className="text-xs text-gray-500">Reference URL</p>
                      <a
                        href={selectedBooking.referenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-crimson hover:underline break-all"
                      >
                        {selectedBooking.referenceUrl}
                      </a>
                    </div>
                  )}

                  {selectedBooking.couponCode && (
                    <div>
                      <p className="text-xs text-gray-500">Coupon Code</p>
                      <p className="text-sm font-medium text-crimson">{selectedBooking.couponCode}</p>
                    </div>
                  )}

                  {/* Canada notice when no transaction */}
                  {selectedBooking.country === "canada" && !selectedTransaction && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="rounded-lg px-4 py-3 text-sm bg-blue-50 border border-blue-100 text-blue-700">
                        🇨🇦 Canadian booking — payment arranged manually via email.
                      </div>
                    </div>
                  )}

                  {/* Transaction info (India only) */}
                  {selectedTransaction && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                      <h4 className="font-semibold text-gray-900 text-sm">Payment Details</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Amount Paid</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatAmount(selectedTransaction.amount, selectedTransaction.currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Original Amount</p>
                          <p className="text-sm text-gray-900">
                            {formatAmount(selectedTransaction.originalAmount, selectedTransaction.currency)}
                          </p>
                        </div>
                        {selectedTransaction.discountAmount > 0 && (
                          <div>
                            <p className="text-xs text-gray-500">Discount</p>
                            <p className="text-sm text-green-600">
                              -{formatAmount(selectedTransaction.discountAmount, selectedTransaction.currency)}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-500">Payment Status</p>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                            selectedTransaction.status === "paid"
                              ? "bg-green-100 text-green-700"
                              : selectedTransaction.status === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {selectedTransaction.status}
                          </span>
                        </div>
                      </div>
                      {selectedTransaction.razorpayPaymentId && (
                        <div>
                          <p className="text-xs text-gray-500">Payment ID</p>
                          <p className="text-xs text-gray-600 font-mono">
                            {selectedTransaction.razorpayPaymentId}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
