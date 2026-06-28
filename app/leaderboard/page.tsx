import Link from "next/link";
import { prisma } from "../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { formatCurrency } from "../lib/utils";

export const dynamic = "force-dynamic"; 

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const currentUserEmail = session?.user?.email;

  // 1. Resolve URL search parameters
  const resolvedParams = await searchParams;
  const viewMode = resolvedParams.view === "all" ? "all" : "month";

  // 2. Get current Jakarta Time (UTC+7)
  const getJakartaTime = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utc + 3600000 * 7);
  };
  const jakartaNow = getJakartaTime();
  const currentMonth = jakartaNow.getMonth() + 1; 
  const currentYear = jakartaNow.getFullYear();

  // 3. Fetch all users
  const allUsers = await prisma.user.findMany({
    include: { transactions: true },
  });

  // 4. Calculate stats for everyone
  const rankedUsers = allUsers.map((u) => {
    let allTimeIncome = 0;
    let allTimeSpent = 0;
    let currentMonthIncome = 0;
    let currentMonthSpent = 0;

    u.transactions.forEach((tx) => {
      // All-Time
      if (tx.type === "INCOME") allTimeIncome += tx.amount;
      if (tx.type === "SPENDING") allTimeSpent += tx.amount;

      // Current Jakarta Month
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
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image, // Passed from the database
      savedAll: allTimeSaved,
      savingsRateAll: allTimeSavingsRate,
      savedMonth: currentMonthSaved,
      savingsRateMonth: currentMonthSavingsRate,
    };
  });

  // 5. Sort dynamically based on the viewMode
  rankedUsers.sort((a, b) => {
    if (viewMode === "month") {
      return b.savingsRateMonth - a.savingsRateMonth || b.savedMonth - a.savedMonth;
    } else {
      return b.savingsRateAll - a.savingsRateAll || b.savedAll - a.savedAll;
    }
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 mt-6 md:mt-10 mb-24 space-y-6 md:space-y-8">
      
      {/* Header & Toggle */}
      <div className="flex flex-col items-center mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-amber-950 mb-2">Hall of Savers 🏆</h1>
        <p className="text-amber-800/60 font-medium text-sm mb-6">
          {viewMode === "month" 
            ? `Top savers for ${jakartaNow.toLocaleString('default', { month: 'long' })} ${currentYear}` 
            : "The greatest savers of all time"}
        </p>

        <div className="bg-amber-100/50 p-1 rounded-full inline-flex border border-amber-200">
          <Link 
            href="/leaderboard?view=month" 
            className={`px-6 py-2 rounded-full text-sm font-extrabold transition-all duration-300 ${
              viewMode === 'month' ? 'bg-white text-amber-950 shadow-sm' : 'text-amber-800/50 hover:text-amber-900'
            }`}
          >
            This Month
          </Link>
          <Link 
            href="/leaderboard?view=all" 
            className={`px-6 py-2 rounded-full text-sm font-extrabold transition-all duration-300 ${
              viewMode === 'all' ? 'bg-white text-amber-950 shadow-sm' : 'text-amber-800/50 hover:text-amber-900'
            }`}
          >
            All Time
          </Link>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-4">
        {rankedUsers.map((user, index) => {
          const rank = index + 1;
          const isCurrentUser = user.email === currentUserEmail;
          
          // Pull the correct stats based on toggle
          const displayRate = viewMode === "month" ? user.savingsRateMonth : user.savingsRateAll;
          const displaySaved = viewMode === "month" ? user.savedMonth : user.savedAll;

          // Styling for Top 3
          let rankMedal = <span className="font-black text-amber-900/40 text-lg">#{rank}</span>;
          let cardStyle = "bg-[#FFFDF7] border-amber-100 hover:border-amber-300";
          
          if (rank === 1) {
            rankMedal = <span className="text-3xl">👑</span>;
            cardStyle = "bg-gradient-to-r from-yellow-50 to-amber-100 border-yellow-300 shadow-md transform scale-[1.02]";
          } else if (rank === 2) {
            rankMedal = <span className="text-3xl">🥈</span>;
            cardStyle = "bg-gray-50 border-gray-300 shadow-sm";
          } else if (rank === 3) {
            rankMedal = <span className="text-3xl">🥉</span>;
            cardStyle = "bg-orange-50 border-orange-300 shadow-sm";
          }

          if (isCurrentUser) {
            cardStyle += " ring-2 ring-amber-500 ring-offset-2"; // Highlight logged-in user
          }

          return (
            <div key={user.id} className={`flex items-center justify-between p-4 md:p-6 rounded-3xl border-2 transition-all ${cardStyle}`}>
              
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-10 h-10 flex items-center justify-center">
                  {rankMedal}
                </div>
                
                {/* PROFILE PICTURE UI INSTALLED HERE */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-amber-100 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                  {user.image ? (
                    <img src={user.image} alt={`${user.name}'s avatar`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">🐱</span>
                  )}
                </div>
                
                <div>
                  <h3 className="font-extrabold text-amber-950 text-lg flex items-center gap-2">
                    {user.name} 
                    {isCurrentUser && <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>}
                  </h3>
                  <p className="text-xs font-bold text-amber-800/50 mt-0.5">
                    Saved {formatCurrency(displaySaved)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="bg-white border border-amber-200 px-4 py-2 rounded-2xl shadow-inner inline-block">
                  <span className="text-xl font-black text-green-600">{displayRate}%</span>
                  <span className="text-[10px] font-bold text-amber-800/40 block -mt-1 uppercase tracking-wide">Rate</span>
                </div>
              </div>

            </div>
          );
        })}

        {rankedUsers.length === 0 && (
          <div className="text-center p-10 bg-amber-50 border-2 border-dashed border-amber-200 rounded-3xl">
            <p className="text-amber-800/60 font-bold">No savers found. Be the first to start tracking!</p>
          </div>
        )}
      </div>

    </div>
  );
}
