import { NextResponse } from "next/server";
import {
  getCountries,
  getCurrencyRates,
  convertCurrency,
} from "../../../lib/currency";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "countries":
        const countries = await getCountries();
        return NextResponse.json({ countries });

      case "rates":
        const baseCurrency = searchParams.get("base") || "USD";
        const rates = await getCurrencyRates(baseCurrency);
        return NextResponse.json({ rates });

      case "convert":
        const amount = parseFloat(searchParams.get("amount"));
        const fromCurrency = searchParams.get("from");
        const toCurrency = searchParams.get("to");

        if (!amount || !fromCurrency || !toCurrency) {
          return NextResponse.json(
            { error: "Missing required parameters" },
            { status: 400 }
          );
        }

        const convertedAmount = await convertCurrency(
          amount,
          fromCurrency,
          toCurrency
        );
        return NextResponse.json({
          originalAmount: amount,
          convertedAmount,
          fromCurrency,
          toCurrency,
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Currency API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
