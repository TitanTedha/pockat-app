import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { name, icon } = await request.json();
  const newCategory = await prisma.category.create({
    data: { name, icon, userId: user.id },
  });

  return NextResponse.json(newCategory, { status: 201 });
}