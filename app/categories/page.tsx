import { prisma } from "../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import NewTagButton from "../../components/NewTagButton";
// 1. Import Prisma to access the generated types
import { Prisma } from "@prisma/client";

// 2. Tell TypeScript exactly what this query returns
type CategoryWithTransactions = Prisma.CategoryGetPayload<{
  include: { transactions: true };
}>;

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/signin");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/signin");

  let categories = await prisma.category.findMany({ 
    where: { userId: user.id },
    include: { transactions: true }
  });

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
    
    categories = await prisma.category.findMany({ 
      where: { userId: user.id },
      include: { transactions: true }
    });
  }

  return (
    <div className="max-w-5xl mx-auto px-6 mt-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-extrabold text-amber-900">Your Categories 🏷️</h1>
        <NewTagButton />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 3. Explicitly type the cat parameter */}
        {categories.map((cat: CategoryWithTransactions) => (
          <div key={cat.id} className="bg-[#FFFDF7] border-2 border-amber-100 rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-amber-950">{cat.icon} {cat.name}</h3>
            <p className="text-xs text-amber-800/50">{cat.transactions.length} records</p>
          </div>
        ))}
      </div>
    </div>
  );
}
