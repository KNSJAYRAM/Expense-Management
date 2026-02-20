import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db-light";
import { createToken } from "../../../../lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Create demo company if it doesn't exist
    let company = db.getCompany("demo-company-id");
    if (!company) {
      company = {
        id: "demo-company-id",
        name: "Demo Company",
        currency: "USD",
        country: "US",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.createCompany(company);
    }

    // Create demo users if they don't exist
    const demoUsers = [
      {
        id: "admin-user-id",
        email: "admin@company.com",
        name: "Demo Admin",
        role: "admin",
        companyId: "demo-company-id",
      },
      {
        id: "manager-user-id",
        email: "manager@company.com",
        name: "Demo Manager",
        role: "manager",
        companyId: "demo-company-id",
        managerId: "admin-user-id", // Manager reports to admin
      },
      {
        id: "employee-user-id",
        email: "employee@company.com",
        name: "Demo Employee",
        role: "employee",
        companyId: "demo-company-id",
        managerId: "manager-user-id",
      },
    ];

    // Create demo users if they don't exist
    demoUsers.forEach((demoUser) => {
      if (!db.getUser(demoUser.id)) {
        db.createUser({
          ...demoUser,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    });

    // Check if user exists
    let user = db.getUserByEmail(email);

    if (!user) {
      // Create new user with provided email
      const userId = uuidv4();
      user = {
        id: userId,
        email,
        name: email.split("@")[0],
        role: "admin",
        companyId: "demo-company-id",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.createUser(user);
    }

    // Simple password check for demo
    if (password !== "password123") {
      return NextResponse.json(
        { error: "Invalid password. Use: password123" },
        { status: 401 }
      );
    }

    // Create token
    const token = await createToken(user);

    return NextResponse.json({
      user: { ...user, password: undefined },
      company,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
