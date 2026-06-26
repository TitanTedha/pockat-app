"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CategoryItemProps {
  cat: {
    id: string;
    name: string;
    icon: string | null;
    transactions: any[];
  };
}

export default function CategoryItem({ cat }: CategoryItemProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: cat.name, icon: cat.icon || "🏷️" });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdate = async () => {
    // Fixed: Pointing to the plural /api/categories/[id] endpoint
    const res = await fetch(`/api/categories/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    if (res.ok) {
      setIsEditing(false);
      router.refresh(); // Triggers Next.js to update server data instantly
    } else {
      alert("Failed to update category.");
    }
  };

  const handleDelete = async () => {
    if (cat.transactions.length > 0) {
      const confirmMsg = `This category has ${cat.transactions.length} records. Deleting it will untag these records (moving them to 'Others'). Proceed?`;
      if (!confirm(confirmMsg)) return;
    } else {
      if (!confirm(`Are you sure you want to delete the "${cat.name}" category?`)) return;
    }

    setIsDeleting(true);

    // Fixed: Pointing to the plural /api/categories/[id] endpoint
    const res = await fetch(`/api/categories/${cat.id}`, { 
      method: "DELETE" 
    });

    if (res.ok) {
      router.refresh(); // Triggers Next.js to update server data instantly
    } else {
      setIsDeleting(false);
      alert("Failed to delete category.");
    }
  };

  if (isEditing) {
    return (
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 shadow-sm flex flex-col gap-3 animate-fadeIn">
        <div className="flex gap-2">
          <input
            className="w-12 px-2 py-1 text-center text-sm rounded border border-amber-200 outline-none focus:border-amber-500 bg-white"
            value={editForm.icon}
            onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
            maxLength={2} 
          />
          <input
            className="flex-1 px-2 py-1 text-sm rounded border border-amber-200 outline-none focus:border-amber-500 bg-white"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-3 mt-1">
          <button onClick={() => setIsEditing(false)} className="text-gray-500 font-bold text-xs hover:text-gray-700">
            Cancel
          </button>
          <button onClick={handleUpdate} className="text-green-600 font-bold text-xs bg-green-100 px-3 py-1 rounded-md hover:bg-green-200 transition-colors">
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`group bg-[#FFFDF7] border-2 border-amber-100 rounded-2xl p-4 shadow-sm hover:border-amber-300 transition-all flex justify-between items-start ${isDeleting ? "opacity-50 scale-95" : "opacity-100"}`}>
      <div>
        <h3 className="font-bold text-amber-950">{cat.icon} {cat.name}</h3>
        <p className="text-xs text-amber-800/50 mt-1">{cat.transactions.length} records</p>
      </div>
      
      {/* Action buttons reveal cleanly on hover */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setIsEditing(true)} className="text-blue-500 hover:text-blue-700 hover:scale-110 transition-transform">✏️</button>
        <button onClick={handleDelete} className="text-red-500 hover:text-red-700 hover:scale-110 transition-transform" disabled={isDeleting}>🗑️</button>
      </div>
    </div>
  );
}
