/*eslint prefer-const: "warn"*/
import detectEthereumProvider from "@metamask/detect-provider";
import { markRaw } from "vue";
import { Commit, Dispatch } from "vuex";
import { AccountState } from "@/models/accounts";
import { ethers } from "ethers";
import { checkWalletConnect } from "@/utils/notifications";

const ChainID = process.env.VUE_APP_NETWORK_ID
  ? process.env.VUE_APP_NETWORK_ID
  : "1";

const state: AccountState = {
  activeAccount: null,
  chainId: null,
  web3Provider: null,
  isConnected: false,
  signer: null,
};
interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}

const getters = {
  getActiveAccount(state: AccountState) {
    if (!state.activeAccount) {
      return (window as any).ethereum.selectedAddress;
    }
    return state.activeAccount;
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
  async connectWeb3({
    commit,
    dispatch,
  }: {
    commit: Commit;
    dispatch: Dispatch;
  }) {
    if (state.isConnected == true) return;

    let provider: any = await detectEthereumProvider();

    provider = new ethers.providers.Web3Provider(provider);

    if (provider) {
      if (!await (window as any).ethereum._metamask.isUnlocked()) {
        checkWalletConnect();
      } else {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        await actions.checkNetwork();
        commit("setIsConnected", true);
        commit("setActiveAccount", accounts[0]);
        commit("setWeb3Provider", markRaw(provider));
        const signer = provider.getSigner(state.activeAccount);
        commit("setWeb3Signer", markRaw(signer));
      }

      // listen in
      await actions.ethereumListener({ commit });
    }

    await dispatch("contracts/setContracts", null, { root: true });
    await dispatch("balancer/getPoolTokens", null, { root: true });
    await dispatch("tokens/getAllowances", null, { root: true });
  },

  async ethereumListener({ commit }: { commit: Function }) {
    (window as any).ethereum.on("accountsChanged", (accounts: any) => {
      // If user has locked/logout from MetaMask, this resets the accounts array to empty
      if (!accounts.length) {
        // logic to handle what happens once MetaMask is locked
        commit("setIsConnected", false);
        localStorage.removeItem("isConnected");
      }

      if (state.isConnected) {
        commit("setActiveAccount", accounts[0]);
        commit("setWeb3Provider", state.web3Provider);
      }
    });

    (window as any).ethereum.on("chainChanged", async (chainId: any) => {
      await actions.checkNetwork();
      commit("setChainData", chainId);
      commit("setWeb3Provider", state.web3Provider);
    });

    (window as any).ethereum.on('disconnect', async (error: ProviderRpcError) => {
      try {
        // remove the connection state from localstorage
        localStorage.removeItem("isConnected");

        // reload page
        window.location.reload();
      } catch (e) {
        console.error("error: ", error.message);
      }
    });
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

  setChainData(state: AccountState, chainId: number) {
    state.chainId = chainId;
  },
  setIsConnected(state: AccountState, isConnected: boolean) {
    state.isConnected = isConnected;
    // add to persistent storage so that the user can be logged back in when revisiting website
    localStorage.setItem("isConnected", `${isConnected}`);
  },
  setWeb3Provider(state: AccountState, provider: any) {
    state.web3Provider = provider;
  },
  setWeb3Signer(state: AccountState, signer: any) {
    state.signer = signer;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
