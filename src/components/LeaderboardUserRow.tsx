
import React, { useState } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import PodiumBadge from "./PodiumBadge";
import UserProfileModal from "./UserProfileModal";
import { shortenAddress } from "@/services/api";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface LeaderboardUserRowProps {
  user: {
    address: string;
    name?: string;
    transactions: number;
    totalValue: number;
    preferredToken?: string;
    change: number;
    rank: number;
    weeklyHistory?: number[];
  };
  displayRank: number; // Explicit display rank for the row
}

const HIGHLIGHTED_ROW = 10;

const LeaderboardUserRow = ({ user, displayRank }: LeaderboardUserRowProps) => {
  const [open, setOpen] = useState(false);
  const isPositive = user.change > 0;
  const trendColor = isPositive ? "text-green-500" : "text-red-500";
  const isTopThree = displayRank <= 3;
  const isTopTen = displayRank <= HIGHLIGHTED_ROW;

  const medalTooltip = displayRank === 1
    ? "🥇 Rank 1 this week"
    : displayRank === 2
    ? "🥈 Rank 2 this week"
    : displayRank === 3
    ? "🥉 Rank 3 this week"
    : displayRank <= HIGHLIGHTED_ROW
    ? `Top ${HIGHLIGHTED_ROW} this week`
    : undefined;

  return (
    <>
      <tr
        className={cn(
          "group cursor-pointer border-t border-muted transition-all duration-150 unified-table-row",
          isTopThree 
            ? "hover:bg-[rgba(255,255,255,0.05)] font-semibold" 
            : isTopTen
            ? "bg-card/60 hover:bg-[rgba(255,255,255,0.05)] font-semibold"
            : "hover:bg-[rgba(255,255,255,0.05)]",
          "outline-none",
          "focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2",
          isTopTen ? "rounded-md" : "",
        )}
        onClick={() => setOpen(true)}
        tabIndex={0}
        aria-label={`View profile for ${user.name || user.address}`}
        style={{
          minHeight: 64,
          height: 64,
        }}
      >
        <td className="pl-4 pr-1 py-3 align-middle min-w-[52px] text-left">
          {medalTooltip ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <PodiumBadge rank={displayRank} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs p-2 rounded-md">
                  {medalTooltip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <PodiumBadge rank={displayRank} />
          )}
        </td>
        <td className="flex items-center gap-3 min-w-[180px] py-3">
          <span className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full border border-muted bg-background overflow-hidden flex items-center">
            <Jazzicon diameter={32} seed={jsNumberForAddress(user.address)} />
          </span>
          <span className="font-bold text-[16px] text-foreground font-inter">
            {user.name ? (
              <span>{user.name}</span>
            ) : (
              <span className="text-muted-foreground">{shortenAddress(user.address)}</span>
            )}
          </span>
        </td>
        <td className="text-right min-w-[90px] pr-3 py-3 font-medium text-[14px]">{user.transactions}</td>
        <td className="text-right min-w-[108px] pr-3 py-3 font-medium text-[14px]">${user.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
        <td className="text-right min-w-[110px] pr-5 py-3 font-medium text-[14px]">
          <div className="flex items-center justify-end gap-1">
            <span className={cn(trendColor, "font-semibold flex items-center gap-0.5")}>
              {isPositive ? (
                <ArrowUp className="w-4 h-4 mr-0.5 inline" />
              ) : (
                <ArrowDown className="w-4 h-4 mr-0.5 inline" />
              )}
              {Math.abs(user.change).toFixed(1)}%
            </span>
          </div>
        </td>
      </tr>
      <UserProfileModal
        open={open}
        onOpenChange={setOpen}
        address={user.address}
        name={user.name}
        stats={{
          transactions: user.transactions,
          totalValue: user.totalValue,
          preferredToken: user.preferredToken,
          change: user.change,
        }}
      />
    </>
  );
};

export default LeaderboardUserRow;
