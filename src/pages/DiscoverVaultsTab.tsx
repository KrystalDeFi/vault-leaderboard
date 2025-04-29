import React, { useState } from 'react';

import { HelpCircle } from 'lucide-react';

import FilterBar from '@/components/FilterBar';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import VaultCard from '@/components/VaultCard';
import VaultTable from '@/components/VaultTable';
import { useFilteredAndSortedVaults } from '@/hooks/useVaultData';
import { cn } from '@/lib/utils';
import {
  FilterOptions,
  SortField,
  SortOptions,
  Vault,
} from '@/types/vault';

const CARDS_PER_PAGE = 9;

interface DiscoverVaultsTabProps {
  vaults: Vault[];
  loading: boolean;
}

const DiscoverVaultsTab: React.FC<DiscoverVaultsTabProps> = ({ vaults, loading }) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    principalToken: null,
    riskLevel: null,
    minAPR: null,
    maxAPR: null,
    tvlRange: null,
    rangeStrategy: null,
    allowDeposit: null,
    search: '',
    chainId: null,
  });
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: SortField.TVL,
    direction: 'desc',
  });
  const [cardsCurrentPage, setCardsCurrentPage] = useState<number>(1);

  const handleFilterOptionsChange = (newFilters: FilterOptions) => {
    setFilterOptions(newFilters);
  };

  const filteredVaults = useFilteredAndSortedVaults(vaults, filterOptions, sortOptions);

  const paginatedVaultsForCards = React.useMemo(() => {
    const start = (cardsCurrentPage - 1) * CARDS_PER_PAGE;
    const end = start + CARDS_PER_PAGE;
    return filteredVaults.slice(start, end);
  }, [filteredVaults, cardsCurrentPage]);

  const totalPagesCards = Math.ceil(filteredVaults.length / CARDS_PER_PAGE);

  const handleVaultClick = (vault: Vault) => {
    window.open(`/vault/${vault.chainId}/${vault.vaultAddress}`, '_blank');
  };

  const handleJoinClick = (vault: Vault, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`/vault/${vault.chainId}/${vault.vaultAddress}/join`, '_blank');
  };

  return (
    <div className="font-inter max-w-[1200px] mx-auto min-h-[calc(100vh-200px)] flex flex-col">
      <FilterBar
        filterOptions={filterOptions}
        onFilterChange={handleFilterOptionsChange}
        className="mx-auto max-w-2xl w-full mb-8"
      />
      
      <div className="flex justify-end mb-4">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'cards' | 'table')}>
          <TabsList className="bg-[#121212] border border-[rgba(255,255,255,0.05)]">
            <TabsTrigger value="cards" className="text-[14px] data-[state=active]:bg-[rgba(255,255,255,0.05)] data-[state=active]:text-white">Cards</TabsTrigger>
            <TabsTrigger value="table" className="text-[14px] data-[state=active]:bg-[rgba(255,255,255,0.05)] data-[state=active]:text-white">Table</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="flex-1 overflow-auto">
        {loading ? (
          viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="vault-card">
                  <div className="p-5 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-[rgba(255,255,255,0.05)] bg-[#0D0D0D] rounded-xl">
              <Skeleton className="h-64 w-full bg-[#121212] opacity-30" />
            </div>
          )
        ) : filteredVaults.length === 0 ? (
          <div className="text-center py-16 bg-[#0D0D0D] rounded-xl border border-[rgba(255,255,255,0.05)]">
            <HelpCircle className="mx-auto h-12 w-12 text-[rgba(255,255,255,0.5)] mb-4" />
            <h3 className="text-lg font-semibold text-white">No vaults found</h3>
            <p className="text-[rgba(255,255,255,0.6)]">Try adjusting your filters</p>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedVaultsForCards.map((vault) => (
                <VaultCard
                  key={`${vault.chainId}-${vault.vaultAddress}`}
                  vault={vault}
                  onClick={() => handleVaultClick(vault)}
                  onJoinClick={(e) => handleJoinClick(vault, e)}
                />
              ))}
            </div>
            {totalPagesCards > 1 && (
              <Pagination className="justify-center">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCardsCurrentPage(prev => Math.max(1, prev - 1))}
                      className={cn(
                        "cursor-pointer",
                        cardsCurrentPage === 1 && "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPagesCards) }, (_, i) => {
                    let pageNumber;
                    if (totalPagesCards <= 5) pageNumber = i + 1;
                    else if (cardsCurrentPage <= 3) pageNumber = i + 1;
                    else if (cardsCurrentPage >= totalPagesCards - 2) pageNumber = totalPagesCards - 4 + i;
                    else pageNumber = cardsCurrentPage - 2 + i;

                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => setCardsCurrentPage(pageNumber)}
                          isActive={cardsCurrentPage === pageNumber}
                          className="cursor-pointer"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  {totalPagesCards > 5 && cardsCurrentPage < totalPagesCards - 2 && (
                    <>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCardsCurrentPage(totalPagesCards)}
                          className="cursor-pointer"
                        >
                          {totalPagesCards}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCardsCurrentPage(prev => Math.min(totalPagesCards, prev + 1))}
                      className={cn(
                        "cursor-pointer",
                        cardsCurrentPage === totalPagesCards && "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        ) : (
          <VaultTable
            key={viewMode}
            vaults={filteredVaults}
            onVaultClick={handleVaultClick}
            sortOptions={sortOptions}
            onSortChange={(field) =>
              setSortOptions(prev => ({
                field,
                direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
              }))
            }
          />
        )}
      </div>
    </div>
  );
};

export default DiscoverVaultsTab;
