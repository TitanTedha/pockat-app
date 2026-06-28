import RecordingMenu from "../../components/RecordingMenu";
import RecordingWrapper from "../../components/RecordingWrapper"; 
import TransactionItem from "../../components/TransactionItem"; // Injecting our interactive component
import { prisma } from "../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { formatCurrency } from "../lib/utils";

export default async function RecordingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/signin");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) redirect("/signin");

  // Fetch categories and transactions in parallel
  const [categories, transactions] = await Promise.all([
    prisma.category.findMany({ where: { userId: user.id } }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    }),
  ]);

  // Clean financial calculation using reduce
  const { income, spent } = transactions.reduce(
    (acc, tx) => {
      if (tx.type === "INCOME") acc.income += tx.amount;
      if (tx.type === "SPENDING") acc.spent += tx.amount;
      return acc;
    },
    { income: 0, spent: 0 }
  );

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 mt-6 md:mt-10 mb-24 md:mb-10 space-y-6 md:space-y-8">
      <h1 className="text-3xl font-extrabold text-amber-900 text-center mb-8">
        Recording Menu 📝
      </h1>

      {/* Wrapping the UI in the client-side scanner logic */}
      <RecordingWrapper>
        
        {/* Highlighted Financial Summary */}
        <section className="flex justify-center gap-6 mb-8 text-sm">
          <div className="bg-green-50 px-5 py-2 rounded-xl border border-green-200 shadow-sm">
            <p className="font-bold text-green-700">Income: {formatCurrency(income)}</p>
          </div>
          <div className="bg-red-50 px-5 py-2 rounded-xl border border-red-200 shadow-sm">
            <p className="font-bold text-red-700">Spent: {formatCurrency(spent)}</p>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
          
          {/* Passing categories down so they can be edited/deleted inside the menu */}
          <RecordingMenu categories={categories} />

          <section className="bg-[#FFFDF7] border-2 border-amber-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-amber-900 mb-4">Live Timeline ⏱️</h3>
            
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {transactions.length === 0 ? (
                <p className="text-sm text-amber-800/60 text-center py-8 bg-amber-50/50 rounded-xl border border-dashed border-amber-200">
                  No records yet. Scan a receipt to start!
                </p>
              ) : (
                transactions.map((tx) => (
                  // Replaced the static div with our new interactive Client Component
                  // We also pass the categories down so the user can change the tag while editing!
                  <TransactionItem 
                    key={tx.id} 
                    tx={tx} 
                    categories={categories} 
                  />
                ))
              )}
            </div>
          </section>

        </div>
      </RecordingWrapper>
    </main>
  );
}
