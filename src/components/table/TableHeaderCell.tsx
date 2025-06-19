import React from 'react';

import { cn } from '@/lib/utils';
import {
  SortField,
  SortOptions,
} from '@/types/vault';

import SortHeader from './SortHeader';

interface TableHeaderCellProps {
  field: SortField;
  label: string;
  sortOptions: SortOptions;
  onSortChange: (field: SortField) => void;
  width: string;
}

const TableHeaderCell = ({ field, label, sortOptions, onSortChange, width }: TableHeaderCellProps) => {
  return (
    <th className={cn(
      'px-4 py-3 text-xs uppercase',
      width,
      sortOptions.field === field ? 'text-white font-semibold' : 'text-[#999] font-semibold'
    )}>
      <SortHeader 
        field={field} 
        label={label} 
        sortOptions={sortOptions} 
        onSortChange={onSortChange} 
      />
    </th>
  );
};

export default TableHeaderCell; 