
import React from 'react';
import { cn } from '@/lib/utils';
import { AlertOctagon, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';

interface RiskBadgeProps {
  risk: 'LOW' | 'MEDIUM' | 'ELEVATED' | 'HIGH';
  className?: string;
  showIcon?: boolean;
}

const RiskBadge = ({ risk, className, showIcon = true }: RiskBadgeProps) => {
  let badgeClass = '';
  let Icon = AlertCircle;
  
  switch (risk) {
    case 'LOW':
      badgeClass = 'text-green-200 bg-white/5';
      Icon = AlertCircle;
      break;
    case 'MEDIUM':
      badgeClass = 'text-yellow-200 bg-white/5';
      Icon = AlertTriangle;
      break;
    case 'ELEVATED':
      badgeClass = 'text-yellow-200 bg-white/5';
      Icon = ShieldAlert;
      break;
    case 'HIGH':
      badgeClass = 'text-red-200 bg-white/5';
      Icon = AlertOctagon;
      break;
  }

  return (
    <div className={cn('inline-flex items-center gap-1 rounded-full', badgeClass, className)}>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{risk.charAt(0) + risk.slice(1).toLowerCase()}</span>
    </div>
  );
};

export default RiskBadge;
