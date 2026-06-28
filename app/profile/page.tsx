import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "../lib/prisma";
import EditProfileModal from "../../components/EditProfileModal";
import Link from "next/link"; // Required for the toggle switch

export const dynamic = "force-dynamic"; // Ensures the profile & rank are always real-time

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/signin");

  // 1. Resolve URL search parameters to determine view mode
  const resolvedParams = await searchParams;
  const viewMode = resolvedParams.view === "all" ? "all" : "month";

  // 2. Get current Jakarta Time (UTC+7)
  const getJakartaTime = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utc + 3600000 * 7);
  };
  const jakartaNow = getJakartaTime();
  const currentMonth = jakartaNow.getMonth() + 1; // 1-12
  const currentYear = jakartaNow.getFullYear();

  // 3. Fetch ALL users for leaderboard, plus the active user's stats
  const allUsers = await prisma.user.findMany({
    include: { transactions: true },
  });

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { 
      achievements: true, 
      monthlyStats: {
        where: { month: currentMonth, year: currentYear }
      }
    }
  });

  // 4. Calculate stats for the leaderboard (All-Time AND Current Month)
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
      currentMonthSaved,
      currentMonthSavingsRate,
      txCount: u.transactions.length,
      categoriesUsed,
    };
  });

  // 5. Dynamic Sorting! Sort Leaderboard based on the selected viewMode
  rankedUsers.sort((a, b) => {
    if (viewMode === "month") {
      return b.currentMonthSavingsRate - a.currentMonthSavingsRate || b.currentMonthSaved - a.currentMonthSaved;
    } else {
      return b.savingsRate - a.savingsRate || b.saved - a.saved;
    }
  });

  // 6. Find current user context and rank
  const currentUserIndex = rankedUsers.findIndex((u) => u.email === session.user?.email);
  const userStats = rankedUsers[currentUserIndex];
  if (!userStats) redirect("/signin");
  
  const rank = currentUserIndex + 1;

  // 7. Dynamic Border Logic (Based on Consecutive Months)
  const consecutiveMonths = currentUser?.monthlyStats?.[0]?.consecutive || 0; 
  
  let avatarBorder = "border-4 border-white"; 
  if (consecutiveMonths >= 6) {
    avatarBorder = "border-4 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.7)]"; 
  } else if (consecutiveMonths >= 3) {
    avatarBorder = "border-4 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.7)]"; 
  } else if (consecutiveMonths >= 2) {
    avatarBorder = "border-4 border-gray-400 shadow-[0_0_15px_rgba(156,163,175,0.6)]"; 
  } else if (consecutiveMonths >= 1) {
    avatarBorder = "border-4 border-amber-600 shadow-[0_0_15px_rgba(217,119,6,0.6)]"; 
  }

  const goldenCatBadgeId = `GOLDEN_CAT_${currentMonth}_${currentYear}`;
  const hasGoldenCat = currentUser?.achievements?.some((a) => a.badgeId === goldenCatBadgeId);

  // Badges calculate based on their strict rules regardless of the view toggle
  const badges = [
    { id: 1, name: "First Steps", icon: "🐾", description: "Logged your first transaction", unlocked: userStats.txCount > 0 },
    { id: 2, name: "Neat Freak", icon: "🏷️", description: "Used 3+ custom tags", unlocked: userStats.categoriesUsed >= 3 },
    { id: 3, name: "Novice Hoarder", icon: "🥉", description: "Saved 10% this month", unlocked: userStats.currentMonthSavingsRate >= 10 },
    { id: 4, name: "Pro Saver", icon: "🥈", description: "Saved 25% this month", unlocked: userStats.currentMonthSavingsRate >= 25 },
    { id: 5, name: "Golden Cat", icon: "👑", description: "Claimed on the 1st of the month", unlocked: !!hasGoldenCat },
    { id: 6, name: "Perfect Month", icon: "💎", description: "50%+ savings rate all-time", unlocked: userStats.savingsRate >= 50 }
  ];

  // Determine what numbers to show in the UI based on the toggle
  const displaySavingsRate = viewMode === "month" ? userStats.currentMonthSavingsRate : userStats.savingsRate;
  const displayLabel = viewMode === "month" ? "THIS MONTH" : "ALL-TIME";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 mt-6 md:mt-10 mb-24 space-y-6 md:space-y-8">
      
      {/* The Toggle Switch */}
      <div className="flex justify-center mb-6 animate-fadeIn">
        <div className="bg-amber-100/50 p-1 rounded-full inline-flex border border-amber-200">
          <Link 
            href="/profile?view=month" 
            className={`px-6 py-2 rounded-full text-sm font-extrabold transition-all duration-300 ${
              viewMode === 'month' ? 'bg-white text-amber-950 shadow-sm' : 'text-amber-800/50 hover:text-amber-900'
            }`}
          >
            This Month
          </Link>
          <Link 
            href="/profile?view=all" 
            className={`px-6 py-2 rounded-full text-sm font-extrabold transition-all duration-300 ${
              viewMode === 'all' ? 'bg-white text-amber-950 shadow-sm' : 'text-amber-800/50 hover:text-amber-900'
            }`}
          >
            All Time
          </Link>
        </div>
      </div>

      <div className="bg-[#FFFDF7] border-2 border-amber-100 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm mb-8 relative overflow-hidden">
        
        {/* Avatar with Dynamic Consecutive Border */}
        <div className={`w-24 h-24 bg-amber-200 rounded-full flex items-center justify-center text-4xl shadow-inner transition-all duration-500 z-10 overflow-hidden shrink-0 ${avatarBorder}`}>
          {userStats.image ? (
            <img 
              src={userStats.image} 
              alt={`${userStats.name}'s avatar`} 
              className="w-full h-full object-cover"
            />
          ) : (
            "🐱"
          )}
        </div>
        
        <div className="text-center md:text-left flex-1 z-10">
          <h1 className="text-3xl font-extrabold text-amber-950">{userStats.name}</h1>
          <p className="text-amber-800/60 font-bold">{userStats.email}</p>
          <p className="text-sm text-amber-800/80 mt-2 italic">"{userStats.bio || "No bio yet..."}"</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
            <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-black transition-all">
              RANK #{rank} {displayLabel}
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-black transition-all">
              {displaySavingsRate}% SAVED
            </span>
            
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-black">
              {consecutiveMonths} MO. STREAK 🔥
            </span>
          </div>
        </div>
        
        <div className="z-10">
          <EditProfileModal user={userStats} />
        </div>
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
