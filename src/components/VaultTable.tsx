import React, { useEffect } from 'react';

import {
  SortField,
  SortOptions,
  Vault,
} from '@/types/vault';

import SortHeader from './table/SortHeader';
import TablePagination from './table/TablePagination';
import VaultTableRow from './table/VaultTableRow';

interface VaultTableProps {
  vaults: Vault[];
  onVaultClick: (vault: Vault) => void;
  sortOptions: SortOptions;
  onSortChange: (field: SortField) => void;
  isAutoFarm?: boolean;
}

const ITEMS_PER_PAGE = 10;

const VaultTable = ({ vaults, onVaultClick, sortOptions, onSortChange, isAutoFarm = false }: VaultTableProps) => {
  const [currentPage, setCurrentPage] = React.useState(1);

  // Reset pagination when vaults data or sort options change
  useEffect(() => {
    setCurrentPage(1);
  }, [vaults, sortOptions.field, sortOptions.direction]);

  const paginatedVaults = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return vaults.slice(start, end);
  }, [vaults, currentPage]);

  const totalPages = React.useMemo(() => {
    return Math.ceil(vaults.length / ITEMS_PER_PAGE);
  }, [vaults.length]);

  return (
    <div className="space-y-4 max-w-[1200px] mx-auto font-inter">
      <div className="w-full overflow-x-auto scrollbar-dark rounded-xl border border-white/5 bg-white/[0.02]">
        <table className="w-full text-sm">
          <thead className="bg-[#121212]">
            <tr>
              <th className="w-[200px] px-5 py-3 text-left font-medium text-sm text-white/60">
                {isAutoFarm ? 'Auto-Farm' : 'Vault'}
              </th>
              <th className="w-[120px] px-5 py-3 text-left font-medium text-sm text-white/60">Chain</th>
              {!isAutoFarm && (
                <th className="w-[120px] px-5 py-3 text-left font-medium text-sm text-white/60">Principal</th>
              )}
              <th className="w-[100px] px-5 py-3 text-right font-medium text-sm text-white/60">
                <SortHeader field={SortField.APR} label="APR" sortOptions={sortOptions} onSortChange={onSortChange} />
              </th>
              <th className="w-[120px] px-5 py-3 text-right font-medium text-sm text-white/60">
                <SortHeader field={SortField.TVL} label="TVL" sortOptions={sortOptions} onSortChange={onSortChange} />
              </th>
              <th className="w-[120px] px-5 py-3 text-right font-medium text-sm text-white/60">
                <SortHeader field={SortField.PNL} label="PnL" sortOptions={sortOptions} onSortChange={onSortChange} />
              </th>
              <th className="w-[120px] px-5 py-3 text-right font-medium text-sm text-white/60">
                <SortHeader field={SortField.FEES} label="Fees" sortOptions={sortOptions} onSortChange={onSortChange} />
              </th>
              {isAutoFarm && (
                <th className="w-[140px] px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className={`text-sm font-medium ${sortOptions.field === SortField.DAILY_YIELD || sortOptions.field === SortField.DAILY_YIELD_PCT ? 'text-white' : 'text-white/60'}`}>
                      Daily Yield
                    </span>
                    <div className="flex bg-[#1a1a1a] rounded-md overflow-hidden ml-1">
                      <button
                        onClick={() => onSortChange(SortField.DAILY_YIELD)}
                        className={`px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                          sortOptions.field === SortField.DAILY_YIELD
                            ? 'bg-white text-black'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        $
                      </button>
                      <button
                        onClick={() => onSortChange(SortField.DAILY_YIELD_PCT)}
                        className={`px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                          sortOptions.field === SortField.DAILY_YIELD_PCT
                            ? 'bg-white text-black'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        %
                      </button>
                    </div>
                  </div>
                </th>
              )}
              {!isAutoFarm && (
                <th className="w-[120px] px-5 py-3 text-left font-medium text-sm text-white/60">Strategy</th>
              )}
              {!isAutoFarm && (
                <th className="w-[100px] px-5 py-3 text-center font-medium text-sm text-white/60">Risk</th>
              )}
              <th className="w-[140px] px-5 py-3 text-left font-medium text-sm text-white/60">Owner</th>
            </tr>
          </thead>
          <tbody>
            {paginatedVaults.map(vault => (
              <VaultTableRow 
                key={`${vault.chainId}-${vault.vaultAddress}`}
                vault={vault} 
                onVaultClick={onVaultClick}
                isAutoFarm={isAutoFarm}
              />
            ))}
          </tbody>
        </table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

export default VaultTable;
