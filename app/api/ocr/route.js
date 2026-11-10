import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// Mock OCR - replace with Google Vision, AWS Textract, Azure Computer Vision, etc.
export async function POST(request) {
  try {
    const { imageData, userId } = await request.json();

    if (!imageData || !userId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      ocrResult: {
        id: uuidv4(),
        userId,
        extractedData: {
          amount: 45.5,
          date: new Date().toISOString().split("T")[0],
          merchant: "Starbucks Coffee",
          description: "Coffee and pastry",
          category: "Meals & Entertainment",
          currency: "USD",
          confidence: 0.95,
        },
        processedAt: new Date(),
        status: "completed",
      },
    });
  } catch (error) {
    console.error("OCR API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
