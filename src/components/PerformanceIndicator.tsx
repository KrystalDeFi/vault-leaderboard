
import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PerformanceIndicatorProps {
  value: number;
  type: 'apr' | 'pnl';
  className?: string;
  isPercentage?: boolean;
}

const PerformanceIndicator = ({ value, type, className, isPercentage = true }: PerformanceIndicatorProps) => {
  const isPositive = value >= 0;
  
  const textColor = isPositive ? 'text-vaultscope-green' : 'text-vaultscope-red';
  const bgColor = isPositive ? 'bg-vaultscope-green/10' : 'bg-vaultscope-red/10';
  const Icon = isPositive ? TrendingUp : TrendingDown;
  
  const formattedValue = isPercentage 
    ? `${(Math.abs(value) * 100).toFixed(2)}%` 
    : `$${Math.abs(value).toFixed(2)}`;

  return (
    <div className={cn('flex items-center gap-1', textColor, className)}>
      <div className={cn('p-1 rounded-full', bgColor)}>
        <Icon className="w-3 h-3" />
      </div>
      <span className="font-medium font-inter">{formattedValue}</span>
    </div>
  );
};

export default PerformanceIndicator;
