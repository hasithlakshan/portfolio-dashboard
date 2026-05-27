import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { investmentSchema, type InvestmentFormData } from './investmentSchema';
import type { Investment } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InvestmentFormData) => Promise<void>;
  investment?: Investment | null;
  isSubmitting: boolean;
}

const fieldClass =
  'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';
const errorClass = 'mt-1 text-xs text-red-500';
const labelClass = 'block text-xs font-medium text-gray-600 mb-1';

export default function InvestmentModal({ isOpen, onClose, onSubmit, investment, isSubmitting }: Props) {
  const isEdit = !!investment;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        investment
          ? {
              name: investment.name,
              ticker: investment.ticker,
              category: investment.category,
              quantity: investment.quantity,
              purchasePrice: investment.purchasePrice,
              currentPrice: investment.currentPrice,
              purchasedAt: investment.purchasedAt.split('T')[0],
            }
          : { purchasedAt: new Date().toISOString().split('T')[0] },
      );
    }
  }, [isOpen, investment, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Investment' : 'Add Investment'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelClass}>Investment Name</label>
            <input {...register('name')} placeholder="e.g. Apple Inc." className={fieldClass} />
            {errors.name && <p className={errorClass}>{errors.name.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Ticker Symbol</label>
            <input {...register('ticker')} placeholder="AAPL" className={fieldClass} />
            {errors.ticker && <p className={errorClass}>{errors.ticker.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Category</label>
            <select {...register('category')} className={fieldClass}>
              <option value="">Select...</option>
              <option value="STOCK">Stock</option>
              <option value="BOND">Bond</option>
              <option value="MUTUAL_FUND">Mutual Fund</option>
            </select>
            {errors.category && <p className={errorClass}>{errors.category.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Quantity</label>
            <input {...register('quantity', { valueAsNumber: true })} type="number" step="any" placeholder="0" className={fieldClass} />
            {errors.quantity && <p className={errorClass}>{errors.quantity.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Purchase Price (USD)</label>
            <input {...register('purchasePrice', { valueAsNumber: true })} type="number" step="0.01" placeholder="0.00" className={fieldClass} />
            {errors.purchasePrice && <p className={errorClass}>{errors.purchasePrice.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Current Price (USD)</label>
            <input {...register('currentPrice', { valueAsNumber: true })} type="number" step="0.01" placeholder="0.00" className={fieldClass} />
            {errors.currentPrice && <p className={errorClass}>{errors.currentPrice.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Purchase Date</label>
            <input {...register('purchasedAt')} type="date" className={fieldClass} />
            {errors.purchasedAt && <p className={errorClass}>{errors.purchasedAt.message}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60 transition-colors"
          >
            {isSubmitting && <LoadingSpinner size="sm" />}
            {isEdit ? 'Save Changes' : 'Add Investment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
