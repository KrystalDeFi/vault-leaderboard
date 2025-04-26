import { VaultResponse } from '../types/vault';

export const API_BASE_URL = 'https://api.krystal.app/all/v1/vaults';

type FetchVaultsOptions = {
  category?: string;
  userAddress?: string;
};

export const fetchVaults = async (options: FetchVaultsOptions = {}): Promise<VaultResponse> => {
  const {
    category = 'ALL_VAULT',
    userAddress = '',
  } = options;

  const queryParams = new URLSearchParams({
    perPage: '2000',
    category,
    userAddress,
  });

  try {
    const response = await fetch(`${API_BASE_URL}?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching vault data:', error);
    throw error;
  }
};

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
