import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import crypto from "crypto";
import { Resend } from "resend";

// Initialize Resend with your environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });

  // Security: Always return 200 so hackers can't guess valid emails
  if (!user) {
    return NextResponse.json({ message: "If this email exists, a reset link was sent." });
  }

  // Generate token and expiry
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

  await prisma.user.update({
    where: { email },
    data: { resetToken, resetTokenExpiry },
  });

  // Build the live URL
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

  // Fire off the email!
  try {
    await resend.emails.send({
      from: 'Pockat App <onboarding@resend.dev>',
      to: email,
      subject: 'Reset your Pockat Password 🐱',
      html: `
        <div style="font-family: sans-serif; text-align: center; padding: 20px;">
          <h2>Oh no! You forgot your password? 😿</h2>
          <p>Don't worry, it happens to the best of us.</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #fbbf24; color: #451a03; text-decoration: none; border-radius: 99px; font-weight: bold; margin-top: 20px;">
            Reset My Password
          </a>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">This link expires in 1 hour.</p>
        </div>
      `
    });
  } catch (error) {
    console.error("Email failed to send:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ message: "Reset link sent!" });
}
