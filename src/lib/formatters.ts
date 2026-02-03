const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  CAD: "C$",
  AUD: "A$",
  SGD: "S$",
  AED: "د.إ",
};

export const getCurrencySymbol = (currency?: string | null) => {
  if (!currency) return "$";
  return currencySymbols[currency] ?? currency;
};

export const formatSalaryRange = (
  min: number | null,
  max: number | null,
  currency?: string | null
) => {
  if (!min && !max) return "Competitive";
  const symbol = getCurrencySymbol(currency);
  if (min && max) return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`;
  if (min) return `${symbol}${min.toLocaleString()}+`;
  return `Up to ${symbol}${max!.toLocaleString()}`;
};
