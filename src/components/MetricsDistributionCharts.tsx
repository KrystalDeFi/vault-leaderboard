import React, { useState } from 'react';
import { ExternalLink, LockOpen, Lock, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Vault } from '@/types/vault';
import TokenIcon from './TokenIcon';
import { formatNumber, formatPercentage } from '@/services/api';
import AccessVaultCard from './AccessVaultCard';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from '@/components/ui/button';

interface DistributionData {
  name: string;
  value: number;
  vaultNames?: string[];
  vaultLinks?: { name: string; chainId: number; address: string }[];
}

interface MetricsDistributionChartsProps {
  riskProfile: {
    LOW: number;
    MODERATE: number;
    HIGH: number;
    ELEVATED?: number;
  };
  rangeStrategy: {
    WIDE_RANGE: number;
    NARROW_RANGE: number;
    UNSET: number;
  };
  tvlStrategyType: {
    UNSET: number;
    LOW_TVL: number;
    MED_TVL: number;
    HIGH_TVL: number;
    WHITELISTED_POOLS: number;
  };
  totalVaults: number;
  vaults: Vault[];
}

const MetricsDistributionCharts = ({
  riskProfile,
  rangeStrategy,
  tvlStrategyType,
  totalVaults,
  vaults,
}: MetricsDistributionChartsProps) => {
  const [publicOpen, setPublicOpen] = useState(false);
  const [privateOpen, setPrivateOpen] = useState(false);
  const [chartsOpen, setChartsOpen] = useState(false);

  const totalTVL = vaults.reduce((sum, v) => sum + v.tvl, 0);
  const avgAPR = vaults.length ? (vaults.reduce((sum, v) => sum + v.apr, 0) / vaults.length) : 0;
  const totalFees = vaults.reduce((sum, v) => sum + v.feeGenerated, 0);

  const getVaultsByCategory = (category: string, type: 'risk' | 'range' | 'tvl') => {
    return vaults.filter(vault => {
      switch (type) {
        case 'risk':
          if (category === 'ELEVATED') return vault.riskScore === 'ELEVATED';
          if (category === 'MODERATE') return vault.riskScore === 'MEDIUM';
          return vault.riskScore === category;
        case 'range':
          return vault.rangeStrategyType === category;
        case 'tvl':
          if (category === 'Whitelisted Pools') {
            return vault.allowDeposit && (!vault.tvlStrategyType || vault.tvlStrategyType === 'UNSET');
          }
          return vault.tvlStrategyType === category.replace(' ', '_').toUpperCase();
      }
    }).map(vault => ({
      name: vault.name,
      chainId: vault.chainId,
      address: vault.vaultAddress
    }));
  };

  const vaultsByAccess = {
    public: vaults.filter(v => v.allowDeposit).sort((a, b) => b.tvl - a.tvl),
    private: vaults.filter(v => !v.allowDeposit).sort((a, b) => b.tvl - a.tvl)
  };

  const handleVaultClick = (chainId: number, address: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    window.open(`https://defi.krystal.app/vaults/${chainId}/${address}`, '_blank');
  };

  const renderVaultList = (vaultList: Vault[], isPublic: boolean) => (
    <div className="flex-1 bg-secondary/10 rounded-xl p-4 hover:bg-secondary/20 transition-colors">
      <div className="grid grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-dark">
        {vaultList.map((vault, index) => (
          <AccessVaultCard
            key={index}
            vault={vault}
            onVaultClick={handleVaultClick}
          />
        ))}
      </div>
    </div>
  );

  const renderDistributionChart = (data: DistributionData[], title: string, color: string) => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ChartContainer
            config={{
              bar: { theme: { light: color, dark: color } },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data.filter(item => !item.name.includes('Unset'))} 
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                barSize={30}
              >
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(value) => `${Math.round((value / totalVaults) * 100)}%`}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload as DistributionData;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="font-medium">{data.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Count: {data.value} ({((data.value / totalVaults) * 100).toFixed(1)}%)
                          </div>
                          {data.vaultLinks && data.vaultLinks.length > 0 && (
                            <div className="text-sm">
                              <div className="font-medium mb-1">Vaults:</div>
                              <div className="max-h-[150px] overflow-y-auto space-y-1">
                                {data.vaultLinks.map((vault, index) => (
                                  <button
                                    key={index}
                                    onClick={(e) => handleVaultClick(vault.chainId, vault.address, e)}
                                    className="flex items-center gap-1 w-full text-left text-muted-foreground hover:text-foreground group cursor-pointer"
                                  >
                                    <span className="truncate">{vault.name}</span>
                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                  className={cn("fill-[--color-bar]")}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );

  const riskData: DistributionData[] = [
    { 
      name: 'Low', 
      value: riskProfile.LOW,
      vaultLinks: getVaultsByCategory('LOW', 'risk')
    },
    { 
      name: 'Moderate', 
      value: riskProfile.MODERATE,
      vaultLinks: getVaultsByCategory('MODERATE', 'risk')
    },
    { 
      name: 'High', 
      value: riskProfile.HIGH,
      vaultLinks: getVaultsByCategory('HIGH', 'risk')
    }
  ];
  
  if (riskProfile.ELEVATED) {
    riskData.push({ 
      name: 'Elevated', 
      value: riskProfile.ELEVATED,
      vaultLinks: getVaultsByCategory('ELEVATED', 'risk')
    });
  }
  
  const rangeData: DistributionData[] = [
    { 
      name: 'Wide Range', 
      value: rangeStrategy.WIDE_RANGE,
      vaultLinks: getVaultsByCategory('WIDE_RANGE', 'range')
    },
    { 
      name: 'Narrow Range', 
      value: rangeStrategy.NARROW_RANGE,
      vaultLinks: getVaultsByCategory('NARROW_RANGE', 'range')
    }
  ];
  
  const tvlData: DistributionData[] = [
    { 
      name: 'Low TVL', 
      value: tvlStrategyType.LOW_TVL,
      vaultLinks: getVaultsByCategory('LOW_TVL', 'tvl')
    },
    { 
      name: 'Medium TVL', 
      value: tvlStrategyType.MED_TVL,
      vaultLinks: getVaultsByCategory('MED_TVL', 'tvl')
    },
    { 
      name: 'High TVL', 
      value: tvlStrategyType.HIGH_TVL,
      vaultLinks: getVaultsByCategory('HIGH_TVL', 'tvl')
    },
    { 
      name: 'Whitelisted Pools', 
      value: tvlStrategyType.WHITELISTED_POOLS || 0,
      vaultLinks: getVaultsByCategory('Whitelisted Pools', 'tvl')
    }
  ];

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-1 gap-2.5">
        {/* Public Vaults Section */}
        <Collapsible open={publicOpen} onOpenChange={setPublicOpen} className="w-full">
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex items-center justify-between py-4 px-5 rounded-xl bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] border-[#1f1f1f] transition-all duration-200"
            >
              <span className="font-medium text-white text-base flex items-center gap-2.5">
                <LockOpen className="w-5 h-5" />
                Public Vaults
                <span className="ml-1 text-sm text-white/60 font-normal">
                  ({vaultsByAccess.public.length})
                </span>
              </span>
              {publicOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2.5">
            <div className="bg-[rgba(255,255,255,0.02)] rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-dark">
                {vaultsByAccess.public.map((vault, index) => (
                  <AccessVaultCard
                    key={index}
                    vault={vault}
                    onVaultClick={handleVaultClick}
                  />
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Private Vaults Section */}
        <Collapsible open={privateOpen} onOpenChange={setPrivateOpen} className="w-full">
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex items-center justify-between py-4 px-5 rounded-xl bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] border-[#1f1f1f] transition-all duration-200"
            >
              <span className="font-medium text-white text-base flex items-center gap-2.5">
                <Lock className="w-5 h-5" />
                Private Vaults
                <span className="ml-1 text-sm text-white/60 font-normal">
                  ({vaultsByAccess.private.length})
                </span>
              </span>
              {privateOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2.5">
            <div className="bg-[rgba(255,255,255,0.02)] rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-dark">
                {vaultsByAccess.private.map((vault, index) => (
                  <AccessVaultCard
                    key={index}
                    vault={vault}
                    onVaultClick={handleVaultClick}
                  />
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Distribution Charts Section */}
        <Collapsible open={chartsOpen} onOpenChange={setChartsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex items-center justify-between py-4 px-5 rounded-xl bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] border-[#1f1f1f] transition-all duration-200"
            >
              <span className="font-medium text-white text-base flex items-center gap-2.5">
                <BarChart2 className="w-5 h-5" />
                Distribution Charts
              </span>
              {chartsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2.5">
            <div className="bg-[rgba(255,255,255,0.02)] rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {renderDistributionChart(riskData, 'Risk Distribution', '#8b5cf6')}
                {renderDistributionChart(rangeData, 'Range Distribution', '#0ea5e9')}
                {renderDistributionChart(tvlData, 'TVL Distribution', '#f97316')}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default MetricsDistributionCharts;
