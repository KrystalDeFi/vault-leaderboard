import React, { useState, useMemo } from 'react';
import { BuilderMetrics, Vault } from '@/types/vault';
import OwnerMetrics from '@/components/OwnerMetrics';
import { Skeleton } from '@/components/ui/skeleton';
import { HelpCircle } from 'lucide-react';
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
  const [sortField, setSortField] = useState<'tvl' | 'apr' | 'fees' | 'users'>('tvl');
  const [currentPage, setCurrentPage] = useState(1);

  const sortedBuilders = useMemo(() => {
    return [...buildersMetrics].sort((a, b) => {
      switch (sortField) {
        case 'tvl': return b.totalTVL - a.totalTVL;
        case 'apr': return b.averageAPR - a.averageAPR;
        case 'fees': return b.totalFeeGenerated - a.totalFeeGenerated;
        case 'users': return b.totalUsers - a.totalUsers;
        default: return b.totalTVL - a.totalTVL;
      }
    });
  }, [buildersMetrics, sortField]);

  const paginatedBuilders = useMemo(() => {
    const start = (currentPage - 1) * BUILDERS_PER_PAGE;
    const end = start + BUILDERS_PER_PAGE;
    return sortedBuilders.slice(start, end);
  }, [sortedBuilders, currentPage]);

  const totalPages = Math.ceil(buildersMetrics.length / BUILDERS_PER_PAGE);

  return (
    <section className="w-full max-w-5xl mx-auto py-8 px-4">
      <div className="flex justify-end gap-2 mb-2">
        <select
          className="px-4 py-2.5 rounded-2xl border border-[#1f1f1f] bg-[rgba(255,255,255,0.02)] text-sm font-medium text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors focus:outline-none focus:ring-1 focus:ring-[rgba(255,255,255,0.1)]"
          value={sortField}
          onChange={e => setSortField(e.target.value as any)}
        >
          <option value="tvl">Sort by TVL</option>
          <option value="apr">Sort by APR</option>
          <option value="fees">Sort by Fees Generated</option>
          <option value="users">Sort by Users</option>
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
                  vaults={vaults.filter(v => v.owner.address === builder.owner)}
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
