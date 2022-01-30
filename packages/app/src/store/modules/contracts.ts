// @ts-nocheck
import { ethers } from "ethers";
import {caplABI, rewardsABI, vaultABI} from "../../contracts/abi"
import {capl, vault, rewards} from "../../contracts"
import { markRaw } from "vue";

const ChainID = process.env.VUE_APP_NETWORK_ID ? Number(process.env.VUE_APP_NETWORK_ID) : 1 ;


const state = {
  rewardsContract: null,
  vaultContract: null,
  caplContract: null,
  caplBalance: 0
};

const getters = {
  getCAPLContract(state) {
    return state.caplContract;
  },
  getVaultContract(state) {
    return state.calcAbi;
  },
  getVaultContract(state) {
    return state.calcContract;
  },
  getCAPLBalance(state) {
    return state.caplBalance;
  }
};

const actions = {
  async setContracts({ commit, rootState }) {
    const provider = rootState.accounts.web3Provider;
    commit("setCAPLContract", markRaw(new ethers.Contract(capl[ChainID], caplABI, provider)))
    commit("setVaultContract", markRaw(new ethers.Contract(vault[ChainID], vaultABI, provider)))
    commit("setRewardsContract", markRaw(new ethers.Contract(rewards[ChainID], rewardsABI, provider)))
  },

  async getCAPLBalance({commit, rootState}) {

    // get address from rootstate,
    const address = rootState.accounts[0];

    // get contract from contract state (local state)
    if (state.caplContract === null) {
      this.setContracts(rootState);
    }

    const caplContract = state.caplContract;

    // get balance
    let balance = await caplContract.methods.balanceOf(address);

    // parse balance, set new value in the local state
    commit("setCAPLBalance", balance);
  }
  
};

const mutations = {
  setCAPLContract(state, _contract) {
    state.caplContract = _contract;
  },
  setVaultContract(state, _contract) {
    state.vaultContract = _contract
  },
  setRewardsContract(state, _contract) {
    state.rewardsContract = _contract
  },
  setCAPLBalance(state, _balance) {
    state.caplBalance = _balance
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};