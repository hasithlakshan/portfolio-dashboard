import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { Investment } from '../../types';

const sellSchema = z.object({
  quantity: z.number({ error: 'Quantity is required' }).positive('Must be positive'),
  price: z.number({ error: 'Price is required' }).positive('Must be positive'),
  notes: z.string().optional(),
});

type SellFormData = z.infer<typeof sellSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SellFormData) => Promise<void>;
  investment: Investment | null;
  isSubmitting: boolean;
}

const fieldClass =
  'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';
const errorClass = 'mt-1 text-xs text-red-500';
const labelClass = 'block text-xs font-medium text-gray-600 mb-1';

export default function SellModal({ isOpen, onClose, onSubmit, investment, isSubmitting }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SellFormData>({
    resolver: zodResolver(sellSchema),
  });

  useEffect(() => {
    if (isOpen) reset({ price: investment?.currentPrice });
  }, [isOpen, investment, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sell Investment" size="lg">
      {investment && (
        <div className="mb-4 rounded-lg bg-gray-50 px-4 py-3">
          <p className="text-sm font-semibold text-gray-900">
            {investment.ticker}
            <span className="ml-2 font-normal text-gray-400">{investment.name}</span>
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            Available to sell: <span className="font-medium text-gray-700">{investment.quantity} units</span>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Quantity to Sell</label>
            <input
              {...register('quantity', { valueAsNumber: true })}
              type="number"
              step="any"
              placeholder={`Max ${investment?.quantity ?? 0}`}
              className={fieldClass}
            />
            {errors.quantity && <p className={errorClass}>{errors.quantity.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Sell Price (USD)</label>
            <input
              {...register('price', { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="0.00"
              className={fieldClass}
            />
            {errors.price && <p className={errorClass}>{errors.price.message}</p>}
          </div>

          <div className="col-span-2">
            <label className={labelClass}>Notes (optional)</label>
            <input
              {...register('notes')}
              placeholder="e.g. Taking profits"
              className={fieldClass}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-60 transition-colors"
          >
            {isSubmitting && <LoadingSpinner size="sm" />}
            Confirm Sell
          </button>
        </div>
      </form>
    </Modal>
  );
}
