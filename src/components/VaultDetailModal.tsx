
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Vault, TokenWithBalance } from '@/types/vault';
import { formatNumber, formatPercentage, calculateDaysAgo } from '@/services/api';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import ChainBadge from './ChainBadge';
import RiskBadge from './RiskBadge';
import StrategyBadge from './StrategyBadge';
import TokenIcon from './TokenIcon';
import { ExternalLink, Clock, Users, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VaultDetailModalProps {
  vault: Vault | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VaultDetailModal = ({ vault, open, onOpenChange }: VaultDetailModalProps) => {
  if (!vault) return null;

  const handleJoinClick = () => {
    if (vault.allowDeposit) {
      window.open(`https://app.krystal.app/vault/${vault.vaultAddress}`, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl">{vault.name}</DialogTitle>
            <ChainBadge chainName={vault.chainName} chainLogo={vault.chainLogo} />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            {calculateDaysAgo(vault.ageInSecond)}
            <Users className="w-4 h-4 ml-2" />
            {vault.totalUser} users
          </div>
        </DialogHeader>

        {/* Primary Stats */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <div className="text-sm text-muted-foreground mb-1">TVL</div>
            <div className="text-2xl font-bold">{formatNumber(vault.tvl)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">APR</div>
            <div className="text-2xl font-bold text-vaultscope-purple">{formatPercentage(vault.apr)}</div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <div className="text-sm text-muted-foreground mb-1">PnL</div>
            <div className={`text-lg font-semibold ${vault.pnl >= 0 ? 'text-vaultscope-green' : 'text-vaultscope-red'}`}>
              {vault.pnl >= 0 ? '+' : ''}{formatNumber(vault.pnl)}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Fees Generated</div>
            <div className="text-lg font-semibold">{formatNumber(vault.feeGenerated)}</div>
          </div>
        </div>

        {/* Strategy & Risk */}
        <div className="flex flex-wrap gap-2 mb-6">
          <StrategyBadge strategy={vault.rangeStrategyType} />
          <RiskBadge risk={vault.riskScore} />
          <div className="ml-auto flex items-center">
            <span className="text-sm font-medium mr-2">Principal Token:</span>
            <TokenIcon token={vault.principalToken} size="sm" showSymbol={true} />
          </div>
        </div>

        <Separator className="my-4" />
        
        {/* Portfolio Breakdown */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Portfolio Breakdown</h3>
          <div className="space-y-3">
            {vault.assets.map((asset, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TokenIcon token={asset.token} size="sm" />
                  <div>
                    <div className="font-medium text-sm">{asset.token.symbol}</div>
                    <div className="text-xs text-muted-foreground">{asset.tokenType.replace('_', ' ')}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatNumber(asset.quotes.usd.value)}</div>
                  <div className="text-xs text-muted-foreground">{(asset.percentage * 100).toFixed(2)}%</div>
                </div>
                <div className="w-[100px]">
                  <Progress value={asset.percentage * 100} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-4" />
        
        {/* Supported Pools */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Supported Pools ({vault.pools.length})</h3>
          <div className="space-y-3">
            {vault.pools.map((pool, index) => (
              <div key={index} className="bg-secondary/50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <img src={pool.projectLogo} alt={pool.project} className="w-5 h-5 rounded-full" />
                    <span className="font-medium text-sm">{pool.project}</span>
                  </div>
                  <div className="text-xs bg-secondary px-2 py-1 rounded font-medium">
                    Fee: {(pool.fee * 100).toFixed(2)}%
                  </div>
                </div>
                <div className="flex gap-2 mt-1">
                  {pool.tokens.map((token, i) => (
                    <TokenIcon key={i} token={token.token} size="sm" />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Pool TVL: {formatNumber(pool.tvl)}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <DialogFooter>
          <Button
            onClick={() => window.open(`https://explorer.krystal.app/base/vault/${vault.vaultAddress}`, '_blank')}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View on Explorer
          </Button>
          <Button 
            onClick={handleJoinClick}
            disabled={!vault.allowDeposit}
            className={cn(
              'gap-1',
              !vault.allowDeposit && 'opacity-50 cursor-not-allowed'
            )}
          >
            {vault.allowDeposit ? 'Join Vault' : 'Deposit Closed'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VaultDetailModal;
