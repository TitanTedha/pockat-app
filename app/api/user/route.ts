// app/api/user/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, email, password, bio } = await request.json();

  const data: any = { name, bio };
  if (email) data.email = email;
  if (password) data.password = await bcrypt.hash(password, 10);

  const updatedUser = await prisma.user.update({
    where: { email: session.user.email },
    data,
  });

  return NextResponse.json(updatedUser);
}