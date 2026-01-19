import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Share2,
  Trophy,
  Twitter,
  Zap,
} from 'lucide-react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useMigratedVaults } from '@/hooks/useMigratedVaults';
import { useFilteredAndSortedVaults } from '@/hooks/useVaultData';
import {
  formatNumber,
  shortenAddress,
} from '@/services/api';
import {
  FilterOptions,
  SortField,
  SortOptions,
  Vault,
  VaultType,
} from '@/types/vault';

import ChainBadge from './ChainBadge';
import PerformingHeader from './table/PerformingHeader';
import SortHeader from './table/SortHeader';
import TablePagination from './table/TablePagination';

interface WeeklyLeaderboardProps {
  vaults: Vault[];
  loading: boolean;
}

const COLUMN_HELP = {
  fees: "Total Vault/Builder's protocol fees earned (for the selected period).",
  users: "Total number of users across all vaults by this builder"
};

const ITEMS_PER_PAGE = 10;

const formatCreatedTime = (ageInSecond: number) => {
  const now = Math.floor(Date.now() / 1000);
  const createdTimestamp = now - ageInSecond;
  const createdDate = new Date(createdTimestamp * 1000);
  
  // Format: May 9, 13:32 UTC
  return createdDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC'
  }) + ' UTC';
};

const WeeklyLeaderboard = ({ vaults, loading }: WeeklyLeaderboardProps) => {
  const { migratedVaults, loading: migratedVaultsLoading, error: migratedVaultsError } = useMigratedVaults();
  
  const [vaultType, setVaultType] = useState<VaultType>("autofarm");
  
  const [migrateSortOptions, setMigrateSortOptions] = useState<SortOptions>({
    field: SortField.FEE_REBATE,
    direction: 'desc'
  });
  
  // Filter vaults based on type
  const filteredByTypeVaults = useMemo(() => {
    return vaults.filter(vault => {
      if (vaultType === 'autofarm') {
        return vault.isAutoFarmVault === true;
      }
      return vault.isAutoFarmVault !== true;
    });
  }, [vaults, vaultType]);

  // Sort migrated vaults by feeAmountUsd
  const sortedMigratedVaults = useMemo(() => {
    console.log('Migrated Vaults:', migratedVaults);
    return [...migratedVaults].sort((a, b) => {
      const multiplier = migrateSortOptions.direction === 'desc' ? -1 : 1;
      let ownerA: string;
      let ownerB: string;
      
      switch (migrateSortOptions.field) {
        case SortField.FEE_REBATE:
          return (a.feeAmountUsd - b.feeAmountUsd) * multiplier;
        case SortField.OWNER:
          ownerA = a.owner?.twitterUsername || a.ownerAddress;
          ownerB = b.owner?.twitterUsername || b.ownerAddress;
          return ownerA.localeCompare(ownerB) * multiplier;
        default:
          return (a.feeAmountUsd - b.feeAmountUsd) * multiplier;
      }
    });
  }, [migratedVaults, migrateSortOptions]);

  const periodOptions = [
    { value: "this-week", label: "This Week" },
    { value: "last-week", label: "Last Week" },
    { value: "all-time", label: "All Time" },
  ];
  
  const [selectedPeriod, setSelectedPeriod] = useState(periodOptions[2].value);
  const [activeTab, setActiveTab] = useState("performing");
  const [challengeTab, setChallengeTab] = useState("all");

  // Switch away from migrate tab when switching to Auto-Farms
  useEffect(() => {
    if (vaultType === 'autofarm' && activeTab === 'migrate') {
      setActiveTab('performing');
    }
  }, [vaultType, activeTab]);
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: SortField.FEES,
    direction: 'desc'
  });
  const [filterOptions] = useState<FilterOptions>({
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
  
  const [buildersCurrentPage, setBuildersCurrentPage] = useState(1);
  const [vaultsCurrentPage, setVaultsCurrentPage] = useState(1);
  const [challengeVaultsPage, setChallengeVaultsPage] = useState(1);
  const [migrateVaultsPage, setMigrateVaultsPage] = useState(1);

  const handleSortChange = (field: SortField) => {
    setSortOptions(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleMigrateSortChange = (field: SortField) => {
    setMigrateSortOptions(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Filter vaults based on selected period
  const timeFilteredVaults = useMemo(() => {
    return filteredByTypeVaults.filter(vault => {
      switch (selectedPeriod) {
        case "this-week":
          return vault.ageInSecond <= 604800; // 7 days
        case "last-week":
          return vault.ageInSecond > 604800 && vault.ageInSecond <= 1209600; // 8-14 days
        case "all-time":
          return true;
        default:
          return true;
      }
    });
  }, [filteredByTypeVaults, selectedPeriod]);

  // Filter vaults for Farm & Earn Challenge
  const challengeVaults = useMemo(() => {
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const challengeStart = 1746781200; // Friday, May 9, 2025 – 9:00 AM GMT
    const challengeEnd = 1747386000;   // Friday, May 16, 2025 – 9:00 AM GMT
    
    // Calculate how many seconds ago the challenge period was
    const secondsSinceChallengeStart = now - challengeStart;
    const secondsSinceChallengeEnd = now - challengeEnd;
    
    return filteredByTypeVaults.filter(vault => 
      vault.ageInSecond <= secondsSinceChallengeStart && 
      vault.ageInSecond >= secondsSinceChallengeEnd &&
      vault.allowDeposit === true
    );
  }, [filteredByTypeVaults]);

  // Get top 10 vaults by fee earnings
  const topVaultsByFees = useMemo(() => {
    const ownerMap = new Map();
    
    // First pass: keep only the highest fee vault for each owner
    challengeVaults.forEach(vault => {
      const existingVault = ownerMap.get(vault.owner.address);
      if (!existingVault || vault.feeGenerated > existingVault.feeGenerated) {
        ownerMap.set(vault.owner.address, vault);
      }
    });

    // Convert to array and sort by fees
    return Array.from(ownerMap.values())
      .sort((a, b) => (b.feeGenerated || 0) - (a.feeGenerated || 0))
      .slice(0, 10);
  }, [challengeVaults]);

  // Get top 10 vaults by users
  const topVaultsByUsers = useMemo(() => {
    const ownerMap = new Map();
    
    // First pass: keep only the highest user count vault for each owner
    challengeVaults.forEach(vault => {
      const existingVault = ownerMap.get(vault.owner.address);
      if (!existingVault || 
          vault.totalUser > existingVault.totalUser || 
          (vault.totalUser === existingVault.totalUser && vault.feeGenerated > existingVault.feeGenerated)) {
        ownerMap.set(vault.owner.address, vault);
      }
    });

    // Convert to array and sort by users (and fees as secondary criterion)
    return Array.from(ownerMap.values())
      .sort((a, b) => {
        if (b.totalUser !== a.totalUser) {
          return b.totalUser - a.totalUser;
        }
        return (b.feeGenerated || 0) - (a.feeGenerated || 0);
      })
      .slice(0, 10);
  }, [challengeVaults]);

  // Get top 10 vaults by TVL
  const topVaultsByTVL = useMemo(() => {
    const ownerMap = new Map();
    
    // First pass: keep only the highest TVL vault for each owner
    challengeVaults.forEach(vault => {
      const existingVault = ownerMap.get(vault.owner.address);
      if (!existingVault || 
          vault.tvl > existingVault.tvl || 
          (vault.tvl === existingVault.tvl && vault.feeGenerated > existingVault.feeGenerated)) {
        ownerMap.set(vault.owner.address, vault);
      }
    });

    // Convert to array and sort by TVL (and fees as secondary criterion)
    return Array.from(ownerMap.values())
      .sort((a, b) => {
        if ((b.tvl || 0) !== (a.tvl || 0)) {
          return (b.tvl || 0) - (a.tvl || 0);
        }
        return (b.feeGenerated || 0) - (a.feeGenerated || 0);
      })
      .slice(0, 10);
  }, [challengeVaults]);

  const filteredAndSortedVaults = useFilteredAndSortedVaults(timeFilteredVaults, filterOptions, sortOptions);
  const filteredAndSortedChallengeVaults = useFilteredAndSortedVaults(challengeVaults, filterOptions, sortOptions);

  const topPerformingUsers = useMemo(() => {
    console.log("Sorting builders by:", sortOptions.field, sortOptions.direction);
    
    const builderMap = new Map();
    
    timeFilteredVaults.forEach(vault => {
      const builder = vault.owner;
      console.log('Builder data:', {
        address: builder.address,
        twitterUsername: builder.twitterUsername,
        name: builder.twitterUsername || undefined
      });
      const existingBuilder = builderMap.get(builder.address) || {
        address: builder.address,
        name: builder.twitterUsername || undefined,
        twitterUsername: builder.twitterUsername,
        avatarUrl: builder.avatarUrl,
        feesEarned: 0,
        totalUsers: 0,
        vaultCount: 0,
        dailyYield: 0,
        totalTvl: 0,
      };

      existingBuilder.feesEarned += vault.feeGenerated;
      existingBuilder.totalUsers += vault.totalUser;
      existingBuilder.vaultCount += 1;
      existingBuilder.dailyYield += vault.earning24h || 0;
      existingBuilder.totalTvl += vault.tvl || 0;

      builderMap.set(builder.address, existingBuilder);
    });

    const users = Array.from(builderMap.values());
    
    console.log("Users before sorting:", users.map(u => ({
      name: u.name || u.address.slice(0, 8),
      fees: u.feesEarned
    })));
    
    const sortedUsers = users.sort((a, b) => {
      const multiplier = sortOptions.direction === 'desc' ? -1 : 1;
      
      switch (sortOptions.field) {
        case SortField.FEES:
          return (a.feesEarned - b.feesEarned) * multiplier;
        case SortField.USERS:
          return (a.totalUsers - b.totalUsers) * multiplier;
        case SortField.VAULTS:
          return (a.vaultCount - b.vaultCount) * multiplier;
        case SortField.DAILY_YIELD:
          // Sort by absolute dollar amount
          return (a.dailyYield - b.dailyYield) * multiplier;
        case SortField.DAILY_YIELD_PCT: {
          // Sort by percentage for better comparison across different TVL sizes
          const yieldPctA = a.totalTvl > 0 ? a.dailyYield / a.totalTvl : 0;
          const yieldPctB = b.totalTvl > 0 ? b.dailyYield / b.totalTvl : 0;
          return (yieldPctA - yieldPctB) * multiplier;
        }
        default:
          return (a.feesEarned - b.feesEarned) * multiplier;
      }
    });

    console.log("Users after sorting:", sortedUsers.map(u => ({
      name: u.name || u.address.slice(0, 8),
      fees: u.feesEarned
    })));
    
    return sortedUsers.map((builder, index) => ({
      ...builder,
      rank: index + 1
    }));
  }, [timeFilteredVaults, sortOptions]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (buildersCurrentPage - 1) * ITEMS_PER_PAGE;
    return topPerformingUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [topPerformingUsers, buildersCurrentPage]);

  const paginatedVaults = useMemo(() => {
    const startIndex = (vaultsCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedVaults.slice(startIndex, startIndex + ITEMS_PER_PAGE).map((vault, idx) => ({
      ...vault,
      rank: startIndex + idx + 1,
    }));
  }, [filteredAndSortedVaults, vaultsCurrentPage]);

  const paginatedMigratedVaults = useMemo(() => {
    const startIndex = (migrateVaultsPage - 1) * ITEMS_PER_PAGE;
    return sortedMigratedVaults.slice(startIndex, startIndex + ITEMS_PER_PAGE).map((vault, idx) => ({
      ...vault,
      rank: startIndex + idx + 1,
    }));
  }, [sortedMigratedVaults, migrateVaultsPage]);

  const usersTotalPages = Math.ceil(topPerformingUsers.length / ITEMS_PER_PAGE);
  const vaultsTotalPages = Math.ceil(filteredAndSortedVaults.length / ITEMS_PER_PAGE);
  const migrateVaultsTotalPages = Math.ceil(sortedMigratedVaults.length / ITEMS_PER_PAGE);

  const handleUserRowClick = (address: string) => {
    const hash = vaultType === 'autofarm' ? '#auto_farm_vault' : '#owned_vault';
    window.open(`https://defi.krystal.app/account/${address}/positions${hash}`, '_blank');
  };

  const handleVaultRowClick = (vault: Vault) => {
    window.open(`https://defi.krystal.app/vaults/${vault.chainId}/${vault.vaultAddress}`, '_blank');
  };

  const handleExportCSV = (tab: string) => {
    const headers = [
      'Rank',
      'Vault Name',
      'Vault Address',
      'Owner',
      'Owner Address',
      'Chain',
      'Fees Generated',
      'TVL',
      'APR',
      'Total Users',
      'Created'
    ];

    let dataToExport;
    let filenamePrefix;

    switch (tab) {
      case 'all':
        dataToExport = filteredAndSortedChallengeVaults;
        filenamePrefix = 'farm-earn-challenge-all';
        break;
      case 'fees':
        dataToExport = topVaultsByFees;
        filenamePrefix = 'farm-earn-challenge-top-fees';
        break;
      case 'tvl':
        dataToExport = topVaultsByTVL;
        filenamePrefix = 'farm-earn-challenge-top-tvl';
        break;
      case 'users':
        dataToExport = topVaultsByUsers;
        filenamePrefix = 'farm-earn-challenge-top-users';
        break;
      default:
        dataToExport = filteredAndSortedChallengeVaults;
        filenamePrefix = 'farm-earn-challenge-all';
    }

    const csvData = dataToExport.map((vault, index) => [
      index + 1,
      vault.name,
      vault.vaultAddress,
      vault.owner.twitterUsername || shortenAddress(vault.owner.address),
      vault.owner.address,
      vault.chainName,
      vault.feeGenerated || 0,
      vault.tvl || 0,
      (vault.apr * 100).toFixed(2) + '%',
      Math.round(vault.totalUser),
      formatCreatedTime(vault.ageInSecond)
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.setAttribute('download', `${filenamePrefix}-${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || migratedVaultsLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto py-8 space-y-8">
        <Skeleton className="h-12 w-40 mx-auto" />
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-64 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (migratedVaultsError) {
    console.error('Error loading migrated vaults:', migratedVaultsError);
  }

  return (
    <section className="w-full max-w-5xl mx-auto py-8">
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

      <div className="flex flex-col sm:flex-row items-center justify-between gap-y-6 mb-8">
        <Tabs
          defaultValue="performing"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full sm:w-auto"
        >
          <TabsList
            className="unified-tabs-header gap-4 min-h-[44px]"
            style={{ minHeight: 44 }}
          >
            <TabsTrigger value="performing" className="unified-tab min-h-[44px] px-5">
              Top Performing
            </TabsTrigger>
            <TabsTrigger value="vaults" className="unified-tab min-h-[44px] px-5">
              {vaultType === 'autofarm' ? 'Top Auto-Farms' : 'Top Vaults'}
            </TabsTrigger>
            {vaultType !== 'autofarm' && (
              <TabsTrigger value="migrate" className="unified-tab min-h-[44px] px-5">
                Migrate to Vaults
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>
        <div className="flex-shrink-0 w-full sm:w-auto mt-6 sm:mt-0 sm:ml-auto">
          <div className="flex sm:justify-end gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px] h-11 min-h-[44px] bg-[#18181b] border border-[#222] rounded-full text-[#e5e5e7] font-medium text-base shadow-none ring-0 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent className="bg-[#18181b] border-[#222] z-50">
                {periodOptions.map((p) => (
                  <SelectItem
                    key={p.value}
                    value={p.value}
                    className="text-base text-[#e5e5e7] data-[state=selected]:font-bold font-inter"
                  >
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="performing" className="animate-fade-in mt-4">
          <div className="bg-[#0A0A0A] rounded-2xl shadow-lg border border-[#1f1f1f] py-2 px-0 sm:px-2">
            <table className="unified-table w-full">
              <thead>
                <tr className="unified-table-header">
                  <th className="w-12 text-left pl-6 font-semibold text-xs text-[#999] tracking-widest uppercase">
                    #
                  </th>
                  <th className="text-left text-xs text-[#999] font-semibold uppercase">
                    Builder
                  </th>
                  <PerformingHeader
                    field={SortField.FEES}
                    label="Fee Generated"
                    helpText={COLUMN_HELP.fees}
                    sortOptions={sortOptions}
                    onSortChange={handleSortChange}
                  />
                  {vaultType === 'autofarm' && (
                    <th className="text-right pr-2 py-2 min-w-[120px]">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-xs text-[#999] font-semibold uppercase">Daily Yield</span>
                        <div className="flex bg-[#1a1a1a] rounded-md overflow-hidden ml-1">
                          <button
                            onClick={() => handleSortChange(SortField.DAILY_YIELD)}
                            className={`px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                              sortOptions.field === SortField.DAILY_YIELD
                                ? 'bg-white text-black'
                                : 'text-[#999] hover:text-white'
                            }`}
                          >
                            $
                          </button>
                          <button
                            onClick={() => handleSortChange(SortField.DAILY_YIELD_PCT)}
                            className={`px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                              sortOptions.field === SortField.DAILY_YIELD_PCT
                                ? 'bg-white text-black'
                                : 'text-[#999] hover:text-white'
                            }`}
                          >
                            %
                          </button>
                        </div>
                      </div>
                    </th>
                  )}
                  {vaultType !== 'autofarm' && (
                    <PerformingHeader
                      field={SortField.USERS}
                      label="Total Users"
                      helpText={COLUMN_HELP.users}
                      sortOptions={sortOptions}
                      onSortChange={handleSortChange}
                    />
                  )}
                  <PerformingHeader
                    field={SortField.VAULTS}
                    label={vaultType === 'autofarm' ? 'Auto-Farms' : 'Active Vaults'}
                    sortOptions={sortOptions}
                    onSortChange={handleSortChange}
                  />
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => {
                  const isTop3 = user.rank <= 3;
                  return (
                    <tr
                      key={user.address}
                      className={`
                        unified-table-row
                        ${isTop3 ? "font-bold text-white" : ""}
                        cursor-pointer hover:bg-[#1a1a1a] transition-colors
                      `}
                      onClick={() => handleUserRowClick(user.address)}
                      tabIndex={0}
                      aria-label={`View builder ${user.name || user.address}`}
                    >
                      <td className="pl-6 pr-2 py-2 align-middle min-w-[48px]">
                        {isTop3 ? (
                          <span className="bg-[#18181b] rounded-full w-9 h-9 flex items-center justify-center mr-2">
                            <Trophy
                              className={`
                                w-5 h-5
                                ${user.rank === 1 && "text-[#FFE567]"}
                                ${user.rank === 2 && "text-[#B4B6BC]"}
                                ${user.rank === 3 && "text-[#FFAD7D]"}
                              `}
                            />
                          </span>
                        ) : (
                          <span className="font-mono text-base text-[#999] pl-2 font-semibold">
                            {user.rank}
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-2 min-w-[160px]">
                        <div className="flex items-center gap-3">
                          <Avatar 
                            className="w-8 h-8 border border-[#222] bg-[#131313] cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (user.avatarUrl && user.twitterUsername) {
                                window.open(`https://x.com/${user.twitterUsername}`, '_blank');
                              } else {
                                handleUserRowClick(user.address);
                              }
                            }}
                          >
                            {user.avatarUrl ? (
                              <AvatarImage src={user.avatarUrl} alt={user.name || shortenAddress(user.address)} />
                            ) : (
                              <AvatarFallback className="text-sm font-bold text-[#fff] uppercase">
                                {user.name?.[0] ?? user.address.slice(2, 4)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-[#fff] text-base truncate font-inter">
                                {user.name || shortenAddress(user.address)}
                              </span>
                              {user.twitterUsername && (
                                <a
                                  href={`https://x.com/${user.twitterUsername}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 rounded-full hover:bg-white/5 transition-colors inline-flex items-center justify-center"
                                  onClick={(e) => e.stopPropagation()}
                                  aria-label={`View ${user.name || user.address} on X`}
                                >
                                  <Twitter className="w-3.5 h-3.5 text-white/60" />
                                </a>
                              )}
                            </div>
                            <span className="text-xs text-[#999] font-mono truncate">
                              {shortenAddress(user.address)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="text-right pr-2 py-2 min-w-[100px] font-medium">
                        {formatNumber(user.feesEarned || 0)}
                      </td>
                      {vaultType === 'autofarm' && (
                        <td className="text-right pr-2 py-2 min-w-[120px] font-medium">
                          <div className="text-white">{formatNumber(user.dailyYield || 0)}</div>
                          <div className="text-xs text-[#999]">
                            ~{user.totalTvl > 0 ? ((user.dailyYield || 0) / user.totalTvl * 100).toFixed(3) : '0.000'}%
                          </div>
                        </td>
                      )}
                      {vaultType !== 'autofarm' && (
                        <td className="text-right pr-2 py-2 min-w-[80px] font-medium">
                          {Math.round(user.totalUsers)}
                        </td>
                      )}
                      <td className="text-right pr-6 py-2 min-w-[70px] font-medium">
                        {user.vaultCount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4">
            <TablePagination
              currentPage={buildersCurrentPage}
              totalPages={usersTotalPages}
              setCurrentPage={setBuildersCurrentPage}
            />
          </div>
        </TabsContent>

        <TabsContent value="vaults" className="animate-fade-in mt-4">
          <div className="bg-[#0A0A0A] rounded-2xl shadow-lg border border-[#1f1f1f] py-2 px-0 sm:px-0 overflow-hidden">
            <table className="unified-table w-full">
              <thead>
                <tr className="unified-table-header">
                  <th className="w-12 text-left pl-6 font-semibold text-xs text-[#999] tracking-widest uppercase">
                    #
                  </th>
                  <th className="text-left text-xs text-[#999] font-semibold uppercase min-w-[240px] pl-2">
                    {vaultType === 'autofarm' ? 'Auto-Farm' : 'Vault'}
                  </th>
                  <th className="text-left text-xs text-[#999] font-semibold uppercase min-w-[140px] pl-2 py-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5" /> {/* Spacer for avatar */}
                      <div className="flex flex-col">
                        <SortHeader
                          field={SortField.OWNER}
                          label="Owner"
                          sortOptions={sortOptions}
                          onSortChange={handleSortChange}
                          className="text-xs font-medium text-[#999]"
                        />
                      </div>
                    </div>
                  </th>
                  <th className="text-left text-xs text-[#999] font-semibold uppercase w-[60px] pl-2">Chain</th>
                  <th
                    className={`text-right text-xs uppercase w-[120px] pr-4 ${sortOptions.field === SortField.FEES ? 'text-white font-semibold' : 'text-[#999] font-semibold'}`}
                  >
                    <SortHeader field={SortField.FEES} label="Fees" sortOptions={sortOptions} onSortChange={handleSortChange} />
                  </th>
                  {vaultType === 'autofarm' && (
                    <th className="text-right text-xs uppercase w-[140px] pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <span className={`${sortOptions.field === SortField.DAILY_YIELD || sortOptions.field === SortField.DAILY_YIELD_PCT ? 'text-white font-semibold' : 'text-[#999] font-semibold'}`}>
                          Daily Yield
                        </span>
                        <div className="flex bg-[#1a1a1a] rounded-md overflow-hidden ml-1">
                          <button
                            onClick={() => handleSortChange(SortField.DAILY_YIELD)}
                            className={`px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                              sortOptions.field === SortField.DAILY_YIELD
                                ? 'bg-white text-black'
                                : 'text-[#999] hover:text-white'
                            }`}
                          >
                            $
                          </button>
                          <button
                            onClick={() => handleSortChange(SortField.DAILY_YIELD_PCT)}
                            className={`px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                              sortOptions.field === SortField.DAILY_YIELD_PCT
                                ? 'bg-white text-black'
                                : 'text-[#999] hover:text-white'
                            }`}
                          >
                            %
                          </button>
                        </div>
                      </div>
                    </th>
                  )}
                  <th
                    className={`text-right text-xs uppercase w-[120px] pr-4 ${sortOptions.field === SortField.TVL ? 'text-white font-semibold' : 'text-[#999] font-semibold'}`}
                  >
                    <SortHeader field={SortField.TVL} label="TVL" sortOptions={sortOptions} onSortChange={handleSortChange} />
                  </th>
                  <th
                    className={`text-right text-xs uppercase w-[100px] ${vaultType === 'autofarm' ? 'pr-6' : 'pr-4'} ${sortOptions.field === SortField.APR ? 'text-white font-semibold' : 'text-[#999] font-semibold'}`}
                  >
                    <SortHeader field={SortField.APR} label="APR" sortOptions={sortOptions} onSortChange={handleSortChange} />
                  </th>
                  {vaultType !== 'autofarm' && (
                    <th
                      className={`text-right text-xs uppercase w-[100px] pr-6 ${sortOptions.field === SortField.USERS ? 'text-white font-semibold' : 'text-[#999] font-semibold'}`}
                    >
                      <SortHeader field={SortField.USERS} label="Users" sortOptions={sortOptions} onSortChange={handleSortChange} />
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedVaults.map((vault) => {
                  const isTop3 = vault.rank <= 3;
                  return (
                    <tr
                      key={`${vault.chainId}-${vault.vaultAddress}`}
                      className={`
                        unified-table-row
                        ${isTop3 ? "font-bold text-white" : ""}
                        cursor-pointer hover:bg-[#1a1a1a] transition-colors
                        w-full
                      `}
                      onClick={() => handleVaultRowClick(vault)}
                      tabIndex={0}
                      style={{
                        fontSize: "1rem",
                        minHeight: 56,
                        height: 56,
                        fontWeight: isTop3 ? 700 : 500,
                      }}
                      aria-label={`View vault ${vault.name || vault.vaultAddress}`}
                    >
                      <td className="pl-6 pr-2 py-2 align-middle min-w-[48px]">
                        <span className="flex items-center justify-between">
                          {isTop3 ? (
                            <span className={`
                              bg-[#18181b]
                              rounded-full
                              w-9 h-9 flex items-center justify-center
                              mr-2
                            `}>
                              <Trophy
                                className={`
                                  w-5 h-5
                                  ${vault.rank === 1 && "text-[#FFE567]"}
                                  ${vault.rank === 2 && "text-[#B4B6BC]"}
                                  ${vault.rank === 3 && "text-[#FFAD7D]"}
                                `}
                              />
                            </span>
                          ) : (
                            <span
                              className="font-mono text-base text-[#999] pl-2"
                              style={{ fontWeight: 600 }}
                            >
                              {vault.rank}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="py-2 pl-2 pr-2 min-w-[240px]">
                        <div className="flex flex-col">
                          <div className="font-semibold text-[#fff] text-base max-w-[240px] truncate font-inter">
                            {vault.name}
                          </div>
                          <div className="mt-1 text-xs text-[#999] font-mono truncate">
                            {shortenAddress(vault.vaultAddress)}
                          </div>
                        </div>
                      </td>
                      <td className="text-left min-w-[140px] pl-2 py-2">
                        <div className="flex items-center gap-1.5 cursor-pointer"
                          onClick={e => {
                            e.stopPropagation();
                            const hash = vaultType === 'autofarm' ? '#auto_farm_vault' : '#owned_vault';
                            window.open(`https://defi.krystal.app/account/${vault.owner.address}/positions${hash}`, '_blank');
                          }}
                        >
                          <Avatar 
                            className="w-5 h-5 border border-[#222] bg-[#131313] cursor-pointer"
                            onClick={e => {
                              e.stopPropagation();
                              const hash = vaultType === 'autofarm' ? '#auto_farm_vault' : '#owned_vault';
                              window.open(`https://defi.krystal.app/account/${vault.owner.address}/positions${hash}`, '_blank');
                            }}
                          >
                            {vault.owner.avatarUrl ? (
                              <AvatarImage src={vault.owner.avatarUrl} alt={vault.owner.twitterUsername || shortenAddress(vault.owner.address)} />
                            ) : (
                              <AvatarFallback className="text-[10px] font-bold text-[#fff] uppercase">
                                {vault.owner.twitterUsername?.[0] ?? vault.owner.address.slice(2, 4)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-[#fff] text-sm truncate font-inter">
                              {vault.owner?.twitterUsername || shortenAddress(vault.owner.address)}
                            </span>
                            <span className="text-[10px] text-[#999] font-mono truncate">
                              {shortenAddress(vault.owner.address)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 pl-2 pr-2 w-[60px]">
                        <div className="flex items-center">
                          <ChainBadge chainName={vault.chainName} chainLogo={vault.chainLogo} />
                        </div>
                      </td>
                      <td className="text-right w-[120px] pr-4 py-2 font-medium">
                        {formatNumber(vault.feeGenerated || 0)}
                      </td>
                      {vaultType === 'autofarm' && (
                        <td className="text-right w-[120px] pr-4 py-2 font-medium">
                          <div className="text-white">{formatNumber(vault.earning24h || 0)}</div>
                          <div className="text-xs text-[#999]">
                            ~{vault.tvl > 0 ? ((vault.earning24h || 0) / vault.tvl * 100).toFixed(3) : '0.000'}%
                          </div>
                        </td>
                      )}
                      <td className="text-right w-[120px] pr-4 py-2 font-medium">
                        {formatNumber(vault.tvl || 0)}
                      </td>
                      <td className={`text-right w-[100px] ${vaultType === 'autofarm' ? 'pr-6' : 'pr-4'} py-2 font-medium`}>
                        {(vault.apr * 100).toFixed(2)}%
                      </td>
                      {vaultType !== 'autofarm' && (
                        <td className="text-right w-[100px] pr-6 py-2 font-medium">
                          {Math.round(vault.totalUser)}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4">
            <TablePagination
              currentPage={vaultsCurrentPage}
              totalPages={vaultsTotalPages}
              setCurrentPage={setVaultsCurrentPage}
            />
          </div>
        </TabsContent>

        <TabsContent value="migrate" className="animate-fade-in">
          <div className="bg-[#0A0A0A] rounded-2xl shadow-lg border border-[#1f1f1f] py-2 px-0 sm:px-0 overflow-hidden">
            <table className="unified-table w-full">
              <thead>
                <tr className="unified-table-header">
                  <th className="w-10 text-left pl-4 font-semibold text-xs text-[#999] tracking-widest uppercase">#</th>
                  <th className="text-left text-xs text-[#999] font-semibold uppercase min-w-[180px] pl-4 py-2">Vault</th>
                  <th className="text-left text-xs text-[#999] font-semibold uppercase min-w-[140px] pl-2 py-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5" /> {/* Spacer for avatar */}
                      <div className="flex flex-col">
                        <SortHeader
                          field={SortField.OWNER}
                          label="Owner"
                          sortOptions={migrateSortOptions}
                          onSortChange={handleMigrateSortChange}
                          className="text-xs font-medium text-[#999]"
                        />
                      </div>
                    </div>
                  </th>
                  <th className="text-left text-xs text-[#999] font-semibold uppercase w-[60px] pl-2">Chain</th>
                  <th
                    className={`text-right text-xs uppercase w-[180px] pr-6 ${
                      migrateSortOptions.field === SortField.FEE_REBATE ? 'text-white font-semibold' : 'text-[#999] font-semibold'
                    }`}
                  >
                    <SortHeader
                      field={SortField.FEE_REBATE}
                      label="Fee Rebate (USD)"
                      sortOptions={migrateSortOptions}
                      onSortChange={handleMigrateSortChange}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedMigratedVaults.length > 0 ? (
                  paginatedMigratedVaults.map((vault) => {
                    const isTop3 = vault.rank <= 3;
                    return (
                      <tr
                        key={`${vault.chainId}-${vault.vaultAddress}`}
                        className={`
                          unified-table-row
                          ${isTop3 ? "font-bold text-white" : ""}
                          cursor-pointer hover:bg-[#1a1a1a] transition-colors
                          w-full
                        `}
                        style={{
                          fontSize: "1rem",
                          minHeight: 56,
                          height: 56,
                          fontWeight: isTop3 ? 700 : 500,
                        }}
                        onClick={() => window.open(`https://defi.krystal.app/vaults/${vault.chainId}/${vault.vaultAddress}`, '_blank')}
                      >
                        <td className="pl-4 pr-2 py-2 align-middle min-w-[40px]">
                          <span className="flex items-center justify-between">
                            {isTop3 ? (
                              <span className={`
                                bg-[#18181b]
                                rounded-full
                                w-8 h-8 flex items-center justify-center
                                mr-2
                              `}>
                                <Trophy
                                  className={`
                                    w-4 h-4
                                    ${vault.rank === 1 && "text-[#FFE567]"}
                                    ${vault.rank === 2 && "text-[#B4B6BC]"}
                                    ${vault.rank === 3 && "text-[#FFAD7D]"}
                                  `}
                                />
                              </span>
                            ) : (
                              <span
                                className="font-mono text-sm text-[#999] pl-1"
                                style={{ fontWeight: 600 }}
                              >
                                {vault.rank}
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="py-2 pl-2 pr-2 min-w-[180px]">
                          <div className="flex flex-col">
                            <div className="font-semibold text-[#fff] text-sm max-w-[180px] truncate font-inter">
                              {vault.vaultName}
                            </div>
                            <div className="mt-0.5 text-[10px] text-[#999] font-mono truncate">
                              {shortenAddress(vault.vaultAddress)}
                            </div>
                          </div>
                        </td>
                        <td className="text-left min-w-[140px] pl-2 py-2">
                          <div className="flex items-center gap-1.5 cursor-pointer"
                            onClick={e => {
                              e.stopPropagation();
                              window.open(`https://defi.krystal.app/account/${vault.ownerAddress}/positions?tab=Vaults#owned_vaults`, '_blank');
                            }}
                          >
                            {vault.owner && (
                              <Avatar className="w-5 h-5 border border-[#222] bg-[#131313]">
                                {vault.owner.avatarUrl ? (
                                  <AvatarImage src={vault.owner.avatarUrl} alt={vault.owner.twitterUsername || shortenAddress(vault.owner.address)} />
                                ) : (
                                  <AvatarFallback className="text-[10px] font-bold text-[#fff] uppercase">
                                    {vault.owner.twitterUsername?.[0] ?? vault.owner.address.slice(2, 4)}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            )}
                            <div className="flex flex-col">
                              <span className="font-medium text-[#fff] text-sm truncate font-inter">
                                {vault.owner?.twitterUsername || shortenAddress(vault.ownerAddress)}
                              </span>
                              <span className="text-[10px] text-[#999] font-mono truncate">
                                {shortenAddress(vault.ownerAddress)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 pl-2 pr-2 w-[60px]">
                          <div className="flex items-center">
                            <ChainBadge chainName={vault.chainName} chainLogo={vault.chainLogo} />
                          </div>
                        </td>
                        <td className="text-right w-[180px] pr-6 py-2 font-medium">
                          <span className="text-base">
                            {vault.feeAmountUsd.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-[#999]">
                      No migrated vaults found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4">
            <TablePagination
              currentPage={migrateVaultsPage}
              totalPages={migrateVaultsTotalPages}
              setCurrentPage={setMigrateVaultsPage}
            />
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default WeeklyLeaderboard;