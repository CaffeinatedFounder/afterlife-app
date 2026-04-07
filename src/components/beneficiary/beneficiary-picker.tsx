'use client';

import { useState, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Beneficiary } from '@/types';

interface BeneficiaryPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (beneficiaryIds: string[]) => void;
  beneficiaries: Beneficiary[];
  selectedIds?: string[];
  allowMultiple?: boolean;
  title?: string;
  description?: string;
}

export function BeneficiaryPicker({
  isOpen,
  onClose,
  onSelect,
  beneficiaries,
  selectedIds = [],
  allowMultiple = true,
  title = 'Select Beneficiary',
  description = 'Choose who to share with or assign assets to',
}: BeneficiaryPickerProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds));
  const [selectAll, setSelectAll] = useState(false);

  // Update selected when selectedIds changes
  useEffect(() => {
    setSelected(new Set(selectedIds));
    setSelectAll(selectedIds.length === beneficiaries.length && beneficiaries.length > 0);
  }, [selectedIds, beneficiaries.length]);

  // Filter beneficiaries based on search
  const filteredBeneficiaries = beneficiaries.filter((b) => {
    const query = search.toLowerCase();
    return b.name.toLowerCase().includes(query) || b.relation.toLowerCase().includes(query);
  });

  const handleToggle = (id: string) => {
    if (!allowMultiple) {
      setSelected(new Set([id]));
      return;
    }

    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
    setSelectAll(newSelected.size === beneficiaries.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected(new Set());
      setSelectAll(false);
    } else {
      setSelected(new Set(beneficiaries.map((b) => b.id)));
      setSelectAll(true);
    }
  };

  const handleConfirm = () => {
    onSelect(Array.from(selected));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-0.5">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 flex flex-col">
          {/* Search Bar */}
          <div className="p-4 sm:p-6 pb-4 flex-shrink-0 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search beneficiaries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-900 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Select All Option (only for multiple select) */}
          {allowMultiple && beneficiaries.length > 1 && (
            <div className="px-4 sm:px-6 pt-2 pb-2 flex-shrink-0">
              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="h-5 w-5 rounded border-gray-300 text-purple-900 focus:ring-2 focus:ring-purple-900"
                />
                <span className="font-medium text-gray-900">Select All</span>
              </label>
            </div>
          )}

          {/* Beneficiaries List */}
          <div className="px-2 sm:px-4 py-2 flex-1 overflow-y-auto">
            {filteredBeneficiaries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-gray-600">No beneficiaries found</p>
                {search && (
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your search</p>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredBeneficiaries.map((beneficiary) => (
                  <label
                    key={beneficiary.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                  >
                    <input
                      type={allowMultiple ? 'checkbox' : 'radio'}
                      name="beneficiary"
                      checked={selected.has(beneficiary.id)}
                      onChange={() => handleToggle(beneficiary.id)}
                      className="h-5 w-5 rounded border-gray-300 text-purple-900 focus:ring-2 focus:ring-purple-900"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {beneficiary.name}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {beneficiary.relation}
                        {beneficiary.is_minor ? ' • Minor' : ''}
                      </p>
                    </div>
                    {selected.has(beneficiary.id) && (
                      <Check className="h-5 w-5 text-purple-900 flex-shrink-0" />
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 sm:p-6 border-t border-gray-100 flex-shrink-0 bg-gray-50">
          <Button
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            onClick={handleConfirm}
            disabled={selected.size === 0}
          >
            {allowMultiple
              ? `Select (${selected.size})`
              : selected.size === 0
                ? 'Select'
                : 'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  );
}
