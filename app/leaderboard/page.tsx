// app/leaderboard/page.tsx
import Link from "next/link";
import { prisma } from "../lib/prisma";
import { formatCurrency } from "../lib/utils"; // 1. Import your formatter

export default async function LeaderboardPage() {
  const users = await prisma.user.findMany({
    include: { transactions: true },
  });

  const rankedUsers = users.map(user => {
    let income = 0;
    let spent = 0;

    user.transactions.forEach(tx => {
      if (tx.type === "INCOME") income += tx.amount;
      if (tx.type === "SPENDING") spent += tx.amount;
    });

    const saved = income - spent;
    const savingsRate = income > 0 ? (saved / income) * 100 : 0; 

    return {
      id: user.id,
      name: user.name,
      savingsRate: parseFloat(savingsRate.toFixed(1)),
      hoarded: saved
    };
  });

  rankedUsers.sort((a, b) => {
    if (b.savingsRate === a.savingsRate) {
      return b.hoarded - a.hoarded;
    }
    return b.savingsRate - a.savingsRate;
  });

  return (
    <div className="max-w-3xl mx-auto px-6 mt-10">
      <div className="text-center mb-8">
        <div className="text-4xl mb-2">🏰</div>
        <h1 className="text-2xl font-extrabold text-amber-900">Cat Tower Rankings</h1>
        <p className="text-amber-800/60 font-medium text-sm mt-1">Top kitty savers ranked by income saved! 🐾</p>
      </div>

      {rankedUsers.length === 0 ? (
        <div className="bg-[#FFFDF7] border-2 border-amber-200 rounded-3xl p-8 text-center shadow-sm mb-6">
          <div className="text-4xl mb-4">😿</div>
          <p className="font-bold text-amber-900 mb-4">The tower is empty! Log income in Recording and start saving treats.</p>
          <Link href="/recording" className="inline-block bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold py-2 px-6 rounded-full shadow-sm transition-colors text-sm">
            Join the Quest! 🎮
          </Link>
        </div>
      ) : (
        <div className="bg-[#FFFDF7] border-2 border-amber-100 rounded-3xl p-4 shadow-sm mb-6 space-y-3">
          {rankedUsers.map((user, index) => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-white border border-amber-100 rounded-2xl shadow-sm">
              <div className="flex items-center gap-4">
                <span className={`text-2xl font-black ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-700' : 'text-amber-900/30'}`}>
                  #{index + 1}
                </span>
                <div>
                  <h3 className="font-bold text-amber-950">{user.name}</h3>
                  {/* 2. Use formatCurrency here */}
                  <p className="text-xs font-bold text-amber-800/50">Saved {formatCurrency(user.hoarded)}</p>
                </div>
              </div>
              <div className="bg-amber-100 px-4 py-2 rounded-xl flex flex-col items-center">
                <span className="text-[10px] font-bold text-amber-800/60 uppercase tracking-wide leading-none mb-1">Power</span>
                <span className="font-black text-amber-900 leading-none">{user.savingsRate}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-[#FFFDF7] border-2 border-amber-100 rounded-3xl p-6 shadow-sm">
        <h3 className="font-extrabold text-amber-900 mb-4 text-sm">How to climb 🏰</h3>
        <ul className="text-sm font-medium text-amber-800/70 space-y-2">
          <li>🥇 Rankings are based on the **percentage** of your income saved!</li>
          <li>💰 Log income in the Recording menu</li>
          <li>💸 Track spending throughout the month</li>
          <li>⚖️ Even if you earn less, you can still reach #1 by saving smarter!</li>
        </ul>
      </div>
    </div>
  );
}