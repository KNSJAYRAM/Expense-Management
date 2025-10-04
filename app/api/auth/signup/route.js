import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db-light";
import { createToken } from "../../../../lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  try {
    const { name, email, password, country } = await request.json();

    // Check if user already exists
    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Simple currency mapping for demo
    const currencyMap = {
      US: "USD",
      IN: "INR",
      GB: "GBP",
      CA: "CAD",
      AU: "AUD",
    };
    const currency = currencyMap[country] || "USD";

    // Create company
    const companyId = uuidv4();
    const company = {
      id: companyId,
      name: `${name}'s Company`,
      currency,
      country,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.createCompany(company);

    // Create admin user
    const userId = uuidv4();
    const user = {
      id: userId,
      email,
      name,
      role: "admin",
      companyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.createUser(user);

    // Create token
    const token = await createToken(user);

    return NextResponse.json({
      user: { ...user, password: undefined },
      company,
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
