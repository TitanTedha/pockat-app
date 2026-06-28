import { prisma } from "../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import NewTagButton from "../../components/NewTagButton";
import CategoryItem from "../../components/CategoryItem"; 
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

  return (
    // 1. Fluid spacing applied to the main wrapper
    <main className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 mt-6 md:mt-10 mb-24 md:mb-10 space-y-6 md:space-y-8">
      
      {/* 2. Responsive Header */}
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-amber-900 truncate">
          Categories 🏷️
        </h1>
        <div className="shrink-0">
          <NewTagButton />
        </div>
      </div>
      
      {/* 3. Mobile-Optimized Grid */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {categories.map((cat: CategoryWithTransactions) => (
            <CategoryItem key={cat.id} cat={cat} />
          ))}
          
          {/* Static UI representation for the "Others" bucket */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 shadow-sm opacity-70 flex flex-col justify-center min-h-[100px]">
            <h3 className="font-bold text-gray-700 text-sm md:text-base">📦 Others</h3>
            <p className="text-[10px] md:text-xs text-gray-500 mt-1">Untagged records</p>
          </div>
        </div>
      </section>

    </main>
  );
}
