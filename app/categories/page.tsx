import { prisma } from "../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import NewTagButton from "../../components/NewTagButton";
import CategoryItem from "../../components/CategoryItem"; // 1. Import the interactive component
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

  let categories = await prisma.category.findMany({ 
    where: { userId: user.id },
    include: { transactions: true },
    orderBy: { name: 'asc' } // Optional: keeps them alphabetized
  });

  // Seed default categories if the user has none
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
      include: { transactions: true },
      orderBy: { name: 'asc' }
    });
  }

  return (
    <main className="max-w-5xl mx-auto px-6 mt-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-amber-900">Your Categories 🏷️</h1>
        <NewTagButton />
      </div>
      
      {/* Responsive grid that adjusts columns based on screen size */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {categories.map((cat: CategoryWithTransactions) => (
          // 2. Delegate the UI rendering and interactivity to the Client Component
          <CategoryItem key={cat.id} cat={cat} />
        ))}
      </section>
    </main>
  );
}
