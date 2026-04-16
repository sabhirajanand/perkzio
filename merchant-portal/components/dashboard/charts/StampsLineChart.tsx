'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

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
          <defs>
            <linearGradient id="stampsLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#b7004b" />
              <stop offset="100%" stopColor="#b30069" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(44,47,46,0.06)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12, fill: '#757776' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 12, fill: '#757776' }} axisLine={false} tickLine={false} width={28} />
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              borderColor: 'rgba(0,0,0,0.08)',
              boxShadow: '0 12px 30px rgba(0,0,0,0.10)',
            }}
          />
          <Line
            type="monotone"
            dataKey="stamps"
            stroke="url(#stampsLineGrad)"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

