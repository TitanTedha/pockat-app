import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; // Adjust this path if your prisma client is elsewhere
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route"; // Adjust this path to match your setup

// UPDATE a transaction
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. Await the params promise before using it (Next.js 15 requirement)
    const resolvedParams = await params;
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    const { amount, description, type } = await req.json();

    const updatedRecord = await prisma.transaction.update({
      where: { 
        id: resolvedParams.id, 
        userId: user?.id 
      }, // Ensures users can only edit their own records
      data: { 
        amount: parseFloat(amount), 
        description, 
        type 
      },
    });

    return NextResponse.json(updatedRecord);
  } catch (error: any) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Failed to update record" }, { status: 500 });
  }
}

// DELETE a transaction
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. Await the params promise before using it
    const resolvedParams = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    await prisma.transaction.delete({
      where: { 
        id: resolvedParams.id, 
        userId: user?.id 
      }, // Ensures users can only delete their own records
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 });
  }
}
