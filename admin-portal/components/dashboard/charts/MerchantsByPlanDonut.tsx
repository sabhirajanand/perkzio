'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export interface PlanMixPoint {
  name: string;
  value: number;
  color: string;
}

export interface MerchantsByPlanDonutProps {
  data: PlanMixPoint[];
}

export default function MerchantsByPlanDonut({ data }: MerchantsByPlanDonutProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              borderColor: 'rgba(0,0,0,0.08)',
              boxShadow: '0 12px 30px rgba(0,0,0,0.10)',
            }}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={95}
            paddingAngle={2}
            stroke="rgba(255,255,255,0.9)"
            strokeWidth={2}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

