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
  className?: string;
}

const SortHeader = ({ field, label, sortOptions, onSortChange, className }: SortHeaderProps) => {
  const handleSort = () => {
    onSortChange(field);
  };

  return (
    <span
      className={cn(
        'flex items-center justify-end gap-1 w-full h-full cursor-pointer select-none',
        className
      )}
      onClick={handleSort}
    >
      <span className="truncate">{label}</span>
      {sortOptions.field === field && (
        sortOptions.direction === 'asc' ? 
          <ArrowUp className="w-3.5 h-3.5 opacity-60 flex-shrink-0" /> : 
          <ArrowDown className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
      )}
    </span>
  );
};

export default SortHeader;
