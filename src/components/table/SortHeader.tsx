
import React from 'react';
import { SortField, SortOptions } from '@/types/vault';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <th
      className={cn(
        'px-4 py-3 text-right font-medium text-xs text-[#999] uppercase cursor-pointer hover:bg-white/5 transition-colors',
        sortOptions.field === field && 'bg-white/5'
      )}
      onClick={handleSort}
    >
      <div className="flex items-center justify-end gap-2">
        {label}
        {sortOptions.field === field && (
          sortOptions.direction === 'desc' ? 
            <ArrowUp className="w-3.5 h-3.5 opacity-60" /> : 
            <ArrowDown className="w-3.5 h-3.5 opacity-60" />
        )}
      </div>
    </th>
  );
};

export default SortHeader;
