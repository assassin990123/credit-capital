interface tokenInfo {
  allowance: number;
  balance: number;
}

export interface TokenState {
  capl: tokenInfo;
  usdc: tokenInfo;
  lp: tokenInfo;
}
