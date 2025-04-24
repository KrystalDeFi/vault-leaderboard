
import React from 'react';
import { cn } from '@/lib/utils';

interface ChainBadgeProps {
  chainName: string;
  chainLogo: string;
  className?: string;
}

const ChainBadge = ({ chainName, chainLogo, className }: ChainBadgeProps) => {
  return (
    <div className={cn('flex items-center gap-1.5 text-sm font-medium', className)}>
      <img 
        src={chainLogo} 
        alt={`${chainName} logo`} 
        className="w-4 h-4 rounded-full" 
      />
      <span>{chainName}</span>
    </div>
  );
};

export default ChainBadge;
