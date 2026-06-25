// app/dashboard/page.tsx
import Link from "next/link";
import { prisma } from "../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { formatCurrency } from "../lib/utils"; // 1. Import utility

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });
  
  const transactions = await prisma.transaction.findMany({
    where: { userId: user?.id },
  });

  let totalIncome = 0;
  let totalSpent = 0;

  transactions.forEach((tx) => {
    if (tx.type === "INCOME") totalIncome += tx.amount;
    if (tx.type === "SPENDING") totalSpent += tx.amount;
  });

  const totalSaved = totalIncome - totalSpent;
  const savingsRate = totalIncome > 0 ? ((totalSaved / totalIncome) * 100).toFixed(1) : "0.0";

  return (
    <div className="max-w-5xl mx-auto px-6 mt-10">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-amber-900 flex items-center gap-2">
            Hey, {user?.name || "Kitty Saver"}! 🐱✨
          </h1>
          <p className="text-amber-800/60 font-medium text-sm mt-1">Your quest stats this month</p>
        </div>
        
        <Link href="/api/auth/signout" className="bg-red-100 hover:bg-red-200 text-red-800 font-bold py-2 px-6 rounded-full shadow-sm transition-colors text-sm">
          Log Out
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 grid grid-cols-2 gap-4">
          {/* 2. Use formatCurrency here */}
          <StatCard title="Monthly Income" value={formatCurrency(totalIncome)} icon="💰" />
          <StatCard title="Treats Spent" value={formatCurrency(totalSpent)} icon="🍪" />
          <StatCard title="Treats Saved" value={formatCurrency(totalSaved)} icon="🐷" subtext={`${savingsRate}% of income`} />
          <StatCard title="Paw Badges" value="🏅" icon="🏅" subtext="View in Profile" />
        </div>

        <div className="bg-[#FFFDF7] border-2 border-amber-100 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <h3 className="text-amber-800/80 font-bold text-sm mb-4">Savings Power ⚡</h3>
          <div className="w-24 h-24 rounded-full border-4 border-amber-200 flex items-center justify-center mb-4">
            <span className="text-2xl font-black text-amber-900">{savingsRate}%</span>
          </div>
          <Link href="/recording" className="text-sm font-bold text-amber-600 underline decoration-2 underline-offset-4 hover:text-amber-800">
            Log income in Recording →
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, subtext }: { title: string, value: string, icon: string, subtext?: string }) {
  return (
    <div className="bg-[#FFFDF7] border-2 border-amber-100 p-5 rounded-3xl shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xs font-extrabold text-amber-800/60 uppercase tracking-wider">{title}</h3>
        <span className="text-xl">{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-black text-amber-950">{value}</p>
        {subtext && <p className="text-xs font-bold text-amber-800/40 mt-1">{subtext}</p>}
      </div>
    </div>
  );
}