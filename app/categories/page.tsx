import { prisma } from "../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import NewTagButton from "../../components/NewTagButton";
import CategoryItem from "../../components/CategoryItem"; 
import ExpenseChart from "../../components/ExpenseChart"; // Import the new chart
import { Prisma } from "@prisma/client";

// Tell TypeScript exactly what this query returns
type CategoryWithTransactions = Prisma.CategoryGetPayload<{
  include: { transactions: true };
}>;

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/signin");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/signin");

  // 1. Fetch Categories (using 'let' so we can reassign if we need to seed)
  let categories = await prisma.category.findMany({ 
    where: { userId: user.id },
    include: { transactions: true },
    orderBy: { name: 'asc' } 
  });

  // 2. SEEDING LOGIC: Seed default categories if the user has none
  if (categories.length === 0) {
    const defaults = [
      { name: "Bills", icon: "💡" },
      { name: "Food", icon: "🍽️" },
      { name: "Shopping", icon: "🛍️" },
      { name: "Transport", icon: "🚗" },
    ];
    
    await prisma.category.createMany({
      data: defaults.map(d => ({ ...d, userId: user.id }))
    });
    
    // Re-fetch now that defaults are in the database
    categories = await prisma.category.findMany({ 
      where: { userId: user.id },
      include: { transactions: true },
      orderBy: { name: 'asc' }
    });
  }

  // 3. ANALYTICS LOGIC: Fetch all SPENDING transactions to calculate totals
  const spendingTransactions = await prisma.transaction.findMany({
    where: { userId: user.id, type: "SPENDING" },
    include: { category: true }
  });

  // Calculate totals for the Chart
  let othersTotal = 0;
  const categoryTotals: Record<string, number> = {};

  spendingTransactions.forEach(tx => {
    if (tx.categoryId && tx.category) {
      categoryTotals[tx.category.name] = (categoryTotals[tx.category.name] || 0) + tx.amount;
    } else {
      othersTotal += tx.amount; // Catch all transactions with NO category
    }
  });

  // Format data specifically for the Recharts component
  const chartData = categories
    .map(cat => ({
      name: `${cat.icon || ""} ${cat.name}`.trim(),
      total: categoryTotals[cat.name] || 0,
      icon: cat.icon
    }))
    .filter(d => d.total > 0); // Only show categories on the chart if they have expenses

  // Inject "Others" into the chart if there is un-categorized spending
  if (othersTotal > 0) {
    chartData.push({
      name: "📦 Others",
      total: othersTotal,
      icon: "📦"
    });
  }

  return (
    <main className="max-w-5xl mx-auto px-6 mt-10 space-y-10">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-amber-900">Categories & Analytics 🏷️</h1>
        <NewTagButton />
      </div>

      {/* Analytics Section */}
      <section className="bg-white border-2 border-amber-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full md:w-1/2">
          <h3 className="font-extrabold text-amber-900 mb-2">Spending Breakdown</h3>
          <p className="text-sm text-amber-700/70 mb-6">Where is your money going?</p>
          <ExpenseChart data={chartData} />
        </div>
        
        <div className="w-full md:w-1/2 space-y-3">
          {chartData.length === 0 ? (
            <p className="text-sm text-amber-800/60 bg-amber-50 p-4 rounded-xl">Start tagging your records to see your breakdown here.</p>
          ) : (
            chartData.map((data, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-amber-50 pb-2">
                <span className="font-bold text-amber-950 text-sm">{data.name}</span>
                <span className="font-bold text-red-600 text-sm">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(data.total)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
      
      {/* Categories Grid */}
      <section>
        <h3 className="font-extrabold text-amber-900 mb-4">Manage Tags</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {categories.map((cat: CategoryWithTransactions) => (
            <CategoryItem key={cat.id} cat={cat} />
          ))}
          
          {/* Static UI representation for the "Others" bucket */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 shadow-sm opacity-70">
            <h3 className="font-bold text-gray-700">📦 Others</h3>
            <p className="text-xs text-gray-500 mt-1">Untagged records</p>
          </div>
        </div>
      </section>

    </main>
  );
}
