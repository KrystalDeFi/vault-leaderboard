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
}

const ITEMS_PER_PAGE = 10;

const VaultTable = ({ vaults, onVaultClick, sortOptions, onSortChange }: VaultTableProps) => {
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
              <th className="w-[200px] px-5 py-3 text-left font-medium text-sm text-white/60">Vault</th>
              <th className="w-[120px] px-5 py-3 text-left font-medium text-sm text-white/60">Chain</th>
              <th className="w-[120px] px-5 py-3 text-left font-medium text-sm text-white/60">Principal</th>
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
              <th className="w-[120px] px-5 py-3 text-left font-medium text-sm text-white/60">Strategy</th>
              <th className="w-[100px] px-5 py-3 text-center font-medium text-sm text-white/60">
                <SortHeader field={SortField.RISK} label="Risk" sortOptions={sortOptions} onSortChange={onSortChange} />
              </th>
              <th className="w-[140px] px-5 py-3 text-left font-medium text-sm text-white/60">Owner</th>
            </tr>
          </thead>
          <tbody>
            {paginatedVaults.map(vault => (
              <VaultTableRow 
                key={`${vault.chainId}-${vault.vaultAddress}`}
                vault={vault} 
                onVaultClick={onVaultClick} 
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
