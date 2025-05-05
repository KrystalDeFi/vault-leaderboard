import { useMemo } from 'react';

import {
  FilterOptions,
  SortField,
  SortOptions,
  Vault,
} from '@/types/vault';

export function useFilteredAndSortedVaults(
  vaults: Vault[],
  filterOptions: FilterOptions,
  sortOptions: SortOptions
) {
  // Memoize the filtering logic
  const filteredVaults = useMemo(() => {
    let filtered = [...vaults];

    // Chain filtering - ensure strict number comparison
    if (filterOptions.chainId !== null) {
      filtered = filtered.filter(v => {
        const vaultChainId = Number(v.chainId);
        const filterChainId = Number(filterOptions.chainId);
        return vaultChainId === filterChainId;
      });
    }

    // Apply other filters
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

    return filtered;
  }, [vaults, filterOptions]);

  // Memoize the sorting logic separately
  return useMemo(() => {
    // Create a new array for sorting to avoid mutation
    const sorted = [...filteredVaults].sort((a, b) => {
      if (sortOptions.field === SortField.RISK) {
        const riskOrder = { 'LOW': 1, 'MEDIUM': 2, 'ELEVATED': 3, 'HIGH': 4 };
        const riskA = riskOrder[a.riskScore] || 0;
        const riskB = riskOrder[b.riskScore] || 0;
        return sortOptions.direction === 'asc' ? riskA - riskB : riskB - riskA;
      }

      // Handle numeric fields
      let valueA: number;
      let valueB: number;

      switch (sortOptions.field) {
        case SortField.APR:
          valueA = a.apr || 0;
          valueB = b.apr || 0;
          break;
        case SortField.TVL:
          valueA = a.tvl || 0;
          valueB = b.tvl || 0;
          break;
        case SortField.PNL:
          valueA = a.pnl || 0;
          valueB = b.pnl || 0;
          break;
        case SortField.FEES:
          valueA = a.feeGenerated || 0;
          valueB = b.feeGenerated || 0;
          break;
        case SortField.USERS:
          valueA = a.totalUser || 0;
          valueB = b.totalUser || 0;
          break;
        default:
          valueA = a.apr || 0;
          valueB = b.apr || 0;
      }

      // Handle NaN, undefined, or null values
      if (isNaN(valueA)) valueA = 0;
      if (isNaN(valueB)) valueB = 0;

      return sortOptions.direction === 'asc' ? valueA - valueB : valueB - valueA;
    });

    return sorted;
  }, [filteredVaults, sortOptions.field, sortOptions.direction]);
}
