import { VaultResponse } from '../types/vault';

export const API_BASE_URL = 'https://api.krystal.app/all/v1/vaults';

type FetchVaultsOptions = {
  category?: string;
  userAddress?: string;
  isAutoFarmVault?: boolean;
};

export async function fetchVaults(options: FetchVaultsOptions = {}): Promise<VaultResponse> {
  const { category = 'ALL_VAULT', userAddress, isAutoFarmVault } = options;
  
  try {
    const queryParams = new URLSearchParams({
      perPage: '2000',
      category: category
    });
    if (userAddress) queryParams.set('userAddress', userAddress);
    if (isAutoFarmVault !== undefined) {
      queryParams.set('isAutoFarmVault', String(isAutoFarmVault));
    }

    const response = await fetch(`${API_BASE_URL}?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch vaults');
    }

    const data = await response.json();
    console.log('API Response - Raw Vaults:', data.data?.map(v => ({
      name: v.name,
      chainId: v.chainId,
      vaultAddress: v.vaultAddress,
      chainName: v.chainName,
      isAutoFarmVault: v.isAutoFarmVault
    })));
    
    return data;
  } catch (error) {
    console.error('Error fetching vaults:', error);
    throw error;
  }
}

export async function fetchAllVaults(): Promise<VaultResponse> {
  const [sharedResponse, autoFarmResponse] = await Promise.all([
    fetchVaults({ isAutoFarmVault: false }),
    fetchVaults({ isAutoFarmVault: true }),
  ]);

  return {
    data: [...sharedResponse.data, ...autoFarmResponse.data],
    pagination: {
      totalData: sharedResponse.pagination.totalData + autoFarmResponse.pagination.totalData,
      totalPage: 1,
      page: 1,
      perPage: 2000,
    },
    stats: sharedResponse.stats,
  };
}

export const formatNumber = (num: number, digits = 2): string => {
  if (num === undefined || num === null) return '0';
  
  if (num < 0.01 && num > 0) {
    return '<0.01';
  }

  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(digits)}M`;
  } else if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(digits)}K`;
  } else {
    return `$${num.toFixed(digits)}`;
  }
};

export const formatPercentage = (value: number): string => {
  if (value === undefined || value === null) return '0%';
  
  if (value < 0.01 && value > 0) {
    return '<0.01%';
  }
  
  return `${(value * 100).toFixed(2)}%`;
};

export const shortenAddress = (address: string | undefined | null): string => {
  if (!address || typeof address !== 'string') return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const calculateDaysAgo = (ageInSeconds: number): string => {
  const days = Math.floor(ageInSeconds / (24 * 60 * 60));
  
  if (days === 0) {
    const hours = Math.floor(ageInSeconds / (60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(ageInSeconds / 60);
      return `${minutes} min ago`;
    }
    return `${hours} hr ago`;
  }
  
  return `${days} day${days !== 1 ? 's' : ''} ago`;
};
