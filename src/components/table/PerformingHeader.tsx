import React from 'react';

import {
  ArrowDown,
  ArrowUp,
} from 'lucide-react';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import {
  SortField,
  SortOptions,
} from '@/types/vault';

interface PerformingHeaderProps {
  field: SortField;
  label: string;
  helpText?: string;
  sortOptions: SortOptions;
  onSortChange: (field: SortField) => void;
}

const PerformingHeader = ({ field, label, helpText, sortOptions, onSortChange }: PerformingHeaderProps) => (
  <th className="text-right text-xs text-[#999] font-semibold uppercase pr-2">
    <div 
      className={cn(
        "flex items-center justify-end gap-1 cursor-pointer",
        sortOptions.field === field && "text-white"
      )}
      onClick={() => onSortChange(field)}
    >
      {label}
      {helpText && (
        <HoverCard>
          <HoverCardTrigger asChild>
            <span className="text-[#666] cursor-help">ⓘ</span>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 p-2 text-xs bg-[#18181b] border-[#222]">
            {helpText}
          </HoverCardContent>
        </HoverCard>
      )}
      {sortOptions.field === field && (
        sortOptions.direction === 'asc' ? 
          <ArrowUp className="w-3.5 h-3.5" /> : 
          <ArrowDown className="w-3.5 h-3.5" />
      )}
    </div>
  </th>
);

export default PerformingHeader;
