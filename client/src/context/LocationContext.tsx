"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Country = "india" | "canada";

export interface PricingConfig {
  "social-cuts": number;
  "signature-cuts": number;
}

interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
}

interface LocationContextType {
  country: Country | null;
  setCountry: (c: Country) => void;
  showModal: boolean;
  openModal: () => void;
  prices: PricingConfig;
  currency: CurrencyConfig;
  formatPrice: (amount: number) => string;
}

export const PRICING: Record<Country, PricingConfig> = {
  india: {
    "social-cuts": 2999,
    "signature-cuts": 4999,
  },
  canada: {
    "social-cuts": 79.99,
    "signature-cuts": 149.99,
  },
};

const CURRENCY: Record<Country, CurrencyConfig> = {
  india: { code: "INR", symbol: "₹", locale: "en-IN" },
  canada: { code: "CAD", symbol: "CA$", locale: "en-CA" },
};

function formatPriceFor(country: Country, amount: number): string {
  if (country === "canada") {
    return `CA$${amount.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

const LocationContext = createContext<LocationContextType | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState<Country | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("trc_country") as Country | null;
    if (saved === "india" || saved === "canada") {
      setCountryState(saved);
    } else {
      // Delay so intro animations can settle first
      const timer = setTimeout(() => setShowModal(true), 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  const setCountry = (c: Country) => {
    setCountryState(c);
    localStorage.setItem("trc_country", c);
    setShowModal(false);
  };

  // Default to india for SSR / before hydration
  const resolved: Country = country ?? "india";

  return (
    <LocationContext.Provider
      value={{
        country,
        setCountry,
        showModal,
        openModal: () => setShowModal(true),
        prices: PRICING[resolved],
        currency: CURRENCY[resolved],
        formatPrice: (amount: number) => formatPriceFor(resolved, amount),
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within LocationProvider");
  return ctx;
}
