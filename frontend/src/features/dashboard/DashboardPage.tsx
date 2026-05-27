import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { investmentsApi } from '../../api/investments.api';
import type { Investment } from '../../types';
import SummaryCards from './SummaryCards';
import PortfolioChart from './PortfolioChart';
import LoadingSpinner from '../../components/LoadingSpinner';
import DataTable from '../../components/DataTable';
import { baseInvestmentColumns } from '../investments/investmentColumns';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    investmentsApi
      .getAll()
      .then(setInvestments)
      .catch(() => setError('Failed to load portfolio data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Good {getGreeting()}, {user?.name.split(' ')[0]}
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">Here's your portfolio overview</p>
      </div>

      <SummaryCards investments={investments} />

      {investments.length > 0 && <PortfolioChart investments={investments} />}

      <DataTable
        columns={baseInvestmentColumns}
        data={investments.slice(0, 5)}
        keyExtractor={(inv) => inv.id}
        header={
          <>
            <h3 className="text-sm font-semibold text-gray-700">Holdings</h3>
            <Link to="/investments" className="text-xs font-medium text-blue-600 hover:text-blue-700">
              View all →
            </Link>
          </>
        }
        emptyTitle="No investments yet"
        emptyDescription="Add your first investment to start tracking your portfolio."
      />
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
