export interface AccountState {
  activeAccount: string | null;
  activeBalance: number;
  chainId: number | null;
  web3Provider: any;
  isConnected: boolean;
}
