import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  const { email } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return 200 even if user doesn't exist to prevent email enumeration
  if (!user) {
    return NextResponse.json({ message: "If this email exists, a reset link was sent." });
  }

  // Generate a secure random token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 3600000); // Expires in 1 hour

  await prisma.user.update({
    where: { email },
    data: { resetToken, resetTokenExpiry },
  });

  // The link the user will click
  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  console.log("🔒 PASSWORD RESET LINK:", resetUrl);

  return NextResponse.json({ 
    message: "Reset link generated!", 
    resetUrl // We return this to the frontend ONLY for testing without an email server
  });
}
