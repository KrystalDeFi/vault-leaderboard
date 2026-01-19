import React from 'react';

import ChainBadge from '@/components/ChainBadge';
import RiskBadge from '@/components/RiskBadge';
import StrategyBadge from '@/components/StrategyBadge';
import TokenIcon from '@/components/TokenIcon';
import { cn } from '@/lib/utils';
import {
  formatNumber,
  formatPercentage,
  shortenAddress,
} from '@/services/api';
import { Vault } from '@/types/vault';

interface VaultTableRowProps {
  vault: Vault;
  onVaultClick: (vault: Vault) => void;
  isAutoFarm?: boolean;
}

const VaultTableRow = ({ vault, onVaultClick, isAutoFarm = false }: VaultTableRowProps) => {
  const vaultUrl = `https://defi.krystal.app/vaults/${vault.chainId}/${vault.vaultAddress}`;

  return (
    <tr
      className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors"
      onClick={() => window.open(vaultUrl, '_blank')}
      style={{ minHeight: '60px' }}
    >
      <td className="w-[200px] px-5 py-3">
        <div className="text-base font-medium text-white">{vault.name}</div>
        <div className="text-sm text-white/60">{vault.totalUser} users</div>
      </td>
      <td className="w-[120px] px-5 py-3">
        <ChainBadge chainName={vault.chainName} chainLogo={vault.chainLogo} />
      </td>
      {!isAutoFarm && (
        <td className="w-[120px] px-5 py-3">
          <TokenIcon token={vault.principalToken} size="sm" showSymbol={true} />
        </td>
      )}
      <td className="w-[100px] px-5 py-3 text-right font-semibold text-base text-white">
        {formatPercentage(vault.apr)}
      </td>
      <td className="w-[120px] px-5 py-3 text-right font-semibold text-base text-white">
        {formatNumber(vault.tvl)}
      </td>
      <td className={cn(
        'w-[120px] px-5 py-3 text-right font-semibold text-base',
        vault.pnl >= 0 ? 'text-green-300' : 'text-red-300'
      )}>
        {vault.pnl >= 0 ? '+' : ''}{formatNumber(vault.pnl)}
      </td>
      <td className="w-[120px] px-5 py-3 text-right font-semibold text-base text-white">
        {formatNumber(vault.feeGenerated)}
      </td>
      {isAutoFarm && (
        <td className="w-[120px] px-5 py-3 text-right">
          <div className="font-semibold text-base text-white">{formatNumber(vault.earning24h || 0)}</div>
          <div className="text-xs text-[#999]">
            ~{vault.tvl > 0 ? ((vault.earning24h || 0) / vault.tvl * 100).toFixed(3) : '0.000'}%
          </div>
        </td>
      )}
      {!isAutoFarm && (
        <td className="w-[120px] px-5 py-3">
          <StrategyBadge 
            strategy={vault.rangeStrategyType} 
            className="bg-white/5 text-violet-300" 
          />
        </td>
      )}
      {!isAutoFarm && (
        <td className="w-[100px] px-5 py-3 text-center">
          <RiskBadge 
            risk={vault.riskScore} 
            className="bg-white/5" 
            showIcon={false}
          />
        </td>
      )}
      <td className="w-[140px] px-5 py-3 font-medium text-white/60">
        {shortenAddress(vault.owner.address)}
      </td>
    </tr>
  );
};

export default VaultTableRow;
