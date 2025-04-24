
import { useMemo } from 'react';
import { Vault, BuilderMetrics } from '@/types/vault';

export function useBuilderMetrics(vaults: Vault[]) {
  return useMemo(() => {
    const ownerMap = new Map<string, BuilderMetrics>();
    vaults.forEach(vault => {
      if (!ownerMap.has(vault.owner.address)) {
        ownerMap.set(vault.owner.address, {
          owner: vault.owner.address,
          totalVaults: 0,
          totalTVL: 0,
          totalFeeGenerated: 0,
          averageAPR: 0,
          riskProfile: { LOW: 0, MODERATE: 0, HIGH: 0, ELEVATED: 0 },
          rangeStrategy: { WIDE_RANGE: 0, NARROW_RANGE: 0, UNSET: 0 },
          tvlStrategyType: { UNSET: 0, LOW_TVL: 0, MED_TVL: 0, HIGH_TVL: 0, WHITELISTED_POOLS: 0 },
          depositAllowedCount: 0,
          totalUsers: 0,
          principalTokens: [],
          ownerInfo: vault.owner
        });
      }
      const metrics = ownerMap.get(vault.owner.address)!;
      metrics.totalVaults += 1;
      metrics.totalTVL += vault.tvl;
      metrics.totalFeeGenerated += vault.feeGenerated;
      // Risk
      if (vault.riskScore === 'ELEVATED') {
        metrics.riskProfile.ELEVATED = (metrics.riskProfile.ELEVATED || 0) + 1;
      } else if (vault.riskScore === 'MEDIUM') {
        metrics.riskProfile.MODERATE += 1;
      } else {
        metrics.riskProfile[vault.riskScore] += 1;
      }
      // Range & TVL strategies
      if (vault.rangeStrategyType) metrics.rangeStrategy[vault.rangeStrategyType] += 1;
      if (vault.allowDeposit && (!vault.tvlStrategyType || vault.tvlStrategyType === 'UNSET')) {
        metrics.tvlStrategyType.WHITELISTED_POOLS += 1;
      } else if (vault.tvlStrategyType) {
        metrics.tvlStrategyType[vault.tvlStrategyType] += 1;
      } else {
        metrics.tvlStrategyType.UNSET += 1;
      }
      if (vault.allowDeposit) metrics.depositAllowedCount += 1;
      metrics.totalUsers += vault.totalUser;
      if (vault.principalToken?.symbol && !metrics.principalTokens.includes(vault.principalToken.symbol)) {
        metrics.principalTokens.push(vault.principalToken.symbol);
      }
    });
    // Compute avg APR
    ownerMap.forEach(metrics => {
      if (metrics.totalVaults > 0) {
        const ownerVaults = vaults.filter(v => v.owner.address === metrics.owner);
        const totalAPR = ownerVaults.reduce((sum, v) => sum + v.apr, 0);
        metrics.averageAPR = totalAPR / metrics.totalVaults;
      }
    });
    return Array.from(ownerMap.values());
  }, [vaults]);
}
