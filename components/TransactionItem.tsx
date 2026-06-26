"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "../lib/utils"; // Adjust path if needed

export default function TransactionItem({ tx }: { tx: any }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ description: tx.description, amount: tx.amount });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    setIsDeleting(true);
    
    await fetch(`/api/record/${tx.id}`, { method: "DELETE" });
    router.refresh(); // Tells Next.js to update the timeline instantly
  };

  const handleUpdate = async () => {
    await fetch(`/api/record/${tx.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setIsEditing(false);
    router.refresh();
  };

  if (isEditing) {
    return (
      <div className="flex gap-2 p-3 bg-amber-50 border border-amber-300 rounded-xl">
        <input 
          className="flex-1 px-2 py-1 text-sm rounded border" 
          value={editForm.description} 
          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
        />
        <input 
          type="number" 
          className="w-24 px-2 py-1 text-sm rounded border" 
          value={editForm.amount} 
          onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
        />
        <button onClick={handleUpdate} className="text-green-600 font-bold text-sm">Save</button>
        <button onClick={() => setIsEditing(false)} className="text-gray-500 font-bold text-sm">Cancel</button>
      </div>
    );
  }

  return (
    <div className={`flex justify-between items-center p-3 bg-white border border-amber-100 rounded-xl hover:border-amber-300 transition-colors ${isDeleting ? "opacity-50" : ""}`}>
      <div className="flex flex-col">
        <p className="text-sm font-bold text-amber-950 truncate max-w-[160px]">
          {tx.description || tx.type}
        </p>
        <span className="text-xs text-amber-600/70 font-medium">
          {new Date(tx.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <span className={`font-extrabold tracking-tight ${tx.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
          {tx.type === "INCOME" ? "+" : "-"}
          {formatCurrency(tx.amount)}
        </span>
        
        {/* Action Buttons */}
        <div className="flex gap-2 text-xs">
          <button onClick={() => setIsEditing(true)} className="text-blue-500 hover:text-blue-700">✏️</button>
          <button onClick={handleDelete} className="text-red-500 hover:text-red-700" disabled={isDeleting}>🗑️</button>
        </div>
      </div>
    </div>
  );
}
