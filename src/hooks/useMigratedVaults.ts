import {
  useEffect,
  useState,
} from 'react';

const getChainName = (chainId: number): string => {
  switch (chainId) {
    case 1:
      return "Ethereum";
    case 137:
      return "Polygon";
    case 56:
      return "BSC";
    case 42161:
      return "Arbitrum";
    case 10:
      return "Optimism";
    case 43114:
      return "Avalanche";
    default:
      return "Unknown";
  }
};

const getChainLogo = (chainId: number): string => {
  switch (chainId) {
    case 1:
      return "/chains/ethereum.svg";
    case 137:
      return "/chains/polygon.svg";
    case 56:
      return "/chains/bsc.svg";
    case 42161:
      return "/chains/arbitrum.svg";
    case 10:
      return "/chains/optimism.svg";
    case 43114:
      return "/chains/avalanche.svg";
    default:
      return "/chains/unknown.svg";
  }
};

interface Owner {
  address: string;
  followers: number;
  twitterUsername: string;
  avatarUrl: string;
  website: string;
  verifiedLevel: string;
  xFollowersCount: number;
  displayName: string;
}

export interface MigratedVault {
  chainId: number;
  chainName: string;
  chainLogo: string;
  vaultName: string;
  vaultAddress: string;
  ownerAddress: string;
  owner: Owner | null;
  feeTokenAddress: string;
  feeAmountUsd: number;
  txnHash: string;
  blockTime: number;
}

export const useMigratedVaults = () => {
  const [migratedVaults, setMigratedVaults] = useState<MigratedVault[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMigratedVaults = async () => {
      try {
        setLoading(true);
        console.log('Fetching migrated vaults...');
        const response = await fetch('https://api.krystal.app/all/v1/vaults/convertedVault/rebateFees');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        // Handle different response formats
        let vaultsArray: MigratedVault[] = [];
        
        if (Array.isArray(data)) {
          vaultsArray = data;
        } else if (data && typeof data === 'object') {
          // If data is an object, try to find the array inside it
          if (data.data && Array.isArray(data.data)) {
            vaultsArray = data.data;
          } else if (data.vaults && Array.isArray(data.vaults)) {
            vaultsArray = data.vaults;
          } else if (data.result && Array.isArray(data.result)) {
            vaultsArray = data.result;
          } else {
            // If we can't find an array, try to convert the object to an array
            vaultsArray = Object.values(data);
          }
        }

        if (!Array.isArray(vaultsArray) || vaultsArray.length === 0) {
          console.error('No valid vault data found in response:', data);
          setMigratedVaults([]);
          setError('No vault data available');
          return;
        }

        setMigratedVaults(vaultsArray);
        setError(null);
      } catch (err) {
        console.error('Error fetching migrated vaults:', err);
        setMigratedVaults([]);
        setError(err instanceof Error ? err.message : 'Failed to fetch migrated vaults');
      } finally {
        setLoading(false);
      }
    };

    fetchMigratedVaults();
  }, []);

  return { migratedVaults, loading, error };
}; 