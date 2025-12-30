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
    <div className="bg-card rounded-xl border border-border">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Analitika prometa</h3>
      </div>
      <div className="p-6">
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`${value.toLocaleString('hr-HR')} €`, 'Promet']}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2.5}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Posljednjih 6 mjeseci</span>
          <span className="font-semibold text-success">+18.4%</span>
        </div>
      </div>
    </div>
  );
}
