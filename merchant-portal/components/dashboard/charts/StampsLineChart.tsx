'use client';

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface StampsLinePoint {
  day: string;
  stamps: number;
}

export interface StampsLineChartProps {
  data: StampsLinePoint[];
}

export default function StampsLineChart({ data }: StampsLineChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#4B5563' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#4B5563' }} axisLine={false} tickLine={false} width={28} />
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              borderColor: 'rgba(0,0,0,0.08)',
              boxShadow: '0 12px 30px rgba(0,0,0,0.10)',
            }}
          />
          <Line type="monotone" dataKey="stamps" stroke="#F11E69" strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

