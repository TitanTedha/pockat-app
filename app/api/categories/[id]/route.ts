import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; // Adjust path if needed
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route"; // Adjust path if needed

// UPDATE a category
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. Await the params promise before using it
    const resolvedParams = await params;
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    const { name, icon } = await req.json();

    const updatedCategory = await prisma.category.update({
      where: { id: resolvedParams.id, userId: user?.id }, // 2. Use resolvedParams.id
      data: { name, icon },
    });

    return NextResponse.json(updatedCategory);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// DELETE a category
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. Await the params promise before using it
    const resolvedParams = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    await prisma.category.delete({
      where: { id: resolvedParams.id, userId: user?.id }, // 2. Use resolvedParams.id
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
