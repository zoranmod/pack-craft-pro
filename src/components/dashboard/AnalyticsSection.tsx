import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardCard } from './DashboardCard';
import { Document } from '@/types/document';

interface AnalyticsSectionProps {
  documents?: Document[];
}

export function AnalyticsSection({ documents = [] }: AnalyticsSectionProps) {
  // Calculate analytics from actual documents
  const chartData = useMemo(() => {
    if (documents.length === 0) {
      return [];
    }

    // Group documents by month and sum total_amount
    const monthlyTotals: Record<string, number> = {};
    
    documents.forEach(doc => {
      if (doc.date && doc.totalAmount) {
        const date = new Date(doc.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + doc.totalAmount;
      }
    });

    // Sort by month and take last 6 months
    const sortedMonths = Object.keys(monthlyTotals).sort().slice(-6);
    
    const monthNames: Record<string, string> = {
      '01': 'Sij', '02': 'Velj', '03': 'Ožu', '04': 'Tra',
      '05': 'Svi', '06': 'Lip', '07': 'Srp', '08': 'Kol',
      '09': 'Ruj', '10': 'Lis', '11': 'Stu', '12': 'Pro'
    };

    return sortedMonths.map(monthKey => {
      const month = monthKey.split('-')[1];
      return {
        month: monthNames[month] || month,
        value: monthlyTotals[monthKey]
      };
    });
  }, [documents]);

  // Calculate trend
  const trend = useMemo(() => {
    if (chartData.length < 2) return null;
    const lastValue = chartData[chartData.length - 1]?.value || 0;
    const prevValue = chartData[chartData.length - 2]?.value || 0;
    if (prevValue === 0) return null;
    const change = ((lastValue - prevValue) / prevValue) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0
    };
  }, [chartData]);

  const totalAmount = documents.reduce((sum, doc) => sum + (doc.totalAmount || 0), 0);

  return (
    <DashboardCard title="Analitika prometa">
      <div className="p-5 flex flex-col h-full">
        {chartData.length > 0 ? (
          <>
            <div className="flex-1 min-h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
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
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      fontSize: '12px'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => [`${value.toLocaleString('hr-HR')} €`, 'Promet']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Ukupno: {totalAmount.toLocaleString('hr-HR')} €
              </span>
              {trend && (
                <span className={`font-semibold ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
                  {trend.isPositive ? '+' : '-'}{trend.value}%
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Nema podataka za prikaz
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
