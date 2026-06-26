import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route"; 

// UPDATE a transaction
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    const { amount, description, type } = await req.json();

    const updatedRecord = await prisma.transaction.update({
      where: { id: params.id, userId: user?.id }, // Ensure they only edit their own records
      data: { amount: parseFloat(amount), description, type },
    });

    return NextResponse.json(updatedRecord);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update record" }, { status: 500 });
  }
}

// DELETE a transaction
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    await prisma.transaction.delete({
      where: { id: params.id, userId: user?.id },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 });
  }
}
