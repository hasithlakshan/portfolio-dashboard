import {
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { Investment } from '../../types';

interface Props {
  investments: Investment[];
}

const CATEGORY_COLORS: Record<string, string> = {
  STOCK: '#3b82f6',
  BOND: '#8b5cf6',
  MUTUAL_FUND: '#f59e0b',
};

const CATEGORY_LABELS: Record<string, string> = {
  STOCK: 'Stocks',
  BOND: 'Bonds',
  MUTUAL_FUND: 'Mutual Funds',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export default function PortfolioChart({ investments }: Props) {
  // Allocation by category
  const allocationData = Object.entries(
    investments.reduce<Record<string, number>>((acc, inv) => {
      const val = inv.quantity * inv.currentPrice;
      acc[inv.category] = (acc[inv.category] ?? 0) + val;
      return acc;
    }, {}),
  ).map(([category, value]) => ({
    name: CATEGORY_LABELS[category],
    value,
    category,
    fill: CATEGORY_COLORS[category],
  }));

  // Top holdings by current value
  const holdingsData = [...investments]
    .sort((a, b) => b.quantity * b.currentPrice - a.quantity * a.currentPrice)
    .slice(0, 6)
    .map((inv) => ({
      ticker: inv.ticker,
      value: inv.quantity * inv.currentPrice,
      cost: inv.quantity * inv.purchasePrice,
    }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Allocation Pie */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Allocation by Category</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={allocationData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            />
            <Tooltip formatter={(v) => (typeof v === 'number' ? formatCurrency(v) : '')} />
            <Legend iconType="circle" iconSize={8} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top Holdings Bar */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Top Holdings — Value vs Cost</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={holdingsData} barGap={2}>
            <XAxis dataKey="ticker" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} width={45} />
            <Tooltip formatter={(v) => (typeof v === 'number' ? formatCurrency(v) : '')} />
            <Legend iconType="square" iconSize={8} />
            <Bar dataKey="cost" name="Cost" fill="#e2e8f0" radius={[3, 3, 0, 0]} />
            <Bar dataKey="value" name="Value" fill="#3b82f6" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
