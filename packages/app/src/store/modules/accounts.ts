// @ts-nocheck
/*eslint prefer-const: "warn"*/
import Web3 from "web3";
import { ethers } from "ethers";
import web3ModalSetup from "../../utils/web3ModalSetup";
import { markRaw } from "vue";

const ChainID = process.env.VUE_APP_NETWORK_ID
  ? process.env.VUE_APP_NETWORK_ID
  : "1";

const state = {
  activeAccount: null,
  activeBalance: 0,
  chainId: null,
  chainName: null,
  web3Provider: null,
  isConnected: false,
  web3Modal: null,
};

const getters = {
  getActiveAccount(state) {
    if (!state.activeAccount) {
      return window.ethereum.selectedAddress;
    }

    return state.activeAccount;
  },
  getActiveBalanceWei(state) {
    return state.activeBalance;
  },
  getActiveBalanceEth(state) {
    return state.web3.utils.fromWei(state.activeBalance, "ether");
  },
  getChainId(state) {
    return state.chainId;
  },
  getChainName(state) {
    return state.chainName;
  },
  getWeb3(state) {
    if (state.web3) {
      return state.web3;
    } else {
      return new Web3(Web3.givenProvider);
    }
  },
  getWeb3Modal(state) {
    return state.web3Modal;
  },
  isUserConnected(state) {
    return state.isConnected;
  },
};

const actions = {
  async connectWeb3({ commit, dispatch }) {
    if (state.isConnected == true) return;
    let selectedAccount;
    let provider: any;

    if (window.ethereum) {
      await window.ethereum.enable();
      provider = markRaw(new ethers.providers.Web3Provider(window.ethereum));
      selectedAccount = window.ethereum.selectedAddress;
    } else {
      const web3Modal = web3ModalSetup();
      provider = await web3Modal.connect();
      selectedAccount = markRaw(provider.accounts[0]);
    }
    await actions.checkNetwork();
    commit("setIsConnected", true);
    commit("setActiveAccount", selectedAccount);
    commit("setChainData", window.ethereum.chainId);
    commit("setWeb3Provider", markRaw(provider));

    dispatch("contracts/setContracts", null, { root: true });
    // actions.fetchActiveBalance({ commit });
  },

  async disconnectWeb3Modal({ commit }) {
    commit("disconnectWallet");
    commit("setIsConnected", false);
  },

  async ethereumListener({ commit }) {
    window.ethereum.on("accountsChanged", (accounts) => {
      if (state.isConnected) {
        commit("setActiveAccount", accounts[0]);
        commit("setWeb3Provider", state.web3Provider);
        actions.fetchActiveBalance({ commit });
      }
    });

    window.ethereum.on("chainChanged", async (chainId) => {
      await actions.checkNetwork();
      commit("setChainData", chainId);
      commit("setWeb3Provider", state.web3Provider);
      // actions.fetchActiveBalance({ commit });
    });
  },

  async fetchActiveBalance({ commit }) {
    const balance = await state.web3Provider.getBalance(state.activeAccount);
    commit("setActiveBalance", balance);
  },
  async checkNetwork() {
    if (window.ethereum) {
      const hexadecimal = "0x" + parseInt(ChainID).toString(16);

      try {
        // check if the chain to connect to is installed
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: hexadecimal }], // chainId must be in hexadecimal numbers
        });
      } catch (error: any) {
        // This error code indicates that the chain has not been added to MetaMask
        // if it is not, then install it into the user MetaMask
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
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
  setActiveAccount(state, selectedAddress) {
    state.activeAccount = selectedAddress;
  },

  setActiveBalance(state, balance) {
    state.activeBalance = balance;
  },

  setChainData(state, chainId) {
    state.chainId = chainId;

    switch (chainId) {
      case "0x1":
        state.chainName = "Mainnet";
        break;
      case "0x2a":
        state.chainName = "Kovan";
        break;
      case "0x3":
        state.chainName = "Ropsten";
        break;
      case "0x4":
        state.chainName = "Rinkeby";
        break;
      case "0x5":
        state.chainName = "Goerli";
        break;
      case "0x539": // 1337 (often used on localhost)
      case "0x1691": // 5777 (default in Ganache)
      default:
        state.chainName = "Localhost";
        break;
    }
  },

  setWeb3Provider(state, web3Provider) {
    state.web3Provider = web3Provider;
  },

  setIsConnected(state, isConnected) {
    state.isConnected = isConnected;
    // add to persistent storage so that the user can be logged back in when revisiting website
    localStorage.setItem("isConnected", isConnected);
  },

  setWeb3ModalInstance(state, w3mObject) {
    state.web3Modal = w3mObject;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
