"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from 'next-cloudinary'; // 1. Import Cloudinary

export default function EditProfileModal({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || "");
  const [image, setImage] = useState(user.image || "");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSave = async () => {
    await fetch("/api/user", {
      method: "PATCH",
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

            {/* 2. The New Cloudinary Upload Widget */}
            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1">Profile Picture</label>
              
              <div className="flex items-center gap-3">
                {/* Show a tiny preview if they already have an image */}
                {image && (
                  <img src={image} alt="Preview" className="w-10 h-10 rounded-full object-cover border-2 border-amber-200" />
                )}
                
                <CldUploadWidget 
                  uploadPreset="pockat_avatars" // <-- PASTE YOUR PRESET NAME HERE
                  onSuccess={(result) => {
                    // When upload finishes, grab the new secure URL and save it to state
                    if (result.info && typeof result.info !== 'string') {
                      setImage(result.info.secure_url);
                    }
                  }}
                >
                  {({ open }) => {
                    return (
                      <button 
                        type="button" 
                        onClick={() => open()}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-xl text-xs transition-colors flex-1 text-left"
                      >
                        {image ? "Change Picture 📸" : "Upload Picture 📸"}
                      </button>
                    );
                  }}
                </CldUploadWidget>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1">New Password (Optional)</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full p-2 border-2 border-amber-100 rounded-xl outline-none focus:border-amber-400 text-sm" 
                placeholder="Leave blank to keep current" 
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setIsOpen(false)} 
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="flex-1 py-2.5 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-full font-bold text-sm transition-colors"
              >
                Save Changes
              </button>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}
