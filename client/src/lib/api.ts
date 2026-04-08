import axios, { AxiosError, AxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
  withCredentials: true, // required for CSRF cookie
});

// ——— CSRF token management ———
let csrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;

const fetchCsrfToken = async (): Promise<string> => {
  if (csrfPromise) return csrfPromise;
  csrfPromise = axios
    .get(`${BASE_URL}/csrf-token`, { withCredentials: true })
    .then((res) => {
      csrfToken = res.data.csrfToken;
      csrfPromise = null;
      return csrfToken as string;
    })
    .catch((err) => {
      csrfPromise = null;
      throw err;
    });
  return csrfPromise;
};

// ——— Token refresh state ———
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;
  const refreshToken =
    typeof window !== "undefined" ? localStorage.getItem("admin_refresh_token") : null;
  if (!refreshToken) return null;

  isRefreshing = true;
  refreshPromise = axios
    .post(`${BASE_URL}/auth/refresh`, { refreshToken }, { withCredentials: true })
    .then((res) => {
      const { token, refreshToken: newRefresh } = res.data;
      if (typeof window !== "undefined") {
        localStorage.setItem("admin_token", token);
        if (newRefresh) localStorage.setItem("admin_refresh_token", newRefresh);
      }
      return token as string;
    })
    .catch(() => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_refresh_token");
      }
      return null;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });
  return refreshPromise;
};

// ——— Request interceptor ———
api.interceptors.request.use(async (config) => {
  // Attach JWT for admin requests
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // Attach CSRF token for mutating public requests
  const method = (config.method || "get").toLowerCase();
  const mutating = ["post", "put", "patch", "delete"].includes(method);
  const isAuthRoute = config.url?.includes("/auth/");
  if (mutating && !isAuthRoute) {
    if (!csrfToken) {
      try {
        await fetchCsrfToken();
      } catch {
        // proceed; server will 403 and we'll retry below
      }
    }
    if (csrfToken) {
      config.headers["x-csrf-token"] = csrfToken;
    }
  }

  return config;
});

// ——— Response interceptor ———
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const data = error.response?.data as { error?: string } | undefined;

    // CSRF token invalid/missing — refresh and retry once
    if (
      status === 403 &&
      data?.error?.toLowerCase().includes("csrf") &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      csrfToken = null;
      try {
        const newToken = await fetchCsrfToken();
        if (originalRequest.headers) {
          originalRequest.headers["x-csrf-token"] = newToken;
        }
        return api(originalRequest);
      } catch {
        // fall through
      }
    }

    // 401 on admin route — attempt refresh token flow
    if (
      status === 401 &&
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/admin") &&
      !window.location.pathname.includes("/login") &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest);
      }
      // refresh failed — redirect to login
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_refresh_token");
      window.location.href = "/admin/login";
    }

    return Promise.reject(error);
  }
);

// ——— Public APIs ———

export const createBooking = (data: {
  fullName: string;
  email: string;
  phone?: string;
  eventDetails: string;
  referenceUrl?: string;
  selectedCollection: string;
  quantity?: number;
  couponCode?: string;
  country?: "india" | "canada";
}) => api.post("/bookings", data);

export const validateCoupon = (
  code: string,
  collection: string,
  quantity: number,
  country: string = "india"
) => api.post("/coupons/validate", { code, collection, quantity, country });

export const createPaymentOrder = (bookingId: string) =>
  api.post("/payments/create-order", { bookingId });

export const verifyPayment = (data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  bookingId: string;
}) => api.post("/payments/verify", data);

// ——— Admin APIs ———

export const adminLogin = (email: string, password: string) =>
  api.post("/auth/login", { email, password });

export const verifyToken = () => api.get("/auth/verify");

export const getDashboardStats = () => api.get("/dashboard/stats");

export const getBookings = (page = 1, limit = 20, country?: string) =>
  api.get(`/bookings?page=${page}&limit=${limit}${country ? `&country=${country}` : ""}`);

export const getBooking = (id: string) => api.get(`/bookings/${id}`);

export const updateBookingStatus = (id: string, status: string) =>
  api.patch(`/bookings/${id}/status`, { status });

export const getTransactions = (page = 1, limit = 20, country?: string) =>
  api.get(`/transactions?page=${page}&limit=${limit}${country ? `&country=${country}` : ""}`);

export const getCoupons = () => api.get("/coupons");

export const createCoupon = (data: {
  name: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  expiresAt: string;
  maxUses?: number;
  country?: "india" | "canada" | "both";
}) => api.post("/coupons", data);

export const deleteCoupon = (id: string) => api.delete(`/coupons/${id}`);

export default api;
