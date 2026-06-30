// app/signin/page.tsx
"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link"; // <-- ADDED THIS LINE

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-amber-100 max-w-sm w-full">
        <h1 className="text-3xl font-black text-amber-900 mb-2">Welcome Back! 🐱</h1>
        <p className="text-amber-800/60 mb-6 font-medium">Log in or auto-register your new account.</p>
        
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            signIn("credentials", { email, password, callbackUrl: "/dashboard" });
          }} 
          className="space-y-4"
        >
          <input 
            type="email" placeholder="Email" required onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none"
          />
          <input 
            type="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-400 outline-none"
          />
          
          <div className="text-center mt-4">
            <Link href="/forgot-password" className="text-sm font-bold text-amber-600 hover:text-amber-800 transition-colors">
              Forgot Password? 😿
            </Link>
          </div>
          
          <button type="submit" className="w-full bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold py-3 rounded-xl transition-all">
            Sign In / Register
          </button>
        </form>
      </div>
    </div>
  );
}
