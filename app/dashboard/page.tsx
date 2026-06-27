// app/dashboard/page.tsx
import Link from "next/link";
import { prisma } from "../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { formatCurrency } from "../lib/utils";
import ExpenseChart from "../../components/ExpenseChart";

export const dynamic = "force-dynamic"; 

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });
  if (!user) redirect("/api/auth/signin");

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
  const currentMonth = jakartaNow.getMonth() + 1; 
  const currentYear = jakartaNow.getFullYear();

  // 3. Fetch Categories and ALL transactions
  const categories = await prisma.category.findMany({ 
    where: { userId: user.id } 
  });

  const allTransactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: { category: true }
  });

  // 4. Apply filter based on the toggle (Month vs All-Time)
  const displayedTransactions = viewMode === "all" 
    ? allTransactions 
    : allTransactions.filter(tx => {
        const txDate = new Date(tx.date);
        const txUtc = txDate.getTime() + txDate.getTimezoneOffset() * 60000;
        const txJakarta = new Date(txUtc + 3600000 * 7);
        return txJakarta.getMonth() + 1 === currentMonth && txJakarta.getFullYear() === currentYear;
      });

  // 5. Calculate StatCard Totals based on filtered data
  let totalIncome = 0;
  let totalSpent = 0;

  displayedTransactions.forEach((tx) => {
    if (tx.type === "INCOME") totalIncome += tx.amount;
    if (tx.type === "SPENDING") totalSpent += tx.amount;
  });

  const totalSaved = totalIncome - totalSpent;
  const savingsRate = totalIncome > 0 ? ((totalSaved / totalIncome) * 100).toFixed(1) : "0.0";

  // 6. Calculate data specifically for the Chart (Spending only)
  let othersTotal = 0;
  const categoryTotals: Record<string, number> = {};

  displayedTransactions.forEach(tx => {
    if (tx.type === "SPENDING") {
      if (tx.categoryId && tx.category) {
        categoryTotals[tx.category.name] = (categoryTotals[tx.category.name] || 0) + tx.amount;
      } else {
        othersTotal += tx.amount; // Untagged records
      }
    }
  });

  const chartData = categories
    .map(cat => ({
      name: `${cat.icon || ""} ${cat.name}`.trim(),
      total: categoryTotals[cat.name] || 0,
      icon: cat.icon
    }))
    .filter(d => d.total > 0); 

  if (othersTotal > 0) {
    chartData.push({ name: "📦 Others", total: othersTotal, icon: "📦" });
  }

  return (
    <div className="max-w-5xl mx-auto px-6 mt-10 space-y-6 mb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-extrabold text-amber-900 flex items-center gap-2">
            Hey, {user.name || "Kitty Saver"}! 🐱✨
          </h1>
          <p className="text-amber-800/60 font-medium text-sm mt-1">
            {viewMode === "month" 
              ? `Your quest stats for ${jakartaNow.toLocaleString('default', { month: 'long' })} ${currentYear}`
              : "Your all-time quest stats"}
          </p>
        </div>
        
        <Link href="/api/auth/signout" className="bg-red-100 hover:bg-red-200 text-red-800 font-bold py-2 px-6 rounded-full shadow-sm transition-colors text-sm text-center">
          Log Out
        </Link>
      </div>

      {/* The Toggle Switch */}
      <div className="bg-amber-100/50 p-1 rounded-full inline-flex border border-amber-200 mb-4">
        <Link 
          href="/dashboard?view=month" 
          className={`px-5 py-1.5 rounded-full text-sm font-extrabold transition-all duration-300 ${
            viewMode === 'month' ? 'bg-white text-amber-950 shadow-sm' : 'text-amber-800/50 hover:text-amber-900'
          }`}
        >
          This Month
        </Link>
        <Link 
          href="/dashboard?view=all" 
          className={`px-5 py-1.5 rounded-full text-sm font-extrabold transition-all duration-300 ${
            viewMode === 'all' ? 'bg-white text-amber-950 shadow-sm' : 'text-amber-800/50 hover:text-amber-900'
          }`}
        >
          All Time
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
          <StatCard 
            title={viewMode === "month" ? "Monthly Income" : "Total Income"} 
            value={formatCurrency(totalIncome)} 
            icon="💰" 
          />
          <StatCard 
            title={viewMode === "month" ? "Treats Spent" : "Total Spent"} 
            value={formatCurrency(totalSpent)} 
            icon="🍪" 
          />
          <StatCard 
            title={viewMode === "month" ? "Treats Saved" : "Total Saved"} 
            value={formatCurrency(totalSaved)} 
            icon="🐷" 
            subtext={`${savingsRate}% of income`} 
          />
          <StatCard title="Paw Badges" value="🏅" icon="🏅" subtext="View in Profile" />
        </div>

        {/* Savings Power Card */}
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

      {/* Analytics Chart Section */}
      <section className="bg-white border-2 border-amber-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-8 items-center mt-6">
        <div className="w-full md:w-1/2">
          <h3 className="font-extrabold text-amber-900 mb-2">Spending Breakdown</h3>
          <p className="text-sm text-amber-700/70 mb-6">Where are your treats going?</p>
          <ExpenseChart data={chartData} />
        </div>
        
        <div className="w-full md:w-1/2 space-y-4">
          <div className="space-y-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
            {chartData.length === 0 ? (
              <p className="text-sm text-amber-800/60 bg-amber-50 p-4 rounded-xl text-center">
                Start tagging your records to see your breakdown here.
              </p>
            ) : (
              chartData.sort((a, b) => b.total - a.total).map((data, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="font-bold text-amber-950 text-sm">{data.name}</span>
                  <span className="font-bold text-red-600 text-sm">
                    {formatCurrency(data.total)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

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
        <p className="text-xl sm:text-2xl font-black text-amber-950">{value}</p>
        {subtext && <p className="text-xs font-bold text-amber-800/40 mt-1">{subtext}</p>}
      </div>
    </div>
  );
}
