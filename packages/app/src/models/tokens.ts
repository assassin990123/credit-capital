interface tokenInfo {
  balancerVaultAllowance: number;
  rewardsAllowance: number;
}

export interface TokenState {
  capl: tokenInfo;
  usdc: tokenInfo;
}
