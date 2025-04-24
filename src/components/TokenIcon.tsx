
import React from 'react';
import { cn } from '@/lib/utils';
import { Token } from '@/types/vault';

interface TokenIconProps {
  token: Token;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showSymbol?: boolean;
}

const TokenIcon = ({ token, size = 'md', className, showSymbol = false }: TokenIconProps) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  };

  return (
    <div className={cn('flex items-center', className)}>
      <div className="relative">
        <img
          src={token.logo || 'https://storage.googleapis.com/k-assets-prod.krystal.team/krystal/unknown-token.png'}
          alt={`${token.symbol} logo`}
          className={cn('rounded-full object-contain', sizeClasses[size])}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://storage.googleapis.com/k-assets-prod.krystal.team/krystal/unknown-token.png';
          }}
        />
      </div>
      {showSymbol && (
        <span className="ml-2 font-medium text-sm">{token.symbol}</span>
      )}
    </div>
  );
};

export default TokenIcon;
