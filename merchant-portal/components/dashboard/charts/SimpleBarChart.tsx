'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface SimpleBarPoint {
  label: string;
  value: number;
}

export interface SimpleBarChartProps {
  data: SimpleBarPoint[];
  color?: string;
}

export default function SimpleBarChart({ data, color = '#111827' }: SimpleBarChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#4B5563' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#4B5563' }} axisLine={false} tickLine={false} width={28} />
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              borderColor: 'rgba(0,0,0,0.08)',
              boxShadow: '0 12px 30px rgba(0,0,0,0.10)',
            }}
          />
          <Bar dataKey="value" radius={[16, 16, 16, 16]} fill={color} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

