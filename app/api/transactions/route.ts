// app/api/transactions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    // 1. Enforce Authentication: Only logged-in users can post
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Find the actual logged-in user in the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User account not found" }, { status: 404 });
    }

    // 3. Process the transaction request
    const body = await request.json();
    const { type, amount, date, description, categoryId } = body;

    if (!type || !amount || !date) {
      return NextResponse.json(
        { error: "Type, amount, and date are required" },
        { status: 400 }
      );
    }

    // 4. Save the transaction tied to the authenticated user's ID
    const newTransaction = await prisma.transaction.create({
      data: {
        userId: user.id, // Use the real ID from the database
        type: type,
        amount: parseFloat(amount),
        date: new Date(date),
        description: description || null,
        categoryId: categoryId || null,
      },
    });

    return NextResponse.json({ success: true, transaction: newTransaction }, { status: 201 });

  } catch (error: any) {
    console.error("Failed to save transaction:", error);
    return NextResponse.json(
      { error: `Database Error: ${error.message}` },
      { status: 500 }
    );
  }
}