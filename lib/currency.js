// Currency and country utilities
const CURRENCY_API_BASE = "https://api.exchangerate-api.com/v4/latest";
const COUNTRIES_API =
  "https://restcountries.com/v3.1/all?fields=name,currencies";

// Cache for currency rates and country data
let currencyRatesCache = {};
let countriesCache = null;
let lastCurrencyUpdate = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function getCountries() {
  if (countriesCache) {
    return countriesCache;
  }

  try {
    const response = await fetch(COUNTRIES_API);
    const countries = await response.json();

    countriesCache = countries.map((country) => ({
      name: country.name.common,
      code: country.name.common,
      currency: country.currencies ? Object.keys(country.currencies)[0] : "USD",
      currencyName: country.currencies
        ? Object.values(country.currencies)[0].name
        : "US Dollar",
    }));

    return countriesCache;
  } catch (error) {
    console.error("Error fetching countries:", error);
    return [
      {
        name: "United States",
        code: "US",
        currency: "USD",
        currencyName: "US Dollar",
      },
      {
        name: "India",
        code: "IN",
        currency: "INR",
        currencyName: "Indian Rupee",
      },
      {
        name: "United Kingdom",
        code: "GB",
        currency: "GBP",
        currencyName: "British Pound",
      },
      {
        name: "Canada",
        code: "CA",
        currency: "CAD",
        currencyName: "Canadian Dollar",
      },
      {
        name: "Australia",
        code: "AU",
        currency: "AUD",
        currencyName: "Australian Dollar",
      },
    ];
  }
}

export async function getCurrencyRates(baseCurrency = "USD") {
  const now = Date.now();

  // Check if we have cached rates and they're still valid
  if (
    currencyRatesCache[baseCurrency] &&
    lastCurrencyUpdate &&
    now - lastCurrencyUpdate < CACHE_DURATION
  ) {
    return currencyRatesCache[baseCurrency];
  }

  try {
    const response = await fetch(`${CURRENCY_API_BASE}/${baseCurrency}`);
    const data = await response.json();

    currencyRatesCache[baseCurrency] = data.rates;
    lastCurrencyUpdate = now;

    return data.rates;
  } catch (error) {
    console.error("Error fetching currency rates:", error);
    // Return default rates if API fails
    return {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      INR: 83.0,
      CAD: 1.25,
      AUD: 1.35,
    };
  }
}

export async function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  try {
    const rates = await getCurrencyRates(fromCurrency);
    const rate = rates[toCurrency];

    if (!rate) {
      throw new Error(`Currency rate not found for ${toCurrency}`);
    }

    return amount * rate;
  } catch (error) {
    console.error("Currency conversion error:", error);
    return amount; // Return original amount if conversion fails
  }
}

export function formatCurrency(amount, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
}
