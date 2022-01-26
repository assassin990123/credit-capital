import Web3Modal, { IProviderOptions } from "web3modal";
import web3ModalSetup from "./web3ModalSetup";
import { store } from "../store";

export class web3Interface {
  provider: any;

  providerOptions: IProviderOptions = {};

  constructor() {}

  connect = async (): Promise<any> => {
    const web3Modal = web3ModalSetup();
    web3Modal.clearCachedProvider();
    try {
      this.provider = await web3Modal.connect();
      store.commit("setConnected", true);
      store.commit("setWalletAddress", this.provider.selectedAddress);
    } catch (e) {
      console.log(e);
    }

    // Here we will interface with vuex for state changes.

    // Subscribe to accounts change
    this.provider.on("accountsChanged", (accounts: string[]) => {
      store.commit("setWalletAddress", accounts[0]);
    });

    // Subscribe to chainId change
    this.provider.on("chainChanged", (chainId: number) => {
      console.log(chainId);
    });

    // Subscribe to provider disconnection
    this.provider.on(
      "disconnect",
      (error: { code: number; message: string }) => {
        console.log(error);
      }
    );
  };
}
