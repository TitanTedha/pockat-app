"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Updating...");
    
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword: password }),
      headers: { "Content-Type": "application/json" },
    });
    
    if (res.ok) {
      alert("Password updated successfully! You can now log in. 🐾");
      router.push("/signin");
    } else {
      setStatus("Error: Link may be expired.");
    }
  };

  if (!token) return <p className="text-red-500 font-bold">Invalid or missing token.</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input 
        type="password" 
        required 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        placeholder="New Password" 
        className="w-full p-3 border-2 border-amber-100 rounded-xl outline-none focus:border-amber-400"
      />
      <button type="submit" className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-full font-bold transition-all active:scale-95">
        {status || "Save New Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl border-2 border-amber-100 shadow-lg max-w-sm w-full text-center animate-fadeIn">
        <h1 className="text-2xl font-extrabold text-amber-950 mb-2">New Password 🔐</h1>
        <p className="text-amber-800/70 text-sm font-medium mb-6">Make it a strong one!</p>
        <Suspense fallback={<p>Loading...</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
