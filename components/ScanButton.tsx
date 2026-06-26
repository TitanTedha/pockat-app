"use client";
import { useState } from "react";

// 1. Define the props interface here
interface ReceiptScannerProps {
  onResult: (data: { merchant: string; amount: number; date: string }) => void;
}

// 2. Pass the interface to your component
export default function ReceiptScanner({ onResult }: ReceiptScannerProps) {
  const [loading, setLoading] = useState(false);

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("receipt", file);

    const res = await fetch("/api/scan", { method: "POST", body: formData });
    const data = await res.json();
    
    // 3. Now TypeScript knows onResult is a function that accepts specific data
    onResult(data); 
    setLoading(false);
  };

  return (
    <label className="cursor-pointer bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition">
      {loading ? "Scanning..." : "📷 Scan Receipt"}
      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleScan} />
    </label>
  );
}