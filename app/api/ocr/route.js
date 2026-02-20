import { NextResponse } from "next/server";
import { db } from "../../../lib/db-light";
import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  try {
    const { imageData, userId } = await request.json();

    if (!imageData || !userId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Mock OCR processing - in a real implementation, you would use a service like:
    // - Google Vision API
    // - AWS Textract
    // - Azure Computer Vision
    // - Tesseract.js for client-side processing

    const mockOCRResult = {
      id: uuidv4(),
      userId,
      imageData,
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
    };

    // Store OCR result
    db.createOCRResult(mockOCRResult);

    return NextResponse.json({
      success: true,
      ocrResult: mockOCRResult,
    });
  } catch (error) {
    console.error("OCR API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    const ocrResults = db.getOCRResultsByUser(userId);
    return NextResponse.json({ ocrResults });
  } catch (error) {
    console.error("OCR GET API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
