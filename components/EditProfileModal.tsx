"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProfileModal({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || "");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSave = async () => {
    await fetch("/api/user", {
      method: "PATCH",
      body: JSON.stringify({ name, bio, password }),
      headers: { "Content-Type": "application/json" },
    });
    setIsOpen(false);
    router.refresh();
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold py-2 px-6 rounded-full shadow-sm transition-colors text-sm">
        Edit Profile
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-4">
            <h2 className="font-bold text-lg">Edit Profile</h2>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" placeholder="Name" />
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full p-2 border rounded" placeholder="Bio" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded" placeholder="New Password" />
            <div className="flex gap-2">
              <button onClick={() => setIsOpen(false)} className="flex-1 py-2 bg-gray-200 rounded-full">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2 bg-amber-400 rounded-full font-bold">Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}