"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface ChartData {
  name: string;
  total: number;
  icon: string | null;
}

export default function ExpenseChart({ data }: { data: ChartData[] }) {
  // A set of nice, warm colors matching your amber theme
  const COLORS = ['#d97706', '#059669', '#2563eb', '#dc2626', '#7c3aed', '#db2777', '#ca8a04', '#94a3b8'];

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-amber-50/50 rounded-2xl border-2 border-dashed border-amber-200">
        <p className="text-amber-800/60 text-sm font-medium">No expense data yet to show analytics.</p>
      </div>
    );
  }

  // Custom tooltip to show currency formatting
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const amount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(payload[0].value);
      return (
        <div className="bg-white p-3 border border-amber-100 shadow-lg rounded-xl text-sm">
          <p className="font-bold text-amber-950">{payload[0].name}</p>
          <p className="text-amber-700">{amount}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="total"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
