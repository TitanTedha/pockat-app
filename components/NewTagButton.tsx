"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTagButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("✨");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter(); // Next.js magic to refresh the page

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon }),
      });

      if (response.ok) {
        // Close modal and reset form
        setIsOpen(false);
        setName("");
        setIcon("✨");
        
        // This instantly refreshes your Server Components to show the new data!
        router.refresh(); 
      } else {
        alert("Failed to save the new tag.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold py-2 px-6 rounded-full shadow-sm transition-colors text-sm"
      >
        + New Tag
      </button>

      {/* The Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFDF7] p-6 rounded-3xl max-w-sm w-full shadow-lg border-2 border-amber-100">
            
            <h3 className="text-lg font-bold text-amber-900 mb-4">Create New Tag 🏷️</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-amber-800 mb-1">Tag Name</label>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Coffee, Games..."
                  className="w-full p-3 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                />
              </div>
              
              <div>
                <label className="block text-sm text-amber-800 mb-1">Emoji Icon</label>
                <input 
                  type="text" 
                  required 
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full p-3 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2.5 rounded-full font-bold text-amber-800 border-2 border-amber-100 hover:bg-amber-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-full font-bold bg-amber-400 text-amber-900 hover:bg-amber-500 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? "Saving..." : "Save Tag ✨"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}