import React, { useState, useMemo, useEffect } from 'react';
import { BuilderMetrics, Vault, VaultType } from '@/types/vault';
import OwnerMetrics from '@/components/OwnerMetrics';
import { Skeleton } from '@/components/ui/skeleton';
import { HelpCircle, Share2, Zap } from 'lucide-react';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationPrevious, 
  PaginationNext, 
  PaginationEllipsis 
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

interface VaultBuildersTabProps {
  buildersMetrics: BuilderMetrics[];
  vaults: Vault[];
  loading: boolean;
}

const BUILDERS_PER_PAGE = 10;

const VaultBuildersTab: React.FC<VaultBuildersTabProps> = ({ buildersMetrics, vaults, loading }) => {
  const [vaultType, setVaultType] = useState<VaultType>("autofarm");
  const [sortField, setSortField] = useState<'tvl' | 'apr' | 'fees' | 'users'>('tvl');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset sort to TVL if "users" was selected when switching to Auto-Farms
  useEffect(() => {
    if (vaultType === 'autofarm' && sortField === 'users') {
      setSortField('tvl');
    }
  }, [vaultType, sortField]);

  // Filter vaults by type
  const filteredVaults = useMemo(() => {
    return vaults.filter(vault => {
      if (vaultType === 'autofarm') {
        return vault.isAutoFarmVault === true;
      }
      return vault.isAutoFarmVault !== true;
    });
  }, [vaults, vaultType]);

  // Compute builder metrics from filtered vaults (not from pre-computed buildersMetrics)
  const filteredBuilders = useMemo(() => {
    const builderMap = new Map<string, {
      owner: string;
      totalVaults: number;
      totalTVL: number;
      totalFeeGenerated: number;
      averageAPR: number;
      totalUsers: number;
      ownerInfo: typeof filteredVaults[0]['owner'];
      riskProfile: { LOW: number; MODERATE: number; HIGH: number; ELEVATED?: number };
      rangeStrategy: { WIDE_RANGE: number; NARROW_RANGE: number; UNSET: number };
      tvlStrategyType: { UNSET: number; LOW_TVL: number; MED_TVL: number; HIGH_TVL: number; WHITELISTED_POOLS: number };
      depositAllowedCount: number;
      principalTokens: string[];
    }>();

    filteredVaults.forEach(vault => {
      const ownerAddress = vault.owner.address;
      const existing = builderMap.get(ownerAddress);

      if (existing) {
        existing.totalVaults += 1;
        existing.totalTVL += vault.tvl || 0;
        existing.totalFeeGenerated += vault.feeGenerated || 0;
        existing.averageAPR = (existing.averageAPR * (existing.totalVaults - 1) + (vault.apr || 0)) / existing.totalVaults;
        existing.totalUsers += vault.totalUser || 0;
        if (vault.allowDeposit) existing.depositAllowedCount += 1;
        
        // Update risk profile
        const riskKey = vault.riskScore === 'MEDIUM' ? 'MODERATE' : vault.riskScore;
        if (riskKey in existing.riskProfile) {
          existing.riskProfile[riskKey as keyof typeof existing.riskProfile] = 
            (existing.riskProfile[riskKey as keyof typeof existing.riskProfile] || 0) + 1;
        }
        
        // Update range strategy
        if (vault.rangeStrategyType in existing.rangeStrategy) {
          existing.rangeStrategy[vault.rangeStrategyType as keyof typeof existing.rangeStrategy] += 1;
        } else {
          existing.rangeStrategy.UNSET += 1;
        }
        
        // Add principal token
        if (vault.principalToken?.symbol && !existing.principalTokens.includes(vault.principalToken.symbol)) {
          existing.principalTokens.push(vault.principalToken.symbol);
        }
      } else {
        const riskKey = vault.riskScore === 'MEDIUM' ? 'MODERATE' : vault.riskScore;
        builderMap.set(ownerAddress, {
          owner: ownerAddress,
          totalVaults: 1,
          totalTVL: vault.tvl || 0,
          totalFeeGenerated: vault.feeGenerated || 0,
          averageAPR: vault.apr || 0,
          totalUsers: vault.totalUser || 0,
          ownerInfo: vault.owner,
          riskProfile: {
            LOW: riskKey === 'LOW' ? 1 : 0,
            MODERATE: riskKey === 'MODERATE' ? 1 : 0,
            HIGH: riskKey === 'HIGH' ? 1 : 0,
            ELEVATED: riskKey === 'ELEVATED' ? 1 : 0,
          },
          rangeStrategy: {
            WIDE_RANGE: vault.rangeStrategyType === 'WIDE_RANGE' ? 1 : 0,
            NARROW_RANGE: vault.rangeStrategyType === 'NARROW_RANGE' ? 1 : 0,
            UNSET: !vault.rangeStrategyType || vault.rangeStrategyType === 'UNSET' ? 1 : 0,
          },
          tvlStrategyType: {
            UNSET: 0,
            LOW_TVL: 0,
            MED_TVL: 0,
            HIGH_TVL: 0,
            WHITELISTED_POOLS: 0,
          },
          depositAllowedCount: vault.allowDeposit ? 1 : 0,
          principalTokens: vault.principalToken?.symbol ? [vault.principalToken.symbol] : [],
        });
      }
    });

    return Array.from(builderMap.values());
  }, [filteredVaults]);

  const sortedBuilders = useMemo(() => {
    return [...filteredBuilders].sort((a, b) => {
      switch (sortField) {
        case 'tvl': return b.totalTVL - a.totalTVL;
        case 'apr': return b.averageAPR - a.averageAPR;
        case 'fees': return b.totalFeeGenerated - a.totalFeeGenerated;
        case 'users': return b.totalUsers - a.totalUsers;
        default: return b.totalTVL - a.totalTVL;
      }
    });
  }, [filteredBuilders, sortField]);

  const paginatedBuilders = useMemo(() => {
    const start = (currentPage - 1) * BUILDERS_PER_PAGE;
    const end = start + BUILDERS_PER_PAGE;
    return sortedBuilders.slice(start, end);
  }, [sortedBuilders, currentPage]);

  const totalPages = Math.ceil(filteredBuilders.length / BUILDERS_PER_PAGE);

  return (
    <section className="w-full max-w-5xl mx-auto py-8 px-4">
      {/* Vault Type Toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-[#0A0A0A] border border-[#1f1f1f] rounded-xl p-1 gap-1">
          <button
            onClick={() => setVaultType("autofarm")}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all
              ${vaultType === "autofarm"
                ? "bg-gradient-to-r from-[#22C55E] to-[#16A34A] text-white shadow-lg"
                : "text-[#999] hover:text-white hover:bg-[#1f1f1f]"
              }
            `}
          >
            <Zap className="w-4 h-4" />
            Auto-Farms
          </button>
          <button
            onClick={() => setVaultType("shared")}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all
              ${vaultType === "shared"
                ? "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-lg"
                : "text-[#999] hover:text-white hover:bg-[#1f1f1f]"
              }
            `}
          >
            <Share2 className="w-4 h-4" />
            Shared Vaults
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-2 mb-2">
        <select
          className="px-4 py-2.5 rounded-2xl border border-[#1f1f1f] bg-[rgba(255,255,255,0.02)] text-sm font-medium text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors focus:outline-none focus:ring-1 focus:ring-[rgba(255,255,255,0.1)]"
          value={sortField}
          onChange={e => setSortField(e.target.value as any)}
        >
          <option value="tvl">Sort by TVL</option>
          <option value="apr">Sort by APR</option>
          <option value="fees">Sort by Fees Generated</option>
          {vaultType !== 'autofarm' && <option value="users">Sort by Users</option>}
        </select>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl bg-[rgba(255,255,255,0.02)]" />
          ))}
        </div>
      ) : paginatedBuilders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-[#1f1f1f] bg-[rgba(255,255,255,0.02)]">
          <HelpCircle className="w-12 h-12 text-white/60 mb-4" />
          <h3 className="text-lg font-semibold text-white">No builders found</h3>
          <p className="text-white/60">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedBuilders.map((builder, index) => (
              <div 
                key={builder.owner}
                className="transition-all duration-200 hover:translate-y-[-1px]"
              >
                <OwnerMetrics
                  metrics={builder}
                  rank={(currentPage - 1) * BUILDERS_PER_PAGE + index + 1}
                  vaults={filteredVaults.filter(v => v.owner.address === builder.owner)}
                  isAutoFarm={vaultType === 'autofarm'}
                />
              </div>
            ))}
          </div>
          
          {!loading && paginatedBuilders.length > 0 && totalPages > 1 && (
            <Pagination className="justify-center mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={cn(
                      "cursor-pointer bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] border-[#1f1f1f] transition-colors",
                      currentPage === 1 && "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) pageNumber = i + 1;
                  else if (currentPage <= 3) pageNumber = i + 1;
                  else if (currentPage >= totalPages - 2) pageNumber = totalPages - 4 + i;
                  else pageNumber = currentPage - 2 + i;

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNumber)}
                        isActive={currentPage === pageNumber}
                        className={cn(
                          "cursor-pointer font-inter border border-[#1f1f1f]",
                          currentPage === pageNumber 
                            ? "bg-white text-black hover:bg-white/90" 
                            : "bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)]"
                        )}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis className="text-white/60" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => setCurrentPage(totalPages)}
                        className="cursor-pointer font-inter bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] border border-[#1f1f1f]"
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={cn(
                      "cursor-pointer bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] border-[#1f1f1f] transition-colors",
                      currentPage === totalPages && "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </section>
  );
};

export default VaultBuildersTab;
