// app/api/records/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust this path to match your exact prisma client import

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { merchant, amount, date } = body;

    // 1. Basic validation
    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }

    // 2. Insert into the database using Prisma
    // Replace 'record' with the exact model name from your prisma.schema (e.g., transaction, expense, recording)
    const newRecord = await prisma.record.create({
      data: {
        description: merchant || "Unknown Merchant",
        amount: parseFloat(amount), 
        date: date ? new Date(date) : new Date(),
        // If you use NextAuth, you would map the userId here:
        // userId: session.user.id 
      },
    });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error: any) {
    console.error("Database Save Error:", error.message);
    return NextResponse.json({ error: "Failed to save record to database" }, { status: 500 });
  }
}
