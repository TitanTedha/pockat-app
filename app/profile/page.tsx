// app/profile/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "../lib/prisma";
import EditProfileModal from "../../components/EditProfileModal"; // Ensure this is imported

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/signin");

  // 1. Fetch ALL users for leaderboard
  const allUsers = await prisma.user.findMany({
    include: { transactions: true },
  });

  // 2. Calculate stats
  const rankedUsers = allUsers.map((u) => {
    let income = 0;
    let spent = 0;
    const categoriesUsed = new Set(u.transactions.filter(t => t.categoryId).map(t => t.categoryId)).size;

    u.transactions.forEach((tx) => {
      if (tx.type === "INCOME") income += tx.amount;
      if (tx.type === "SPENDING") spent += tx.amount;
    });

    return {
      ...u, // Include all user fields (name, bio, email)
      saved: income - spent,
      savingsRate: income > 0 ? parseFloat(((income - spent) / income * 100).toFixed(1)) : 0,
      txCount: u.transactions.length,
      categoriesUsed
    };
  });

  rankedUsers.sort((a, b) => b.savingsRate - a.savingsRate || b.saved - a.saved);

  // 3. Find current user
  const currentUserIndex = rankedUsers.findIndex(u => u.email === session.user?.email);
  const userStats = rankedUsers[currentUserIndex];
  
  if (!userStats) redirect("/signin");
  
  const rank = currentUserIndex + 1;

  const badges = [
    { id: 1, name: "First Steps", icon: "🐾", description: "Logged your first transaction", unlocked: userStats.txCount > 0 },
    { id: 2, name: "Neat Freak", icon: "🏷️", description: "Used 3+ custom tags", unlocked: userStats.categoriesUsed >= 3 },
    { id: 3, name: "Novice Hoarder", icon: "🥉", description: "Saved over $100", unlocked: userStats.saved >= 100 },
    { id: 4, name: "Pro Saver", icon: "🥈", description: "Saved over $500", unlocked: userStats.saved >= 500 },
    { id: 5, name: "Golden Cat", icon: "👑", description: "Reached #1 on the leaderboard", unlocked: rank === 1 && userStats.txCount > 0 },
    { id: 6, name: "Perfect Month", icon: "💎", description: "50%+ savings rate", unlocked: userStats.savingsRate >= 50 }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 mt-10">
      <div className="bg-[#FFFDF7] border-2 border-amber-100 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm mb-8">
        <div className="w-24 h-24 bg-amber-200 rounded-full flex items-center justify-center text-4xl shadow-inner border-4 border-white">
          🐱
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-3xl font-extrabold text-amber-950">{userStats.name}</h1>
          <p className="text-amber-800/60 font-bold">{userStats.email}</p>
          <p className="text-sm text-amber-800/80 mt-2 italic">"{userStats.bio || "No bio yet..."}"</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
            <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-black">RANK #{rank}</span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-black">{userStats.savingsRate}% SAVED</span>
          </div>
        </div>
        
        {/* Pass the full user object to the modal */}
        <EditProfileModal user={userStats} />
      </div>

      <h2 className="text-xl font-extrabold text-amber-900 mb-6">Paw Badges 🏅</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {badges.map((badge) => (
          <div key={badge.id} className={`relative p-5 rounded-3xl border-2 flex flex-col items-center text-center ${badge.unlocked ? "bg-white border-amber-300 shadow-md" : "bg-gray-50 border-gray-100 opacity-60 grayscale"}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 ${badge.unlocked ? "bg-amber-100" : "bg-gray-200"}`}>
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