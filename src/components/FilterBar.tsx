import React, { useState } from 'react';

import {
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { FilterOptions } from '@/types/vault';

interface FilterBarProps {
  filterOptions: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  className?: string;
}

const CHAINS = [
  { id: 1, name: 'Ethereum' },
  { id: 56, name: 'BNB Chain' },
  { id: 137, name: 'Polygon' },
  { id: 42161, name: 'Arbitrum' },
  { id: 10, name: 'Optimism' },
  { id: 8453, name: 'Base' },
];

const FilterBar = ({ filterOptions, onFilterChange, className }: FilterBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [aprRange, setAprRange] = useState<[number | null, number | null]>([
    filterOptions.minAPR,
    filterOptions.maxAPR,
  ]);

  const handleAprRangeChange = (value: number[]) => {
    setAprRange([value[0] / 100, null]);
  };

  const handleFilterUpdate = (key: keyof FilterOptions, value: FilterOptions[keyof FilterOptions]) => {
    onFilterChange({
      ...filterOptions,
      [key]: value,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterUpdate('search', e.target.value);
  };

  const handleClearFilters = () => {
    const resetFilters: FilterOptions = {
      principalToken: null,
      riskLevel: null,
      minAPR: null,
      maxAPR: null,
      tvlRange: null,
      rangeStrategy: null,
      allowDeposit: null,
      search: '',
      chainId: null,
    };
    onFilterChange(resetFilters);
    setAprRange([null, null]);
  };

  const activeFilterCount = Object.entries(filterOptions).filter(([key, value]) => {
    if (key === 'search') return value !== '';
    return value !== null;
  }).length;

  return (
    <div className={cn("mb-6", className)}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <div className="w-full max-w-[720px]">
          <div className="relative flex items-center">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 w-4 h-4 pointer-events-none" />
            <Input
              placeholder="Search by token, pool or vault name"
              className={cn(
                "h-11 pl-11 pr-4 bg-[rgba(255,255,255,0.05)]",
                "border-white/10 rounded-xl",
                "w-full text-sm",
                "placeholder:text-white/50",
                "focus:ring-2 focus:ring-white/10 focus:outline-none",
                "transition-colors"
              )}
              value={filterOptions.search}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "rounded-full px-4 py-2 border-white/10 bg-white/5 text-sm font-medium text-white hover:border-white/30 hover:bg-white/10 transition-all relative",
                  activeFilterCount > 0 && "pl-3 pr-4"
                )}
              >
                <SlidersHorizontal className="w-4 h-4 text-white/70 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center bg-white/10 text-xs rounded-full w-5 h-5">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-[#0D0D0D] border-white/10 p-4 space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium tracking-wide uppercase text-white/60">Chain</Label>
                  <Select
                    value={filterOptions.chainId?.toString() || "none"}
                    onValueChange={(value) => {
                      const chainId = value === "none" ? null : Number(value);
                      handleFilterUpdate('chainId', chainId);
                    }}
                  >
                    <SelectTrigger className="w-full bg-white/5 border-white/10 text-white rounded-lg">
                      <SelectValue placeholder="All chains" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0D0D0D] border-white/10">
                      <SelectItem value="none">All chains</SelectItem>
                      {CHAINS.map((chain) => (
                        <SelectItem key={chain.id} value={chain.id.toString()}>
                          {chain.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium tracking-wide uppercase text-white/60">Principal Token</Label>
                  <Select
                    value={filterOptions.principalToken || "none"}
                    onValueChange={(value) => handleFilterUpdate('principalToken', value === "none" ? null : value)}
                  >
                    <SelectTrigger className="w-full bg-white/5 border-white/10 text-white rounded-lg">
                      <SelectValue placeholder="Any token" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0D0D0D] border-white/10">
                      <SelectItem value="none">Any token</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                      <SelectItem value="DAI">DAI</SelectItem>
                      <SelectItem value="WETH">WETH</SelectItem>
                      <SelectItem value="WBTC">WBTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium tracking-wide uppercase text-white/60">Risk Level</Label>
                  <Select
                    value={filterOptions.riskLevel || "none"}
                    onValueChange={(value) => handleFilterUpdate('riskLevel', value === "none" ? null : value)}
                  >
                    <SelectTrigger className="w-full bg-white/5 border-white/10 text-white rounded-lg">
                      <SelectValue placeholder="Any risk level" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0D0D0D] border-white/10">
                      <SelectItem value="none">Any risk level</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="ELEVATED">Elevated</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium tracking-wide uppercase text-white/60">
                    APR (Min: {aprRange[0] !== null ? `${(aprRange[0] * 100).toFixed(0)}%` : 'Any'})
                  </Label>
                  <Slider
                    defaultValue={[0]}
                    max={100}
                    step={1}
                    value={[aprRange[0] !== null ? aprRange[0] * 100 : 0]}
                    onValueChange={handleAprRangeChange}
                    onValueCommit={() => {
                      handleFilterUpdate('minAPR', aprRange[0]);
                    }}
                    className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium tracking-wide uppercase text-white/60">TVL Range</Label>
                  <Select
                    value={filterOptions.tvlRange || "none"}
                    onValueChange={(value) => handleFilterUpdate('tvlRange', value === "none" ? null : value)}
                  >
                    <SelectTrigger className="w-full bg-white/5 border-white/10 text-white rounded-lg">
                      <SelectValue placeholder="Any TVL range" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0D0D0D] border-white/10">
                      <SelectItem value="none">Any TVL range</SelectItem>
                      <SelectItem value="low">Low (&lt; $10k)</SelectItem>
                      <SelectItem value="medium">Medium ($10k - $100k)</SelectItem>
                      <SelectItem value="high">High (&gt; $100k)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium tracking-wide uppercase text-white/60">Strategy Type</Label>
                  <Select
                    value={filterOptions.rangeStrategy || "none"}
                    onValueChange={(value) => handleFilterUpdate('rangeStrategy', value === "none" ? null : value)}
                  >
                    <SelectTrigger className="w-full bg-white/5 border-white/10 text-white rounded-lg">
                      <SelectValue placeholder="Any strategy" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0D0D0D] border-white/10">
                      <SelectItem value="none">Any strategy</SelectItem>
                      <SelectItem value="WIDE_RANGE">Wide Range</SelectItem>
                      <SelectItem value="NARROW_RANGE">Narrow Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="allow-deposit" className="text-xs font-medium tracking-wide uppercase text-white/60">
                    Show only deposit-enabled vaults
                  </Label>
                  <Switch
                    id="allow-deposit"
                    checked={filterOptions.allowDeposit === true}
                    onCheckedChange={(checked) => {
                      handleFilterUpdate('allowDeposit', checked ? true : null);
                    }}
                    className="data-[state=checked]:bg-white/30"
                  />
                </div>

                <Button 
                  className="w-full rounded-full bg-white/10 hover:bg-white/20 text-white transition-all" 
                  onClick={() => setIsOpen(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filterOptions.chainId && (
            <div className="bg-white/5 rounded-full px-3 py-1 text-xs flex items-center gap-1 text-white/90">
              Chain: {CHAINS.find(chain => chain.id === filterOptions.chainId)?.name}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer text-white/50 hover:text-white/80" 
                onClick={() => handleFilterUpdate('chainId', null)} 
              />
            </div>
          )}
          {filterOptions.principalToken && (
            <div className="bg-white/5 rounded-full px-3 py-1 text-xs flex items-center gap-1 text-white/90">
              Token: {filterOptions.principalToken}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer text-white/50 hover:text-white/80" 
                onClick={() => handleFilterUpdate('principalToken', null)} 
              />
            </div>
          )}
          {filterOptions.riskLevel && (
            <div className="bg-white/5 rounded-full px-3 py-1 text-xs flex items-center gap-1 text-white/90">
              Risk: {filterOptions.riskLevel.toLowerCase()}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer text-white/50 hover:text-white/80" 
                onClick={() => handleFilterUpdate('riskLevel', null)} 
              />
            </div>
          )}
          {filterOptions.minAPR !== null && (
            <div className="bg-white/5 rounded-full px-3 py-1 text-xs flex items-center gap-1 text-white/90">
              Min APR: {(filterOptions.minAPR * 100).toFixed(0)}%
              <X 
                className="w-3 h-3 ml-1 cursor-pointer text-white/50 hover:text-white/80" 
                onClick={() => handleFilterUpdate('minAPR', null)} 
              />
            </div>
          )}
          {filterOptions.tvlRange && (
            <div className="bg-white/5 rounded-full px-3 py-1 text-xs flex items-center gap-1 text-white/90">
              TVL: {filterOptions.tvlRange}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer text-white/50 hover:text-white/80" 
                onClick={() => handleFilterUpdate('tvlRange', null)} 
              />
            </div>
          )}
          {filterOptions.rangeStrategy && (
            <div className="bg-white/5 rounded-full px-3 py-1 text-xs flex items-center gap-1 text-white/90">
              Strategy: {filterOptions.rangeStrategy.includes('WIDE') ? 'Wide' : 'Narrow'}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer text-white/50 hover:text-white/80" 
                onClick={() => handleFilterUpdate('rangeStrategy', null)} 
              />
            </div>
          )}
          {filterOptions.allowDeposit !== null && (
            <div className="bg-white/5 rounded-full px-3 py-1 text-xs flex items-center gap-1 text-white/90">
              Deposit Allowed
              <X 
                className="w-3 h-3 ml-1 cursor-pointer text-white/50 hover:text-white/80" 
                onClick={() => handleFilterUpdate('allowDeposit', null)} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
