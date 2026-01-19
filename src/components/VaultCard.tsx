import React from 'react';

import {
  Clock,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  calculateDaysAgo,
  formatNumber,
  formatPercentage,
  shortenAddress,
} from '@/services/api';
import { Vault } from '@/types/vault';

import ChainBadge from './ChainBadge';
import RiskBadge from './RiskBadge';
import StrategyBadge from './StrategyBadge';
import TokenIcon from './TokenIcon';

interface VaultCardProps {
  vault: Vault;
  onClick: (vault: Vault) => void;
  onJoinClick: (e: React.MouseEvent) => void;
  isAutoFarm?: boolean;
}

const VaultCard = ({ vault, onClick, onJoinClick, isAutoFarm = false }: VaultCardProps) => {
  const vaultUrl = `https://defi.krystal.app/vaults/${vault.chainId}/${vault.vaultAddress}`;

  return (
    <div 
      className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.03)] transition-all duration-200 p-5 space-y-3 cursor-pointer"
      onClick={() => window.open(vaultUrl, '_blank')}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-white truncate">{vault.name}</h3>
          <div className="flex items-center gap-2">
            <ChainBadge chainName={vault.chainName} chainLogo={vault.chainLogo} className="text-white/60" />
            <span className="text-xs font-medium text-white/60 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {calculateDaysAgo(vault.ageInSecond)}
            </span>
          </div>
        </div>
        {!isAutoFarm && <TokenIcon token={vault.principalToken} showSymbol={true} />}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/5 px-3 py-2">
          <div className="text-xs font-medium text-white/50 mb-1">APR</div>
          <div className="text-sm font-semibold text-white">
            {formatPercentage(vault.apr)}
          </div>
        </div>
        <div className="rounded-xl bg-white/5 px-3 py-2">
          <div className="text-xs font-medium text-white/50 mb-1">TVL</div>
          <div className="text-sm font-semibold text-white">
            {formatNumber(vault.tvl)}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs font-medium text-white/50 mb-1">PnL</div>
          <div className={`text-sm font-semibold ${vault.pnl >= 0 ? 'text-green-200' : 'text-red-200'}`}>
            {vault.pnl >= 0 ? '+' : ''}{formatNumber(vault.pnl)}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-white/50 mb-1">Fees Generated</div>
          <div className="text-sm font-semibold text-white">
            {formatNumber(vault.feeGenerated)}
          </div>
        </div>
      </div>

      {/* Daily Yield for Auto-Farms */}
      {isAutoFarm && (
        <div className="rounded-xl bg-white/5 px-3 py-2">
          <div className="text-xs font-medium text-white/50 mb-1">Daily Yield</div>
          <div className="text-sm font-semibold text-white">
            {formatNumber(vault.earning24h || 0)}
          </div>
          <div className="text-xs text-[#999]">
            ~{vault.tvl > 0 ? ((vault.earning24h || 0) / vault.tvl * 100).toFixed(3) : '0.000'}%
          </div>
        </div>
      )}

      {/* Risk & Strategy Tags */}
      {!isAutoFarm && (
        <div className="flex flex-wrap gap-2">
          <RiskBadge risk={vault.riskScore} className="text-xs font-medium px-3 py-[2px]" />
          <StrategyBadge strategy={vault.rangeStrategyType} className="text-xs font-medium px-3 py-[2px]" />
        </div>
      )}

      {/* Owner & Users */}
      <div className="space-y-1">
        <div className="text-sm text-white/60">
          {shortenAddress(vault.ownerAddress)}
        </div>
        <div className="flex items-center gap-1 text-sm text-white/60">
          <Users className="w-3.5 h-3.5" />
          <span>{vault.totalUser} users</span>
        </div>
      </div>

      {/* Action Button */}
      {!isAutoFarm && (
        <div>
          <Button 
            className="w-full rounded-full border border-white/10 px-4 py-1 text-sm font-medium text-white/90 hover:border-white/30 hover:text-white bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!vault.allowDeposit}
            onClick={(e) => {
              e.stopPropagation();
              window.open(vaultUrl, '_blank');
            }}
          >
            {vault.allowDeposit ? 'Join' : 'Private'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default VaultCard;
