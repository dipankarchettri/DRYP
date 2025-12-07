'use client';

import { Product } from '@/types/Product';
import React from 'react';
import { X } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  title: string;
  children: React.ReactNode;
  product?: Product;
  isSubmitting?: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, title, children, product, isSubmitting }) => {
  if (!isOpen) {
    return null;
  }

  const modalTitle = product ? 'Edit Product' : title;
  const saveButtonText = product ? 'Save Changes' : 'Save Product';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="flex flex-col min-h-screen items-center justify-center py-8 px-4">
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="border-b border-zinc-200 sticky top-0 z-10 bg-white px-8 py-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-black">{modalTitle}</h2>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-black transition-colors p-2"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          <div className="flex-grow overflow-y-auto px-8 py-8">
            {React.cloneElement(children as React.ReactElement<{ product?: Product }>, { product })}
          </div>
          <div className="border-t border-zinc-200 sticky bottom-0 z-10 bg-white px-8 py-6 flex justify-end items-center gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 text-base font-semibold text-zinc-700 hover:text-black transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="bg-black text-white px-8 py-3 rounded-lg font-semibold text-base hover:bg-zinc-800 transition-all disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : saveButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
