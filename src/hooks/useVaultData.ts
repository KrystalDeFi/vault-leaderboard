
import { useMemo } from 'react';
import { Vault, FilterOptions, SortOptions, SortField } from '@/types/vault';

export function useFilteredAndSortedVaults(
  vaults: Vault[],
  filterOptions: FilterOptions,
  sortOptions: SortOptions
) {
  return useMemo(() => {
    let filtered = [...vaults];

    if (filterOptions.principalToken) {
      filtered = filtered.filter(v => v.principalToken?.symbol === filterOptions.principalToken);
    }

    if (filterOptions.riskLevel) {
      filtered = filtered.filter(v => v.riskScore === filterOptions.riskLevel);
    }

    if (filterOptions.minAPR !== null) {
      filtered = filtered.filter(v => v.apr >= (filterOptions.minAPR || 0));
    }

    if (filterOptions.tvlRange) {
      switch (filterOptions.tvlRange) {
        case 'low':
          filtered = filtered.filter(v => v.tvl < 10000);
          break;
        case 'medium':
          filtered = filtered.filter(v => v.tvl >= 10000 && v.tvl <= 100000);
          break;
        case 'high':
          filtered = filtered.filter(v => v.tvl > 100000);
          break;
      }
    }

    if (filterOptions.rangeStrategy) {
      filtered = filtered.filter(v => v.rangeStrategyType === filterOptions.rangeStrategy);
    }

    if (filterOptions.allowDeposit) {
      filtered = filtered.filter(v => v.allowDeposit);
    }

    if (filterOptions.search) {
      const searchLower = filterOptions.search.toLowerCase();
      filtered = filtered.filter(v =>
        v.name.toLowerCase().includes(searchLower) ||
        v.principalToken?.symbol.toLowerCase().includes(searchLower) ||
        v.pools.some(p => p.project.toLowerCase().includes(searchLower))
      );
    }

    if (sortOptions.field === SortField.RISK) {
      const riskOrder = { 'LOW': 1, 'MEDIUM': 2, 'ELEVATED': 3, 'HIGH': 4 };
      filtered.sort((a, b) => {
        const riskA = riskOrder[a.riskScore];
        const riskB = riskOrder[b.riskScore];
        return sortOptions.direction === 'asc' ? riskA - riskB : riskB - riskA;
      });
    } else {
      filtered.sort((a, b) => {
        let valueA, valueB;
        switch (sortOptions.field) {
          case SortField.APR:
            valueA = a.apr;
            valueB = b.apr;
            break;
          case SortField.TVL:
            valueA = a.tvl;
            valueB = b.tvl;
            break;
          case SortField.PNL:
            valueA = a.pnl;
            valueB = b.pnl;
            break;
          case SortField.FEES:
            valueA = a.feeGenerated;
            valueB = b.feeGenerated;
            break;
          default:
            valueA = a.apr;
            valueB = b.apr;
        }
        return sortOptions.direction === 'asc' ? valueA - valueB : valueB - valueA;
      });
    }

    return filtered;
  }, [vaults, filterOptions, sortOptions]);
}
