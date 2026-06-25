// components/RecordingMenu.tsx
"use client";

import { useState } from "react";

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function RecordingMenu({ categories }: { categories: Category[] }) {
  const [activeTab, setActiveTab] = useState<"INCOME" | "SPENDING">("INCOME");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      type: activeTab,
      amount: parseFloat(amount),
      date,
      description,
      ...(activeTab === "SPENDING" && { categoryId: category }),
    };

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(`Success! ${activeTab === "INCOME" ? "Income" : "Spending"} recorded! 🐾`);
        setAmount("");
        setDescription("");
        setCategory("");
      } else {
        const errorData = await response.json();
        alert(`Uh oh: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-amber-50 rounded-xl p-6 shadow-sm border border-amber-100 w-full">
      <div className="flex bg-amber-200/50 rounded-full p-1 mb-6">
        <button type="button" onClick={() => setActiveTab("INCOME")} className={`flex-1 py-2 rounded-full text-sm font-bold transition-colors ${activeTab === "INCOME" ? "bg-green-500 text-white shadow-sm" : "text-amber-800"}`}>💰 Income</button>
        <button type="button" onClick={() => setActiveTab("SPENDING")} className={`flex-1 py-2 rounded-full text-sm font-bold transition-colors ${activeTab === "SPENDING" ? "bg-red-500 text-white shadow-sm" : "text-amber-800"}`}>🍪 Spending</button>
      </div>

      <h2 className="text-xl font-bold text-amber-900 mb-4">Log {activeTab === "INCOME" ? "Income" : "Spending"}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-amber-800 mb-1">Amount</label>
          <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-3 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" placeholder="0.00" required disabled={isSubmitting} />
        </div>

        {/* DYNAMIC CATEGORY PICKER FOR SPENDING ONLY */}
        {activeTab === "SPENDING" && (
          <div>
            <label className="block text-sm text-amber-800 mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" required disabled={isSubmitting}>
              <option value="" disabled>Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm text-amber-800 mb-1">Description (optional)</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" placeholder={activeTab === "INCOME" ? "Paycheck, side gig..." : "Coffee, treats..."} disabled={isSubmitting} />
        </div>

        <div>
          <label className="block text-sm text-amber-800 mb-1">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" required disabled={isSubmitting} />
        </div>

        <button type="submit" disabled={isSubmitting} className={`w-full py-3 font-bold rounded-lg shadow-md transition-all transform ${isSubmitting ? "bg-amber-300 text-amber-700 cursor-not-allowed" : "bg-amber-400 hover:bg-amber-500 text-amber-900 hover:scale-[1.02]"}`}>
          {isSubmitting ? "Saving..." : `Record ${activeTab === "INCOME" ? "Income 💰" : "Spending 🍪"}`}
        </button>
      </form>
    </div>
  );
}