import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { month: 'Srp', value: 12500 },
  { month: 'Kol', value: 18200 },
  { month: 'Ruj', value: 15800 },
  { month: 'Lis', value: 22100 },
  { month: 'Stu', value: 19500 },
  { month: 'Pro', value: 28400 },
];

export function AnalyticsSection() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-[0_2px_8px_rgba(0,0,0,0.06)] h-full">
      <div className="px-6 py-4 border-b border-[hsl(220_13%_91%)] dark:border-[hsl(0_0%_20%)]">
        <h3 className="font-semibold text-foreground text-[15px]">Analitika prometa</h3>
      </div>
      <div className="p-5">
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                width={35}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`${value.toLocaleString('hr-HR')} €`, 'Promet']}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2.5}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3.5 }}
                activeDot={{ r: 5, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 pt-3 border-t border-[hsl(220_13%_91%)] dark:border-[hsl(0_0%_20%)] flex items-center justify-between text-[13px]">
          <span className="text-muted-foreground">Posljednjih 6 mjeseci</span>
          <span className="font-semibold text-success">+18.4%</span>
        </div>
      </div>
    </div>
  );
}
