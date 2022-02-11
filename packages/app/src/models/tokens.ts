interface tokenInfo {
  allowance: number;
}

export interface TokenState {
  capl: tokenInfo;
  usdc: tokenInfo;
  lp: tokenInfo;
}
