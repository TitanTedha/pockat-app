import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { isFirstDayOfMonth, getCurrentMonthAndYear } from "../../../../lib/timeUtils";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 1. Verify it is actually the 1st day of the month in Jakarta
  if (!isFirstDayOfMonth()) {
    return NextResponse.json({ error: "The Golden Cat is sleeping. Come back on the 1st!" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { month, year } = getCurrentMonthAndYear();
  const badgeId = `GOLDEN_CAT_${month}_${year}`;

  // 2. Check if they already claimed it today
  const existingBadge = await prisma.achievement.findFirst({
    where: { userId: user.id, badgeId: badgeId }
  });

  if (existingBadge) {
    return NextResponse.json({ error: "Already claimed this month!" }, { status: 400 });
  }

  // 3. Award the badge
  const newBadge = await prisma.achievement.create({
    data: {
      userId: user.id,
      badgeId: badgeId,
    }
  });

  return NextResponse.json({ message: "Golden Cat Unlocked!", badge: newBadge });
}
