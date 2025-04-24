
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { formatNumber, formatPercentage } from '@/services/api';
import TokenIcon from './TokenIcon';
import { Vault } from '@/types/vault';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AccessVaultCardProps {
  vault: Vault;
  onVaultClick: (chainId: number, address: string, event: React.MouseEvent) => void;
}

const AccessVaultCard = ({ vault, onVaultClick }: AccessVaultCardProps) => {
  return (
    <Card className="overflow-hidden transition-colors duration-200 hover:bg-secondary/50">
      <CardContent className="p-3">
        <button
          onClick={(e) => onVaultClick(vault.chainId, vault.vaultAddress, e)}
          className="flex flex-col text-left w-full group"
          aria-label={`View details for ${vault.name} vault`}
        >
          <div className="flex items-center gap-1.5 min-w-0 mb-1.5">
            <span className="truncate font-medium text-sm">{vault.name}</span>
            {vault.principalToken && (
              <TokenIcon token={vault.principalToken} size="sm" className="flex-shrink-0" />
            )}
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-auto" aria-hidden="true" />
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <span className="text-muted-foreground">TVL: {formatNumber(vault.tvl)}</span>
            <span className="text-muted-foreground">APR: {formatPercentage(vault.apr)}</span>
          </div>
        </button>
      </CardContent>
    </Card>
  );
};

export default AccessVaultCard;
