
import React from 'react';
import { cn } from '@/lib/utils';
import { AlignHorizontalSpaceBetween, AlignVerticalSpaceBetween, HelpCircle } from 'lucide-react';

interface StrategyBadgeProps {
  strategy: string;
  className?: string;
}

const StrategyBadge = ({ strategy, className }: StrategyBadgeProps) => {
  const getStrategyInfo = () => {
    if (strategy.includes('NARROW')) {
      return {
        displayText: 'Narrow',
        Icon: AlignVerticalSpaceBetween,
        badgeClass: 'text-violet-300 bg-white/5'
      };
    } else if (strategy.includes('WIDE')) {
      return {
        displayText: 'Wide',
        Icon: AlignHorizontalSpaceBetween,
        badgeClass: 'text-blue-300 bg-white/5'
      };
    } else {
      return {
        displayText: 'Unset',
        Icon: HelpCircle,
        badgeClass: 'text-white/60 bg-white/5'
      };
    }
  };
  
  const { displayText, Icon, badgeClass } = getStrategyInfo();

  return (
    <div className={cn('inline-flex items-center gap-1 rounded-full', badgeClass, className)}>
      <Icon className="w-3.5 h-3.5" />
      <span>{displayText}</span>
    </div>
  );
};

export default StrategyBadge;
