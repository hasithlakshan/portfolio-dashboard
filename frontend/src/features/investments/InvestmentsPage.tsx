import { useState, useEffect, useCallback } from 'react';
import { investmentsApi } from '../../api/investments.api';
import type { Investment } from '../../types';
import type { InvestmentFormData } from './investmentSchema';
import InvestmentModal from './InvestmentModal';
import SellModal from './SellModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import DataTable from '../../components/DataTable';
import { baseInvestmentColumns } from './investmentColumns';

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Investment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sellTarget, setSellTarget] = useState<Investment | null>(null);
  const [isSelling, setIsSelling] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    investmentsApi
      .getAll()
      .then(setInvestments)
      .catch(() => setError('Failed to load investments'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (inv: Investment) => { setEditTarget(inv); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  const handleSubmit = async (data: InvestmentFormData) => {
    setIsSubmitting(true);
    try {
      if (editTarget) {
        await investmentsApi.update(editTarget.id, data);
      } else {
        await investmentsApi.create(data);
      }
      closeModal();
      load();
    } catch {
      // network errors bubble silently; form validation errors are shown in the modal
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this investment? All related transactions will also be deleted.')) return;
    setDeletingId(id);
    try {
      await investmentsApi.remove(id);
      setInvestments((prev) => prev.filter((i) => i.id !== id));
    } catch {
      alert('Failed to delete investment');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSell = async (data: { quantity: number; price: number; notes?: string }) => {
    if (!sellTarget) return;
    setIsSelling(true);
    try {
      await investmentsApi.sell(sellTarget.id, data);
      setSellTarget(null);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Failed to sell investment');
    } finally {
      setIsSelling(false);
    }
  };

  const columns = [
    ...baseInvestmentColumns,
    {
      key: 'actions',
      label: '',
      render: (inv: Investment) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSellTarget(inv)}
            disabled={inv.quantity <= 0}
            className="rounded px-2 py-1 text-xs font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Sell"
          >
            Sell
          </button>
          <button
            onClick={() => openEdit(inv)}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title="Edit"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => handleDelete(inv.id)}
            disabled={deletingId === inv.id}
            className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
            title="Delete"
          >
            {deletingId === inv.id ? (
              <LoadingSpinner size="sm" />
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Investments</h1>
          <p className="mt-0.5 text-sm text-gray-500">{investments.length} holdings in your portfolio</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Investment
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={investments}
        keyExtractor={(inv) => inv.id}
        loading={loading}
        emptyTitle="No investments yet"
        emptyDescription="Add your first investment to start tracking your portfolio."
        emptyAction={
          <button
            onClick={openAdd}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            Add Investment
          </button>
        }
      />

      <InvestmentModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        investment={editTarget}
        isSubmitting={isSubmitting}
      />

      <SellModal
        isOpen={!!sellTarget}
        onClose={() => setSellTarget(null)}
        onSubmit={handleSell}
        investment={sellTarget}
        isSubmitting={isSelling}
      />
    </div>
  );
}
