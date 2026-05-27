import type { Investment } from '../../types';
import type { Column } from '../../components/DataTable';
import { CategoryBadge } from '../../components/Badge';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export const baseInvestmentColumns: Column<Investment>[] = [
  {
    key: 'name',
    label: 'Name',
    render: (inv) => (
      <div>
        <p className="font-semibold text-gray-900">{inv.ticker}</p>
        <p className="text-xs text-gray-400 truncate max-w-[140px]">{inv.name}</p>
      </div>
    ),
  },
  {
    key: 'category',
    label: 'Category',
    render: (inv) => <CategoryBadge category={inv.category} />,
  },
  {
    key: 'quantity',
    label: 'Qty',
    render: (inv) => <span className="text-gray-600">{inv.quantity}</span>,
  },
  {
    key: 'purchasePrice',
    label: 'Purchase Price',
    render: (inv) => <span className="text-gray-600">{formatCurrency(inv.purchasePrice)}</span>,
  },
  {
    key: 'currentPrice',
    label: 'Current Price',
    render: (inv) => <span className="text-gray-600">{formatCurrency(inv.currentPrice)}</span>,
  },
  {
    key: 'marketValue',
    label: 'Market Value',
    render: (inv) => (
      <span className="font-medium text-gray-900">
        {formatCurrency(inv.quantity * inv.currentPrice)}
      </span>
    ),
  },
  {
    key: 'pnl',
    label: 'P&L',
    render: (inv) => {
      const pnl = (inv.currentPrice - inv.purchasePrice) * inv.quantity;
      const pct = ((inv.currentPrice - inv.purchasePrice) / inv.purchasePrice) * 100;
      return (
        <div className={pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
          <span className="font-medium">{formatCurrency(pnl)}</span>
          <span className="ml-1 text-xs">({pct >= 0 ? '+' : ''}{pct.toFixed(2)}%)</span>
        </div>
      );
    },
  },
];
