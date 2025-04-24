
import React from "react";
import { Trophy, Award, Medal } from "lucide-react";

interface PodiumBadgeProps {
  rank: number;
}

const PodiumBadge = ({ rank }: PodiumBadgeProps) => {
  switch (rank) {
    case 1:
      return (
        <span
          title="1st place"
          className="inline-flex items-center px-2 py-1 rounded bg-gradient-to-tr from-yellow-400 via-yellow-300 to-yellow-200 text-yellow-900 font-bold"
        >
          <Trophy className="w-4 h-4 mr-1" />🥇
        </span>
      );
    case 2:
      return (
        <span
          title="2nd place"
          className="inline-flex items-center px-2 py-1 rounded bg-gradient-to-tr from-gray-200 to-gray-300 text-gray-700 font-bold"
        >
          <Medal className="w-4 h-4 mr-1" />🥈
        </span>
      );
    case 3:
      return (
        <span
          title="3rd place"
          className="inline-flex items-center px-2 py-1 rounded bg-gradient-to-tr from-orange-200 to-orange-300 text-orange-700 font-bold"
        >
          <Award className="w-4 h-4 mr-1" />🥉
        </span>
      );
    default:
      return (
        <span
          className="inline-flex items-center font-mono text-xs text-muted-foreground w-6 justify-center"
          aria-label={`Rank ${rank}`}
        >
          {rank}
        </span>
      );
  }
};

export default PodiumBadge;
