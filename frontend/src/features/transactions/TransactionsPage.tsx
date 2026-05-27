import { useState, useEffect, useCallback } from 'react';
import { transactionsApi, type TransactionQuery } from '../../api/transactions.api';
import type { Transaction } from '../../types';
import { CategoryBadge, TransactionTypeBadge } from '../../components/Badge';
import DataTable, { type Column, type PaginationMeta } from '../../components/DataTable';
import { Link } from 'react-router-dom';

type SortField = 'createdAt' | 'total' | 'type';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(iso));
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const load = useCallback((query: TransactionQuery) => {
    setLoading(true);
    transactionsApi
      .getAll(query)
      .then((res) => {
        setTransactions(res.data);
        setMeta(res.meta);
      })
      .catch(() => setError('Failed to load transactions'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load({ page, limit: 10, sortBy, sortOrder });
  }, [load, page, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    const f = field as SortField;
    if (sortBy === f) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(f);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const columns: Column<Transaction>[] = [
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (tx) => <span className="text-gray-500 whitespace-nowrap">{formatDate(tx.createdAt)}</span>,
    },
    {
      key: 'investment',
      label: 'Investment',
      render: (tx) => (
        <div>
          <span className="font-medium text-gray-900">{tx.investment.ticker}</span>
          <span className="ml-2 text-xs text-gray-400">{tx.investment.name}</span>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (tx) => <CategoryBadge category={tx.investment.category} />,
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (tx) => <TransactionTypeBadge type={tx.type} />,
    },
    {
      key: 'quantity',
      label: 'Qty',
      render: (tx) => <span className="text-gray-600">{Number(tx.quantity)}</span>,
    },
    {
      key: 'price',
      label: 'Price',
      render: (tx) => <span className="text-gray-600">{formatCurrency(Number(tx.price))}</span>,
    },
    {
      key: 'total',
      label: 'Total',
      sortable: true,
      render: (tx) => <span className="font-medium text-gray-900">{formatCurrency(Number(tx.total))}</span>,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Transaction History</h1>
        <p className="mt-0.5 text-sm text-gray-500">{meta.total} total transactions</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <DataTable
        columns={columns}
        data={transactions}
        keyExtractor={(tx) => tx.id}
        loading={loading}
        emptyTitle="No transactions yet"
        emptyDescription="Transactions are created automatically when you add investments."
        emptyAction={
          <>
            <Link to="/investments" className="text-xs font-medium text-blue-600 hover:text-blue-700">
              investments →
            </Link>
          </>
        }
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        pagination={meta}
        onPageChange={setPage}
      />
    </div>
  );
}
