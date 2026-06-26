"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReceiptScanner from "./ScanButton";

interface ReceiptData {
  merchant: string | null;
  amount: number | null;
  date: string | null;
}

export default function RecordingWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // This function automatically pushes the scanned AI data directly to your DB
  const handleScanResult = async (data: ReceiptData) => {
    if (!data || !data.amount) {
      alert("Could not extract valid transaction amount. Please try a clearer photo.");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Send the data to your records API endpoint
      const response = await fetch("/api/record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merchant: data.merchant || "Unknown Merchant",
          amount: data.amount,
          date: data.date,
        }),
      });

      if (!response.ok) {
        const errPayload = await response.json();
        throw new Error(errPayload.error || "Failed to save transaction");
      }

      const savedRecord = await response.json();
      alert(`🎉 Auto-Saved: ${savedRecord.description || "Transaction"} for ${data.amount}!`);
      
      // 2. This forces Next.js Server Components inside {children} to fetch fresh data instantly
      router.refresh(); 

    } catch (error: any) {
      console.error("Error auto-saving scanned receipt:", error);
      alert(`Scan succeeded, but couldn't save to database: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center justify-center mb-6 gap-2">
        <ReceiptScanner onResult={handleScanResult} />
        {isSaving && (
          <p className="text-xs font-semibold text-amber-700 animate-pulse">
            Processing and inserting into database... 💾
          </p>
        )}
      </div>
      
      {/* This renders your refined layout grid and live timeline instantly */}
      {children}
    </div>
  );
}
