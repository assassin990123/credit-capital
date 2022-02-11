export interface AccountState {
  activeAccount: string | null;
  chainId: number | null;
  web3Provider: any;
  signer: any;
  isConnected: boolean;
}
