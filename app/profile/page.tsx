import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "../lib/prisma";
import EditProfileModal from "../../components/EditProfileModal";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/signin");

  // 1. Get current Jakarta Time (UTC+7)
  const getJakartaTime = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utc + 3600000 * 7);
  };
  const jakartaNow = getJakartaTime();
  const currentMonth = jakartaNow.getMonth() + 1; // 1-12
  const currentYear = jakartaNow.getFullYear();

  // 2. Fetch ALL users for leaderboard, plus the active user's stats and achievements
  const allUsers = await prisma.user.findMany({
    include: { transactions: true },
  });

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { 
      // Assuming you added these in your schema from the previous step
      // If Prisma throws an error here, make sure you ran `npx prisma db push`!
      achievements: true, 
      monthlyStats: {
        where: { month: currentMonth, year: currentYear }
      }
    }
  });

  // 3. Calculate stats for the leaderboard (All-Time) and Badges (Current Month)
  const rankedUsers = allUsers.map((u) => {
    let allTimeIncome = 0;
    let allTimeSpent = 0;
    let currentMonthIncome = 0;
    let currentMonthSpent = 0;

    const categoriesUsed = new Set(u.transactions.filter((t) => t.categoryId).map((t) => t.categoryId)).size;

    u.transactions.forEach((tx) => {
      // All-Time
      if (tx.type === "INCOME") allTimeIncome += tx.amount;
      if (tx.type === "SPENDING") allTimeSpent += tx.amount;

      // Current Jakarta Month specific
      const txDate = new Date(tx.date);
      const txUtc = txDate.getTime() + txDate.getTimezoneOffset() * 60000;
      const txJakarta = new Date(txUtc + 3600000 * 7);

      if (txJakarta.getMonth() + 1 === currentMonth && txJakarta.getFullYear() === currentYear) {
        if (tx.type === "INCOME") currentMonthIncome += tx.amount;
        if (tx.type === "SPENDING") currentMonthSpent += tx.amount;
      }
    });

    const allTimeSaved = allTimeIncome - allTimeSpent;
    const allTimeSavingsRate = allTimeIncome > 0 ? parseFloat(((allTimeSaved) / allTimeIncome * 100).toFixed(1)) : 0;
    
    const currentMonthSaved = currentMonthIncome - currentMonthSpent;
    const currentMonthSavingsRate = currentMonthIncome > 0 ? parseFloat(((currentMonthSaved) / currentMonthIncome * 100).toFixed(1)) : 0;

    return {
      ...u,
      saved: allTimeSaved,
      savingsRate: allTimeSavingsRate,
      currentMonthSavingsRate,
      txCount: u.transactions.length,
      categoriesUsed,
    };
  });

  // Sort by All-Time savings rate, then total saved
  rankedUsers.sort((a, b) => b.savingsRate - a.savingsRate || b.saved - a.saved);

  // 4. Find current user context
  const currentUserIndex = rankedUsers.findIndex((u) => u.email === session.user?.email);
  const userStats = rankedUsers[currentUserIndex];
  if (!userStats) redirect("/signin");
  
  const rank = currentUserIndex + 1;

  // 5. Dynamic Border Logic (Based on Consecutive Months)
  // Defaults to 0 if the stat hasn't been generated yet
  const consecutiveMonths = currentUser?.monthlyStats?.[0]?.consecutive || 0; 
  
  let avatarBorder = "border-4 border-white"; // Base style
  if (consecutiveMonths >= 6) {
    avatarBorder = "border-4 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.7)]"; // Diamond
  } else if (consecutiveMonths >= 3) {
    avatarBorder = "border-4 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.7)]"; // Gold
  } else if (consecutiveMonths >= 2) {
    avatarBorder = "border-4 border-gray-400 shadow-[0_0_15px_rgba(156,163,175,0.6)]"; // Silver
  } else if (consecutiveMonths >= 1) {
    avatarBorder = "border-4 border-amber-600 shadow-[0_0_15px_rgba(217,119,6,0.6)]"; // Bronze
  }

  // Check if they claimed the Golden Cat this specific month
  const goldenCatBadgeId = `GOLDEN_CAT_${currentMonth}_${currentYear}`;
  const hasGoldenCat = currentUser?.achievements?.some((a) => a.badgeId === goldenCatBadgeId);

  // 6. Updated Badge Prerequisites
  const badges = [
    { id: 1, name: "First Steps", icon: "🐾", description: "Logged your first transaction", unlocked: userStats.txCount > 0 },
    { id: 2, name: "Neat Freak", icon: "🏷️", description: "Used 3+ custom tags", unlocked: userStats.categoriesUsed >= 3 },
    { id: 3, name: "Novice Hoarder", icon: "🥉", description: "Saved 10% this month", unlocked: userStats.currentMonthSavingsRate >= 10 },
    { id: 4, name: "Pro Saver", icon: "🥈", description: "Saved 25% this month", unlocked: userStats.currentMonthSavingsRate >= 25 },
    { id: 5, name: "Golden Cat", icon: "👑", description: "Claimed on the 1st of the month", unlocked: !!hasGoldenCat },
    { id: 6, name: "Perfect Month", icon: "💎", description: "50%+ savings rate all-time", unlocked: userStats.savingsRate >= 50 }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 mt-10">
      <div className="bg-[#FFFDF7] border-2 border-amber-100 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm mb-8">
        
        {/* Avatar with Dynamic Consecutive Border */}
        <div className={`w-24 h-24 bg-amber-200 rounded-full flex items-center justify-center text-4xl shadow-inner transition-all duration-500 ${avatarBorder}`}>
          🐱
        </div>
        
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl font-extrabold text-amber-950">{userStats.name}</h1>
          <p className="text-amber-800/60 font-bold">{userStats.email}</p>
          <p className="text-sm text-amber-800/80 mt-2 italic">"{userStats.bio || "No bio yet..."}"</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
            <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-black">RANK #{rank}</span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-black">{userStats.savingsRate}% ALL-TIME SAVED</span>
            
            {/* Show current month tracking so they know how close they are to the next border! */}
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-black">
              {consecutiveMonths} MO. STREAK 🔥
            </span>
          </div>
        </div>
        
        <EditProfileModal user={userStats} />
      </div>

      <h2 className="text-xl font-extrabold text-amber-900 mb-6">Paw Badges 🏅</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {badges.map((badge) => (
          <div key={badge.id} className={`relative p-5 rounded-3xl border-2 flex flex-col items-center text-center transition-all ${badge.unlocked ? "bg-white border-amber-300 shadow-md transform hover:-translate-y-1" : "bg-gray-50 border-gray-100 opacity-60 grayscale"}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 ${badge.unlocked ? "bg-amber-100 shadow-inner" : "bg-gray-200"}`}>
              {badge.icon}
            </div>
            <h3 className={`font-bold mb-1 ${badge.unlocked ? "text-amber-950" : "text-gray-500"}`}>{badge.name}</h3>
            <p className="text-[10px] font-bold text-amber-800/50 leading-tight">{badge.description}</p>
            {!badge.unlocked && <div className="absolute top-3 right-3 text-xs">🔒</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
