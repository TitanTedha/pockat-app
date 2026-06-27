"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProfileModal({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || "");
  const [image, setImage] = useState(user.image || ""); // 1. Added image state
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSave = async () => {
    await fetch("/api/user", {
      method: "PATCH",
      // 2. Added image to the JSON body
      body: JSON.stringify({ name, bio, password, image }),
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-xl">
            <h2 className="font-extrabold text-xl text-amber-950 mb-2">Edit Profile</h2>
            
            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1">Name</label>
              <input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full p-2 border-2 border-amber-100 rounded-xl outline-none focus:border-amber-400 text-sm" 
                placeholder="Name" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1">Bio</label>
              <textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                className="w-full p-2 border-2 border-amber-100 rounded-xl outline-none focus:border-amber-400 text-sm resize-none" 
                placeholder="Write a short bio..." 
                rows={2}
              />
            </div>

            {/* 3. Added Avatar Input Field */}
            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1">Avatar URL</label>
              <input 
                type="url" 
                value={image} 
                onChange={(e) => setImage(e.target.value)} 
                className="w-full p-2 border-2 border-amber-100 rounded
