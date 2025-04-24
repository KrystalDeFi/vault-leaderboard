import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchVaults } from '@/services/api';
import { Vault } from '@/types/vault';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Vault as VaultIcon, Compass } from 'lucide-react';
import LeaderboardTab from './LeaderboardTab';
import VaultBuildersTab from './VaultBuildersTab';
import DiscoverVaultsTab from './DiscoverVaultsTab';
import { useBuilderMetrics } from '@/hooks/useBuilderData';

const Index = () => {
  const { toast } = useToast();
  const [vaults, setVaults] = React.useState<Vault[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [activeTab, setActiveTab] = React.useState<"leaderboard" | "builders" | "discover">("leaderboard");

  React.useEffect(() => {
    const loadVaults = async () => {
      try {
        setLoading(true);
        const response = await fetchVaults();
        setVaults(response.data);
        toast({
          title: "Vaults loaded successfully",
          description: `Found ${response.data.length} vaults`,
        });
      } catch (error) {
        console.error("Error loading vaults:", error);
        toast({
          variant: "destructive",
          title: "Failed to load vaults",
          description: "Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadVaults();
  }, [toast]);

  const buildersMetrics = useBuilderMetrics(vaults);

  const handleTabChange = (value: string) => {
    setActiveTab(value as "leaderboard" | "builders" | "discover");
  };

  return (
    <div className="container mx-auto py-10 px-4 font-inter">
      <header className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6 font-inter text-white">
          Vault Arena
        </h1>
        <p className="text-3xl font-semibold mb-6 text-gray-300 font-inter">
          BUIDL. Compete. Win.
        </p>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto mt-6 mb-0 animate-fade-in font-inter">
          Where top vaults rise — powered by{" "}
          <span className="text-white font-semibold animate-pulse">yields</span>, driven by{" "}
          <span className="text-white font-semibold">data</span>
        </p>
      </header>

      <nav aria-label="Main navigation" className="flex flex-col items-center">
        <Tabs
          defaultValue="leaderboard"
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList
            className="mx-auto flex justify-center gap-4 sm:gap-6 mb-0 pb-0 unified-tabs-header"
            style={{ minHeight: 56 }}
          >
            <TabsTrigger value="leaderboard" className="unified-tab flex items-center gap-1 min-h-[44px] px-5">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="builders" className="unified-tab flex items-center gap-1 min-h-[44px] px-5">
              <VaultIcon className="h-4 w-4" />
              Vault Builders
            </TabsTrigger>
            <TabsTrigger value="discover" className="unified-tab flex items-center gap-1 min-h-[44px] px-5">
              <Compass className="h-4 w-4" />
              Discover Vaults
            </TabsTrigger>
          </TabsList>

          <div className="h-6" aria-hidden />

          <TabsContent value="leaderboard" className="animate-fade-in font-inter">
            <LeaderboardTab vaults={vaults} loading={loading} />
          </TabsContent>
          <TabsContent value="builders" className="animate-fade-in font-inter">
            <VaultBuildersTab buildersMetrics={buildersMetrics} vaults={vaults} loading={loading} />
          </TabsContent>
          <TabsContent value="discover" className="animate-fade-in font-inter">
            <DiscoverVaultsTab vaults={vaults} loading={loading} />
          </TabsContent>
        </Tabs>
      </nav>

      <footer className="text-center mt-8 mb-4">
        <p className="text-[13px] text-gray-500 max-w-[600px] mx-auto px-4">
          This page is open-sourced & built by the community. Join <a href="https://github.com/KrystalDeFi/vault-leaderboard" className="text-blue-400 hover:text-blue-300">our repo</a> to contribute. Have awesome LP tools? <a href="http://lp.krystal.app/discord" className="text-blue-400 hover:text-blue-300">Join our Discord</a> to request a [x.krystal.app] domain.
        </p>
      </footer>
    </div>
  );
};

export default Index;
