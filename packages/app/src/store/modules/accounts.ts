/*eslint prefer-const: "warn"*/
import detectEthereumProvider from '@metamask/detect-provider'
import { markRaw } from "vue";
import { Commit, Dispatch } from 'vuex';
import { AccountState } from "@/models/accounts"
import { ethers } from 'ethers';

const ChainID = process.env.VUE_APP_NETWORK_ID
  ? process.env.VUE_APP_NETWORK_ID
  : "1";

const state = {
  activeAccount: null,
  activeBalance: 0,
  chainId: null,
  web3Provider: null,
  isConnected: false,
};

const getters = {
  getActiveAccount(state: AccountState) {
    if (!state.activeAccount) {
      return (window as any).ethereum.selectedAddress;
    }
    return state.activeAccount;
  },
  getActiveBalanceWei(state: AccountState) {
    return state.activeBalance;
  },
  getChainId(state: AccountState) {
    return state.chainId;
  },
  isUserConnected(state: AccountState) {
    return state.isConnected;
  },
};

const actions = {
  // @ts-ignore
  async connectWeb3({ commit, dispatch }: { commit: Commit, dispatch: Dispatch }) {
    if (state.isConnected == true) return;

    const provider:any = await detectEthereumProvider();

    if (provider) {
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
      await actions.checkNetwork();
      commit("setIsConnected", true);
      commit("setActiveAccount", accounts[0]);
      commit("setWeb3Provider", markRaw(new ethers.providers.Web3Provider(provider, "any")));
      // listen in
      await actions.ethereumListener({ commit })
    }

    dispatch("contracts/setContracts", null, { root: true });
    dispatch("balancer/getPoolTokens", null, { root: true });

    // actions.fetchActiveBalance({ commit });
  },

  async ethereumListener({ commit }: { commit: Function }) {
    (window as any).ethereum.on("accountsChanged", (accounts: any) => {
      if (state.isConnected) {
        commit("setActiveAccount", accounts[0]);
        commit("setWeb3Provider", state.web3Provider);
        actions.fetchActiveBalance({ commit });
      }
    });

    (window as any).ethereum.on("chainChanged", async (chainId: any) => {
      await actions.checkNetwork();
      commit("setChainData", chainId);
      commit("setWeb3Provider", state.web3Provider);
      // actions.fetchActiveBalance({ commit });
    });
  },

  async fetchActiveBalance({ commit }: { commit: Function }) {
    // @ts-ignore
    // TODO: add  web3Provider type
    const balance = await state.web3Provider?.getBalance(state.activeAccount);
    commit("setActiveBalance", balance);
  },
  
  async checkNetwork() {
    if ((window as any).ethereum) {
      const hexadecimal = "0x" + parseInt(ChainID).toString(16);

      try {
        // check if the chain to connect to is installed
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: hexadecimal }], // chainId must be in hexadecimal numbers
        });
      } catch (error: any) {
        // This error code indicates that the chain has not been added to MetaMask
        // if it is not, then install it into the user MetaMask
        if (error.code === 4902) {
          try {
            await (window as any).ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: hexadecimal,
                  rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
                },
              ],
            });
          } catch (addError) {
            console.error(addError);
          }
        }
        console.error(error);
      }
    }
  },
};

const mutations = {
  setActiveAccount(state: AccountState, selectedAddress: string) {
    state.activeAccount = selectedAddress;
  },

  setActiveBalance(state: AccountState, balance: number) {
    state.activeBalance = balance;
  },

  setChainData(state: AccountState, chainId: number) {
    state.chainId = chainId;
  },
  setIsConnected(state: AccountState, isConnected: boolean) {
    state.isConnected = isConnected;
    // add to persistent storage so that the user can be logged back in when revisiting website
    localStorage.setItem("isConnected", `${isConnected}`);
  },
  setWeb3Provider(state: AccountState, provider: any) {
    state.web3Provider = provider
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
