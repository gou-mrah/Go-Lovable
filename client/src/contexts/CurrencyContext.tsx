import React, { createContext, useContext, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";

export type Currency = "SAR" | "USD" | "EUR" | "GBP" | "PKR" | "INR" | "EGP";

export interface CurrencyConfig {
  code: Currency;
  name: string;
  nameAr: string;
  symbol: string;
  flag: string;
  locale: string;
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: "SAR", name: "Saudi Riyal",      nameAr: "ريال سعودي",    symbol: "﷼",   flag: "🇸🇦", locale: "ar-SA" },
  { code: "USD", name: "US Dollar",        nameAr: "دولار أمريكي",  symbol: "$",   flag: "🇺🇸", locale: "en-US" },
  { code: "EUR", name: "Euro",             nameAr: "يورو",           symbol: "€",   flag: "🇪🇺", locale: "de-DE" },
  { code: "GBP", name: "British Pound",    nameAr: "جنيه إسترليني", symbol: "£",   flag: "🇬🇧", locale: "en-GB" },
  { code: "PKR", name: "Pakistani Rupee",  nameAr: "روبية باكستانية",symbol: "₨",  flag: "🇵🇰", locale: "ur-PK" },
  { code: "INR", name: "Indian Rupee",     nameAr: "روبية هندية",   symbol: "₹",   flag: "🇮🇳", locale: "hi-IN" },
  { code: "EGP", name: "Egyptian Pound",   nameAr: "جنيه مصري",     symbol: "ج.م", flag: "🇪🇬", locale: "ar-EG" },
];

/**
 * Fallback exchange rates relative to SAR (1 SAR = X foreign currency)
 * SAR is the base currency — all prices in the DB are stored in SAR.
 */
const FALLBACK_RATES_FROM_SAR: Record<Currency, number> = {
  SAR: 1.0,
  USD: 0.2667,   // 1 SAR ≈ 0.2667 USD
  EUR: 0.2453,   // 1 SAR ≈ 0.2453 EUR
  GBP: 0.2107,   // 1 SAR ≈ 0.2107 GBP
  PKR: 74.27,    // 1 SAR ≈ 74.27 PKR
  INR: 22.19,    // 1 SAR ≈ 22.19 INR
  EGP: 12.93,    // 1 SAR ≈ 12.93 EGP
};

interface CurrencyContextValue {
  currency: Currency;
  currencyConfig: CurrencyConfig;
  setCurrency: (c: Currency) => void;
  rates: Record<Currency, number>;
  /** Convert a SAR price to the selected currency */
  convert: (sarPrice: number | string) => number;
  /** Format a SAR price as a localized string in the selected currency */
  format: (sarPrice: number | string) => string;
  /** Get just the symbol for the selected currency */
  symbol: string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const stored = localStorage.getItem("go-umrah-currency");
    return (stored as Currency) || "SAR";
  });

  const { data: ratesData, isLoading } = trpc.localization.getExchangeRates.useQuery(undefined, {
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  // ratesData from API is relative to SAR (same as FALLBACK_RATES_FROM_SAR)
  const rates: Record<Currency, number> = ratesData
    ? { ...FALLBACK_RATES_FROM_SAR, ...ratesData }
    : FALLBACK_RATES_FROM_SAR;

  const currencyConfig = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("go-umrah-currency", c);
  }, []);

  /**
   * Convert a SAR price to the currently selected currency.
   * All prices in the DB are stored in SAR.
   */
  const convert = useCallback((sarPrice: number | string): number => {
    const sar = typeof sarPrice === "string" ? parseFloat(sarPrice) : sarPrice;
    if (isNaN(sar)) return 0;
    if (currency === "SAR") return Math.round(sar * 100) / 100;
    const rate = rates[currency] || FALLBACK_RATES_FROM_SAR[currency] || 1;
    return Math.round(sar * rate * 100) / 100;
  }, [currency, rates]);

  const format = useCallback((sarPrice: number | string): string => {
    const converted = convert(sarPrice);
    const config = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
    try {
      return new Intl.NumberFormat(config.locale, {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(converted);
    } catch {
      return `${config.symbol}${converted.toLocaleString("ar-SA")}`;
    }
  }, [currency, convert]);

  return (
    <CurrencyContext.Provider value={{
      currency,
      currencyConfig,
      setCurrency,
      rates,
      convert,
      format,
      symbol: currencyConfig.symbol,
      isLoading,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
