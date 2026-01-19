export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logo: string;
  tag: string;
}

export interface TokenQuote {
  symbol: string;
  price: number;
  value: number;
}

export interface TokenWithBalance {
  token: Token;
  tokenType: string;
  tokenID: string;
  balance: string;
  quotes: {
    usd: TokenQuote;
  };
  percentage: number;
}

export interface PoolDetail {
  chainId: number;
  chainLogo: string;
  chainName: string;
  poolAddress: string;
  tickSpacing: number;
  fee: number;
  project: string;
  projectLogo: string;
  protocol: string;
  tvl: number;
  tokens: TokenWithBalance[];
}

export interface UserPerformance {
  shares: number;
  value: number;
  pnl24hChange: number;
  pnlUsd: number;
  pnlPrinciple: number;
  totalDepositValue: number;
  totalDepositPrinciple: number;
  totalWithdrawValue: number;
  totalWithdrawPrinciple: number;
}

export interface Owner {
  address: string;
  followers: number;
  twitterUsername: string;
  avatarUrl: string;
}

export interface Vault {
  chainId: number;
  chainName: string;
  chainLogo: string;
  vaultAddress: string;
  ownerAddress: string;
  owner: Owner;
  name: string;
  lpValue: number;
  feeGenerated: number;
  pnl: number;
  tvl: number;
  apr: number;
  status: string;
  ageInSecond: number;
  tokens: TokenWithBalance[];
  assets: TokenWithBalance[];
  supportedPoolAddresses: string[];
  pools: PoolDetail[];
  totalUser: number;
  totalSupply: string;
  rangeStrategyType: string;
  tvlStrategyType: string;
  principalToken: Token;
  allowDeposit: boolean;
  riskScore: 'LOW' | 'MEDIUM' | 'ELEVATED' | 'HIGH';
  userPerformance: UserPerformance;
  earning24h: number;
  earning30d: number;
  isAutoFarmVault?: boolean;
}

export type VaultType = 'shared' | 'autofarm';

export interface VaultResponse {
  data: Vault[];
  pagination: {
    totalData: number;
    totalPage: number;
    page: number;
    perPage: number;
  };
  stats: {
    totalOwnedVault: number;
    totalJoinedVault: number;
    totalVault: number;
    userShareValue: number;
    vaultTotalValue: number;
    depositedValue: number;
    dailyYield: number;
    monthlyYeild: number;
    apy: number;
  };
}

export interface BuilderMetrics {
  owner: string;
  totalVaults: number;
  totalTVL: number;
  totalFeeGenerated: number;
  averageAPR: number;
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
  depositAllowedCount: number;
  totalUsers: number;
  principalTokens: string[];
  ownerInfo: Owner;
}

export interface FilterOptions {
  principalToken: string | null;
  riskLevel: string | null;
  minAPR: number | null;
  maxAPR: number | null;
  tvlRange: string | null;
  rangeStrategy: string | null;
  allowDeposit: boolean | null;
  search: string;
  chainId: number | null;
}

export enum SortField {
  FEES = 'fees',
  USERS = 'users',
  VAULTS = 'vaults',
  TVL = 'tvl',
  APR = 'apr',
  PNL = 'pnl',
  FEE_REBATE = 'feeRebate',
  OWNER = 'owner',
  RISK = 'risk',
  DAILY_YIELD = 'dailyYield'
}

export interface SortOptions {
  field: SortField;
  direction: 'asc' | 'desc';
}
