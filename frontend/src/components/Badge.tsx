import type { InvestmentCategory, TransactionType } from '../types';

const categoryStyles: Record<InvestmentCategory, string> = {
  STOCK: 'bg-blue-100 text-blue-700',
  BOND: 'bg-purple-100 text-purple-700',
  MUTUAL_FUND: 'bg-amber-100 text-amber-700',
};

const categoryLabels: Record<InvestmentCategory, string> = {
  STOCK: 'Stock',
  BOND: 'Bond',
  MUTUAL_FUND: 'Mutual Fund',
};

const typeStyles: Record<TransactionType, string> = {
  BUY: 'bg-green-100 text-green-700',
  SELL: 'bg-red-100 text-red-700',
};

interface CategoryBadgeProps {
  category: InvestmentCategory;
}

interface TransactionBadgeProps {
  type: TransactionType;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryStyles[category]}`}>
      {categoryLabels[category]}
    </span>
  );
}

export function TransactionTypeBadge({ type }: TransactionBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeStyles[type]}`}>
      {type}
    </span>
  );
}
