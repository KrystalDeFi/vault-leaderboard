import React from 'react';

import { cn } from '@/lib/utils';

interface TableCellProps {
  children: React.ReactNode;
  width: string;
  className?: string;
}

const TableCell = ({ children, width, className }: TableCellProps) => {
  return (
    <td className={cn(
      'px-4 py-2 text-right font-medium',
      width,
      className
    )}>
      {children}
    </td>
  );
};

export default TableCell; 