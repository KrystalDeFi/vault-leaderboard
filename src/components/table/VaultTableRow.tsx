
import React from 'react';
import { Vault } from '@/types/vault';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ChainBadge from '@/components/ChainBadge';
import RiskBadge from '@/components/RiskBadge';
import StrategyBadge from '@/components/StrategyBadge';
import TokenIcon from '@/components/TokenIcon';
import { formatNumber, formatPercentage, shortenAddress } from '@/services/api';

interface VaultTableRowProps {
  vault: Vault;
  onVaultClick: (vault: Vault) => void;
}

const VaultTableRow = ({ vault, onVaultClick }: VaultTableRowProps) => (
  <tr
    className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors"
    onClick={() => onVaultClick(vault)}
    style={{ minHeight: '60px' }}
  >
    <td className="px-5 py-3">
      <div className="text-base font-medium text-white">{vault.name}</div>
      <div className="text-sm text-white/60">{vault.totalUser} users</div>
    </td>
    <td className="px-5 py-3">
      <ChainBadge chainName={vault.chainName} chainLogo={vault.chainLogo} />
    </td>
    <td className="px-5 py-3">
      <TokenIcon token={vault.principalToken} size="sm" showSymbol={true} />
    </td>
    <td className="px-5 py-3 font-semibold text-base text-white">
      {formatPercentage(vault.apr)}
    </td>
    <td className="px-5 py-3 font-semibold text-base text-right text-white">
      {formatNumber(vault.tvl)}
    </td>
    <td className={cn(
      'px-5 py-3 font-semibold text-base text-right',
      vault.pnl >= 0 ? 'text-green-300' : 'text-red-300'
    )}>
      {vault.pnl >= 0 ? '+' : ''}{formatNumber(vault.pnl)}
    </td>
    <td className="px-5 py-3 text-right font-semibold text-base text-white">
      {formatNumber(vault.feeGenerated)}
    </td>
    <td className="px-5 py-3">
      <StrategyBadge 
        strategy={vault.rangeStrategyType} 
        className="bg-white/5 text-violet-300" 
      />
    </td>
    <td className="px-5 py-3">
      <RiskBadge 
        risk={vault.riskScore} 
        className="bg-white/5" 
        showIcon={false}
      />
    </td>
    <td className="px-5 py-3 font-medium text-white/60">
      {shortenAddress(vault.owner.address)}
    </td>
    <td className="px-5 py-3">
      <Button 
        size="sm"
        variant="outline"
        className={cn(
          'rounded-full border-white/10 hover:border-white/30 text-sm font-medium',
          !vault.allowDeposit && 'opacity-50 cursor-not-allowed'
        )}
        disabled={!vault.allowDeposit}
        onClick={(e) => {
          e.stopPropagation();
          if (vault.allowDeposit) {
            window.open(`https://defi.krystal.app/vaults/${vault.chainId}/${vault.vaultAddress}`, '_blank');
          }
        }}
      >
        {vault.allowDeposit ? 'Join' : 'Private'}
      </Button>
    </td>
  </tr>
);

export default VaultTableRow;
