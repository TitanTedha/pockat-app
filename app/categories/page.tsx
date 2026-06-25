import { prisma } from "../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import NewTagButton from "../../components/NewTagButton";

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/signin");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/signin");

  // Check if user has any categories
  let categories = await prisma.category.findMany({ 
    where: { userId: user.id },
    include: { transactions: true }
  });

  // AUTO-SEED: If empty, create the defaults
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
    
    // Refresh the list
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
        {categories.map((cat) => (
          <div key={cat.id} className="bg-[#FFFDF7] border-2 border-amber-100 rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-amber-950">{cat.icon} {cat.name}</h3>
            <p className="text-xs text-amber-800/50">{cat.transactions.length} records</p>
          </div>
        ))}
      </div>
    </div>
  );
}