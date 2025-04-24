import React from 'react';
import { BuilderMetrics, Vault } from '@/types/vault';
import { formatNumber, formatPercentage, shortenAddress } from '@/services/api';
import { cn } from '@/lib/utils';
import { Award, Wallet, Users, Target, Trophy, Copy, Twitter, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import MetricsDistributionCharts from './MetricsDistributionCharts';

interface OwnerMetricsProps {
  metrics: BuilderMetrics;
  rank?: number;
  vaults?: Vault[];
}

const OwnerMetrics = ({ metrics, rank, vaults = [] }: OwnerMetricsProps) => {
  const { toast } = useToast();
  
  const getExpertiseTag = () => {
    if (metrics.totalVaults >= 5 && metrics.averageAPR > 0.3) {
      return { 
        tag: "Yield Pro", 
        color: "bg-[#6366F1]/5 text-[#818CF8]/90 hover:bg-[#6366F1]/10 hover:text-[#818CF8]", 
        icon: <Trophy className="w-3.5 h-3.5" /> 
      };
    } else if (metrics.riskProfile.HIGH > metrics.riskProfile.LOW && metrics.averageAPR > 0.4) {
      return { 
        tag: "Degen Farmer", 
        color: "bg-[#EC4899]/5 text-[#F472B6]/90 hover:bg-[#EC4899]/10 hover:text-[#F472B6]", 
        icon: <Target className="w-3.5 h-3.5" /> 
      };
    } else if (metrics.riskProfile.LOW > metrics.riskProfile.HIGH) {
      return { 
        tag: "Risk Averse", 
        color: "bg-[#10B981]/5 text-[#34D399]/90 hover:bg-[#10B981]/10 hover:text-[#34D399]", 
        icon: <Award className="w-3.5 h-3.5" /> 
      };
    } else {
      return { 
        tag: "Vault Builder", 
        color: "bg-[#60A5FA]/5 text-[#93C5FD]/90 hover:bg-[#60A5FA]/10 hover:text-[#93C5FD]", 
        icon: <Wallet className="w-3.5 h-3.5" /> 
      };
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-[#FFE567]";
    if (rank === 2) return "text-[#B4B6BC]";
    if (rank === 3) return "text-[#FFAD7D]";
    return "text-white/60";
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <Trophy className={cn("w-8 h-8", getRankColor(rank))} />;
    }
    return null;
  };

  const expertiseInfo = getExpertiseTag();

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(metrics.owner);
    toast({
      description: "Address copied to clipboard",
      duration: 2000
    });
  };

  const handleTwitterClick = () => {
    if (metrics.ownerInfo.twitterUsername) {
      window.open(`https://twitter.com/${metrics.ownerInfo.twitterUsername}`, '_blank');
    }
  };

  const handleVaultsClick = () => {
    window.open(`https://defi.krystal.app/account/${metrics.owner}/positions?tab=Vaults#owned_vaults`, '_blank');
  };

  const getAvatarFallback = () => {
    if (metrics.ownerInfo.twitterUsername) {
      return metrics.ownerInfo.twitterUsername.slice(0, 2).toUpperCase();
    }
    const addressWithoutPrefix = metrics.owner.replace(/^0x/, '');
    return addressWithoutPrefix.slice(0, 2).toUpperCase();
  };

  return (
    <div className="rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] p-4 shadow-sm hover:translate-y-[-1px] transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-4">
          {rank && (
            <div className="flex flex-col items-center">
              {getRankIcon(rank)}
              <div className={cn(
                "text-2xl font-bold mt-1",
                getRankColor(rank)
              )}>
                #{rank}
              </div>
              <div className="text-xs font-medium text-white/60">Rank</div>
            </div>
          )}
          <div>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-[#1f1f1f] hover:ring-[#2f2f2f] transition-all cursor-pointer">
                <AvatarImage src={metrics.ownerInfo.avatarUrl} alt={metrics.ownerInfo.twitterUsername || 'Builder'} />
                <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleCopyAddress}
                    className="font-medium text-lg text-white hover:text-white/90 transition-colors"
                  >
                    {shortenAddress(metrics.owner)}
                  </button>
                  <button 
                    onClick={handleCopyAddress}
                    className="p-1.5 rounded-full hover:bg-white/5 transition-colors"
                  >
                    <Copy className="w-4 h-4 text-white/60" />
                  </button>
                  {metrics.ownerInfo.twitterUsername && (
                    <button 
                      onClick={handleTwitterClick}
                      className="p-1.5 rounded-full hover:bg-white/5 transition-colors"
                    >
                      <Twitter className="w-4 h-4 text-white/60" />
                    </button>
                  )}
                </div>
                <div className="text-sm text-white/60 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {metrics.totalUsers} users
                  <span>•</span>
                  <div 
                    onClick={handleVaultsClick}
                    className="flex items-center gap-1 group cursor-pointer rounded-full px-3 py-1 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    {metrics.totalVaults} vaults
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={cn(
          "text-xs rounded-full px-2.5 py-1 flex items-center gap-1.5 font-medium",
          expertiseInfo.color
        )}>
          {expertiseInfo.icon}
          {expertiseInfo.tag}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] transition-colors rounded-xl p-5">
          <div className="text-sm text-white/60 mb-1 font-medium">Total TVL</div>
          <div className="text-xl font-semibold text-white">{formatNumber(metrics.totalTVL)}</div>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] transition-colors rounded-xl p-5">
          <div className="text-sm text-white/60 mb-1 font-medium">Avg. APR</div>
          <div className="text-xl font-semibold text-white">
            {formatPercentage(metrics.averageAPR)}
          </div>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] transition-colors rounded-xl p-5">
          <div className="text-sm text-white/60 mb-1 font-medium">Fees Generated</div>
          <div className="text-xl font-semibold text-white">
            {formatNumber(metrics.totalFeeGenerated)}
          </div>
        </div>
      </div>

      <MetricsDistributionCharts
        riskProfile={metrics.riskProfile}
        rangeStrategy={metrics.rangeStrategy}
        tvlStrategyType={metrics.tvlStrategyType}
        totalVaults={metrics.totalVaults}
        vaults={vaults}
      />
    </div>
  );
};

export default OwnerMetrics;
