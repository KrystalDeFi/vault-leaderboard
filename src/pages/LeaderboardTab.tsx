
import React from 'react';
import WeeklyLeaderboard from '@/components/WeeklyLeaderboard';
import { Vault } from '@/types/vault';

interface LeaderboardTabProps {
  vaults: Vault[];
  loading: boolean;
}

const LeaderboardTab: React.FC<LeaderboardTabProps> = ({ vaults, loading }) => {
  // Just wraps the provided leaderboard
  return (
    <WeeklyLeaderboard vaults={vaults} loading={loading} />
  );
};

export default LeaderboardTab;
