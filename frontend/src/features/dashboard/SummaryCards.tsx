import type { Investment } from '../../types';

interface Props {
  investments: Investment[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function formatPercent(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export default function SummaryCards({ investments }: Props) {
  const totalValue = investments.reduce((sum, inv) => sum + inv.quantity * inv.currentPrice, 0);
  const totalCost = investments.reduce((sum, inv) => sum + inv.quantity * inv.purchasePrice, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  const cards = [
    {
      label: 'Portfolio Value',
      value: formatCurrency(totalValue),
      sub: `${investments.length} holdings`,
      color: 'blue',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Total Invested',
      value: formatCurrency(totalCost),
      sub: 'Cost basis',
      color: 'gray',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      label: 'Total P&L',
      value: formatCurrency(totalPnl),
      sub: formatPercent(totalPnlPct),
      color: totalPnl >= 0 ? 'green' : 'red',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      label: 'Holdings',
      value: String(investments.length),
      sub: [
        `${investments.filter((i) => i.category === 'STOCK').length} Stocks`,
        `${investments.filter((i) => i.category === 'BOND').length} Bonds`,
        `${investments.filter((i) => i.category === 'MUTUAL_FUND').length} Funds`,
      ].join(' · '),
      color: 'purple',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
  ];

  const iconBg: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    gray: 'bg-gray-100 text-gray-500',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  const valueColor: Record<string, string> = {
    blue: 'text-gray-900',
    gray: 'text-gray-900',
    green: 'text-green-600',
    red: 'text-red-600',
    purple: 'text-gray-900',
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <span className={`rounded-lg p-2 ${iconBg[card.color]}`}>{card.icon}</span>
          </div>
          <p className={`mt-3 text-2xl font-bold ${valueColor[card.color]}`}>{card.value}</p>
          <p className="mt-1 text-xs text-gray-400">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
