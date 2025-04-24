
import React, { useState } from 'react';
import { FilterOptions } from '@/types/vault';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  filterOptions: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  className?: string;
}

const RISK_OPTIONS = [
  { value: 'LOW', label: 'Low Risk' },
  { value: 'MEDIUM', label: 'Medium Risk' },
  { value: 'ELEVATED', label: 'Elevated Risk' },
  { value: 'HIGH', label: 'High Risk' },
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

  const handleFilterUpdate = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filterOptions, [key]: value };
    onFilterChange(newFilters);
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
    };
    onFilterChange(resetFilters);
    setAprRange([null, null]);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filterOptions.principalToken) count++;
    if (filterOptions.riskLevel) count++;
    if (filterOptions.minAPR) count++;
    if (filterOptions.tvlRange) count++;
    if (filterOptions.rangeStrategy) count++;
    if (filterOptions.allowDeposit !== null) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={cn("mb-6", className)}>
      <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
        <div className="w-full md:max-w-[600px] md:mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <Input
              placeholder="Search by token, pool, or vault name"
              className="pl-10 bg-[rgba(255,255,255,0.05)] border-white/10 rounded-xl px-4 py-[10px] w-full text-sm placeholder:text-white/50 focus:ring-2 focus:ring-white/10 focus:outline-none"
              value={filterOptions.search}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="ml-auto">
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
            <PopoverContent 
              className="w-[320px] p-5 rounded-2xl bg-[#0D0D0D] border border-white/10 shadow-xl"
              align="end"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-medium tracking-wide uppercase text-white/60">Filter Options</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleClearFilters} 
                    className="h-8 gap-1 text-xs hover:bg-white/5 text-white/60 hover:text-white/80"
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear All
                  </Button>
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
                      <SelectItem value="WETH">WETH</SelectItem>
                      <SelectItem value="WBTC">WBTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium tracking-wide uppercase text-white/60">Risk Level</Label>
                  <Select
                    value={filterOptions.riskLevel || 'all_risks'}
                    onValueChange={(value) => 
                      onFilterChange({
                        ...filterOptions,
                        riskLevel: value === 'all_risks' ? null : value
                      })
                    }
                  >
                    <SelectTrigger className="w-full bg-white/5 border-white/10 text-white rounded-lg">
                      <SelectValue placeholder="Risk Level" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0D0D0D] border-white/10">
                      <SelectItem value="all_risks">All Risks</SelectItem>
                      {RISK_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
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
                      <SelectValue placeholder="Any TVL" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0D0D0D] border-white/10">
                      <SelectItem value="none">Any TVL</SelectItem>
                      <SelectItem value="low">Low (&lt; $10K)</SelectItem>
                      <SelectItem value="medium">Medium ($10K - $100K)</SelectItem>
                      <SelectItem value="high">High (&gt; $100K)</SelectItem>
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
