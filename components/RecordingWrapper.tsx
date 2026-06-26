"use client";
import { useState } from "react";
import ReceiptScanner from "./ScanButton";

// 1. Define the shape of the data returned by your scanner
interface ReceiptData {
  merchant: string;
  amount: number;
  date: string;
}

export default function RecordingWrapper({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState({ amount: "", description: "" });

  return (
    <div>
      <div className="flex justify-center mb-6">
        {/* 2. Type the 'data' parameter in the callback */}
        <ReceiptScanner onResult={(data: ReceiptData) => {
          setFormData({ 
            amount: data.amount.toString(), 
            description: data.merchant 
          });
          alert(`Scanned: ${data.merchant} for ${data.amount}`);
        }} />
      </div>
      {children}
    </div>
  );
}