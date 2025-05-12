import React, {
  useMemo,
  useState,
} from 'react';

import {
  Trophy,
  Twitter,
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
  const periodOptions = [
    { value: "this-week", label: "This Week" },
    { value: "last-week", label: "Last Week" },
    { value: "all-time", label: "All Time" },
  ];
  
  const [selectedPeriod, setSelectedPeriod] = useState(periodOptions[2].value);
  const [activeTab, setActiveTab] = useState("performing");
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

  const handleSortChange = (field: SortField) => {
    setSortOptions(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Filter vaults based on selected period
  const timeFilteredVaults = useMemo(() => {
    return vaults.filter(vault => {
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
  }, [vaults, selectedPeriod]);

  // Filter vaults for Farm & Earn Challenge
  const challengeVaults = useMemo(() => {
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const challengeStart = 1746781200; // Friday, May 9, 2025 – 9:00 AM GMT
    const challengeEnd = 1747386000;   // Friday, May 16, 2025 – 9:00 AM GMT
    
    // Calculate how many seconds ago the challenge period was
    const secondsSinceChallengeStart = now - challengeStart;
    const secondsSinceChallengeEnd = now - challengeEnd;
    
    return vaults.filter(vault => 
      vault.ageInSecond <= secondsSinceChallengeStart && 
      vault.ageInSecond >= secondsSinceChallengeEnd
    );
  }, [vaults]);

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
      };

      existingBuilder.feesEarned += vault.feeGenerated;
      existingBuilder.totalUsers += vault.totalUser;
      existingBuilder.vaultCount += 1;

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

  const usersTotalPages = Math.ceil(topPerformingUsers.length / ITEMS_PER_PAGE);
  const vaultsTotalPages = Math.ceil(filteredAndSortedVaults.length / ITEMS_PER_PAGE);

  const handleUserRowClick = (address: string) => {
    window.open(`https://defi.krystal.app/account/${address}/positions?tab=Vaults#owned_vaults`, '_blank');
  };

  const handleVaultRowClick = (vault: Vault) => {
    window.open(`https://defi.krystal.app/vaults/${vault.chainId}/${vault.vaultAddress}`, '_blank');
  };

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto py-8 space-y-8">
        <Skeleton className="h-12 w-40 mx-auto" />
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-64 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <section className="w-full max-w-5xl mx-auto py-8">
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
              Top Vaults
            </TabsTrigger>
            <TabsTrigger value="challenge" className="unified-tab min-h-[44px] px-5">
              Farm & Earn Challenge
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex-shrink-0 w-full sm:w-auto mt-6 sm:mt-0 sm:ml-auto">
          <div className="flex sm:justify-end">
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
                  <PerformingHeader
                    field={SortField.USERS}
                    label="Total Users"
                    helpText={COLUMN_HELP.users}
                    sortOptions={sortOptions}
                    onSortChange={handleSortChange}
                  />
                  <PerformingHeader
                    field={SortField.VAULTS}
                    label="Active Vaults"
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
                      <td className="text-right pr-2 py-2 min-w-[80px] font-medium">
                        {Math.round(user.totalUsers)}
                      </td>
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
                    Vault
                  </th>
                  <th className="text-left text-xs text-[#999] font-semibold uppercase w-[60px] pl-2">
                    Chain
                  </th>
                  <th
                    className={`text-right text-xs uppercase w-[120px] pr-4 ${sortOptions.field === SortField.FEES ? 'text-white font-semibold' : 'text-[#999] font-semibold'}`}
                  >
                    <SortHeader field={SortField.FEES} label="Fees" sortOptions={sortOptions} onSortChange={handleSortChange} />
                  </th>
                  <th
                    className={`text-right text-xs uppercase w-[120px] pr-4 ${sortOptions.field === SortField.TVL ? 'text-white font-semibold' : 'text-[#999] font-semibold'}`}
                  >
                    <SortHeader field={SortField.TVL} label="TVL" sortOptions={sortOptions} onSortChange={handleSortChange} />
                  </th>
                  <th
                    className={`text-right text-xs uppercase w-[100px] pr-4 ${sortOptions.field === SortField.APR ? 'text-white font-semibold' : 'text-[#999] font-semibold'}`}
                  >
                    <SortHeader field={SortField.APR} label="APR" sortOptions={sortOptions} onSortChange={handleSortChange} />
                  </th>
                  <th
                    className={`text-right text-xs uppercase w-[100px] pr-6 ${sortOptions.field === SortField.USERS ? 'text-white font-semibold' : 'text-[#999] font-semibold'}`}
                  >
                    <SortHeader field={SortField.USERS} label="Users" sortOptions={sortOptions} onSortChange={handleSortChange} />
                  </th>
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
                      <td className="py-2 pl-2 pr-2 w-[60px]">
                        <div className="flex items-center">
                          <ChainBadge chainName={vault.chainName} chainLogo={vault.chainLogo} />
                        </div>
                      </td>
                      <td className="text-right w-[120px] pr-4 py-2 font-medium">
                        {formatNumber(vault.feeGenerated || 0)}
                      </td>
                      <td className="text-right w-[120px] pr-4 py-2 font-medium">
                        {formatNumber(vault.tvl || 0)}
                      </td>
                      <td className="text-right w-[100px] pr-4 py-2 font-medium">
                        {(vault.apr * 100).toFixed(2)}%
                      </td>
                      <td className="text-right w-[100px] pr-6 py-2 font-medium">
                        {Math.round(vault.totalUser)}
                      </td>
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

        <TabsContent value="challenge" className="animate-fade-in mt-4">
          <div className="bg-[#0A0A0A] rounded-2xl shadow-lg border border-[#1f1f1f] p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="flex flex-col">
                <span className="text-sm text-[#999] mb-1">Total Fees Generated</span>
                <span className="text-xl font-semibold text-white">
                  {formatNumber(filteredAndSortedChallengeVaults.reduce((sum, vault) => sum + (vault.feeGenerated || 0), 0))}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-[#999] mb-1">Total TVL</span>
                <span className="text-xl font-semibold text-white">
                  {formatNumber(filteredAndSortedChallengeVaults.reduce((sum, vault) => sum + (vault.tvl || 0), 0))}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-[#999] mb-1">Total Users</span>
                <span className="text-xl font-semibold text-white">
                  {Math.round(filteredAndSortedChallengeVaults.reduce((sum, vault) => sum + (vault.totalUser || 0), 0))}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-[#999] mb-1">Total Vaults</span>
                <span className="text-xl font-semibold text-white">
                  {filteredAndSortedChallengeVaults.length}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-[#999] mb-1">Total Chains</span>
                <span className="text-xl font-semibold text-white">
                  {new Set(filteredAndSortedChallengeVaults.map(vault => vault.chainId)).size}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-[#0A0A0A] rounded-2xl shadow-lg border border-[#1f1f1f] py-2 px-0 sm:px-0 overflow-hidden">
            <table className="unified-table w-full">
              <thead>
                <tr className="unified-table-header">
                  <th className="w-12 text-left pl-6 font-semibold text-xs text-[#999] tracking-widest uppercase">
                    #
                  </th>
                  <th className="text-left text-xs text-[#999] font-semibold uppercase min-w-[240px] pl-2">
                    Vault
                  </th>
                  <th className="text-left text-xs text-[#999] font-semibold uppercase w-[60px] pl-2">
                    Chain
                  </th>
                  <th
                    className={`text-right text-xs uppercase w-[120px] pr-4 ${sortOptions.field === SortField.FEES ? 'text-white font-semibold' : 'text-[#999] font-semibold'}`}
                  >
                    <SortHeader field={SortField.FEES} label="Fees" sortOptions={sortOptions} onSortChange={handleSortChange} />
                  </th>
                  <th
                    className={`text-right text-xs uppercase w-[120px] pr-4 ${sortOptions.field === SortField.TVL ? 'text-white font-semibold' : 'text-[#999] font-semibold'}`}
                  >
                    <SortHeader field={SortField.TVL} label="TVL" sortOptions={sortOptions} onSortChange={handleSortChange} />
                  </th>
                  <th
                    className={`text-right text-xs uppercase w-[100px] pr-4 ${sortOptions.field === SortField.APR ? 'text-white font-semibold' : 'text-[#999] font-semibold'}`}
                  >
                    <SortHeader field={SortField.APR} label="APR" sortOptions={sortOptions} onSortChange={handleSortChange} />
                  </th>
                  <th
                    className={`text-right text-xs uppercase w-[100px] pr-6 ${sortOptions.field === SortField.USERS ? 'text-white font-semibold' : 'text-[#999] font-semibold'}`}
                  >
                    <SortHeader field={SortField.USERS} label="Users" sortOptions={sortOptions} onSortChange={handleSortChange} />
                  </th>
                  <th className="text-right text-xs text-[#999] font-semibold uppercase w-[180px] pr-6">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedChallengeVaults
                  .slice((challengeVaultsPage - 1) * ITEMS_PER_PAGE, challengeVaultsPage * ITEMS_PER_PAGE)
                  .map((vault, idx) => {
                    const rank = (challengeVaultsPage - 1) * ITEMS_PER_PAGE + idx + 1;
                    const isTop3 = rank <= 3;
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
                                    ${rank === 1 && "text-[#FFE567]"}
                                    ${rank === 2 && "text-[#B4B6BC]"}
                                    ${rank === 3 && "text-[#FFAD7D]"}
                                  `}
                                />
                              </span>
                            ) : (
                              <span
                                className="font-mono text-base text-[#999] pl-2"
                                style={{ fontWeight: 600 }}
                              >
                                {rank}
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
                        <td className="py-2 pl-2 pr-2 w-[60px]">
                          <div className="flex items-center">
                            <ChainBadge chainName={vault.chainName} chainLogo={vault.chainLogo} />
                          </div>
                        </td>
                        <td className="text-right w-[120px] pr-4 py-2 font-medium">
                          {formatNumber(vault.feeGenerated || 0)}
                        </td>
                        <td className="text-right w-[120px] pr-4 py-2 font-medium">
                          {formatNumber(vault.tvl || 0)}
                        </td>
                        <td className="text-right w-[100px] pr-4 py-2 font-medium">
                          {(vault.apr * 100).toFixed(2)}%
                        </td>
                        <td className="text-right w-[100px] pr-6 py-2 font-medium">
                          {Math.round(vault.totalUser)}
                        </td>
                        <td className="text-right w-[180px] pr-6 py-2 font-medium text-[#999]">
                          {formatCreatedTime(vault.ageInSecond)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4">
            <TablePagination
              currentPage={challengeVaultsPage}
              totalPages={Math.ceil(filteredAndSortedChallengeVaults.length / ITEMS_PER_PAGE)}
              setCurrentPage={setChallengeVaultsPage}
            />
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default WeeklyLeaderboard;