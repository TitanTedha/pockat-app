import RecordingMenu from "../../components/RecordingMenu";
import RecordingWrapper from "../../components/RecordingWrapper"; // New client wrapper
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

  // Fetch categories and transactions in parallel for better performance
  const [categories, transactions] = await Promise.all([
    prisma.category.findMany({ where: { userId: user.id } }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    }),
  ]);

  // Cleaner financial calculation using reduce
  const { income, spent } = transactions.reduce(
    (acc, tx) => {
      if (tx.type === "INCOME") acc.income += tx.amount;
      if (tx.type === "SPENDING") acc.spent += tx.amount;
      return acc;
    },
    { income: 0, spent: 0 }
  );

  return (
    <div className="max-w-6xl mx-auto px-6 mt-10">
      <h1 className="text-2xl font-extrabold text-amber-900 text-center mb-8">
        Recording Menu 📝
      </h1>

      {/* Wrapping the UI in the client-side scanner logic */}
      <RecordingWrapper>
        <div className="flex justify-center gap-6 mb-8 text-sm">
          <p className="font-bold text-green-700">Income: {formatCurrency(income)}</p>
          <p className="font-bold text-red-700">Spent: {formatCurrency(spent)}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
          <RecordingMenu categories={categories} />

          <div className="bg-[#FFFDF7] border-2 border-amber-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-amber-900 mb-4">Live Timeline ⏱️</h3>
            <div className="space-y-3 max-h-[350px] overflow-y-auto">
              {transactions.length === 0 ? (
                <p className="text-xs text-amber-800/50 text-center py-4">No records yet.</p>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="flex justify-between p-3 bg-white border border-amber-50 rounded-xl">
                    <p className="text-sm font-bold text-amber-950 truncate max-w-[150px]">
                      {tx.description || tx.type}
                    </p>
                    <span className={`font-bold ${tx.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
                      {tx.type === "INCOME" ? "+" : ""}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </RecordingWrapper>
    </div>
  );
}