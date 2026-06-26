// app/api/record/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"; // Adjust this path if your authOptions is located elsewhere

export async function POST(req: Request) {
  try {
    // 1. Authenticate the request
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get the specific user ID from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { merchant, amount, date } = body;

    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }

    // 3. Insert using the correct Prisma model: 'transaction'
    const newTransaction = await prisma.transaction.create({
      data: {
        description: merchant || "Unknown Merchant",
        amount: parseFloat(amount), 
        date: date ? new Date(date) : new Date(),
        type: "SPENDING", // Hardcoded as spending since it's from a receipt
        userId: user.id,  // Securely attaching the transaction to the logged-in user
      },
    });

    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error: any) {
    console.error("Database Save Error:", error.message);
    return NextResponse.json({ error: "Failed to save to database" }, { status: 500 });
  }
}
