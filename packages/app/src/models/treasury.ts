interface balances {
  token: string;
  balance: number;
}

export interface TreasuryState {
  aum: number;
  balances: balances[];
}
