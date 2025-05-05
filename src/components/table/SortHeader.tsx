import React from 'react';

import {
  ArrowDown,
  ArrowUp,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  SortField,
  SortOptions,
} from '@/types/vault';

interface SortHeaderProps {
  field: SortField;
  label: string;
  sortOptions: SortOptions;
  onSortChange: (field: SortField) => void;
}

const SortHeader = ({ field, label, sortOptions, onSortChange }: SortHeaderProps) => {
  const handleSort = () => {
    onSortChange(field);
  };

  return (
    <span
      className={cn(
        'flex items-center justify-end gap-2 w-full h-full font-medium text-xs text-[#999] uppercase cursor-pointer select-none',
      )}
      onClick={handleSort}
    >
      {label}
      {sortOptions.field === field && (
        sortOptions.direction === 'desc' ? 
          <ArrowUp className="w-3.5 h-3.5 opacity-60" /> : 
          <ArrowDown className="w-3.5 h-3.5 opacity-60" />
      )}
    </span>
  );
};

export default SortHeader;
