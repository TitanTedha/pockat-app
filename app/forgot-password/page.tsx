"use client";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Sending link...");
    
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
    });
    
    setStatus("If an account exists, a link was sent! 🐾");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl border-2 border-amber-100 shadow-lg max-w-sm w-full animate-fadeIn">
        <h1 className="text-2xl font-extrabold text-amber-950 mb-2">Forgot Password? 😿</h1>
        <p className="text-amber-800/70 text-sm font-medium mb-6">Enter your email and we'll send you a rescue link.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            required 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="kitty@pockat.com" 
            className="w-full p-3 border-2 border-amber-100 rounded-xl outline-none focus:border-amber-400"
          />
          <button type="submit" className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-full font-bold transition-all active:scale-95">
            {status || "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/signin" className="text-sm font-bold text-amber-600 hover:text-amber-800">
            Wait, I remember it! 🐾
          </Link>
        </div>
      </div>
    </div>
  );
}
