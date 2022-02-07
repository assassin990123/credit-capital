import { ethers } from "ethers";
import { caplABI, rewardsABI, vaultABI } from "@/abi";
import { contracts, tokens } from "@/constants";
import { markRaw } from "vue";
import { Commit } from "vuex";
import { findObjectContract } from "@/utils";
import { ContractState } from "@/models/contracts";
import { RootState } from "@/models";

const ChainID = process.env.VUE_APP_NETWORK_ID
  ? process.env.VUE_APP_NETWORK_ID
  : "1";

const state: ContractState = {
  rewardsContract: null,
  vaultContract: null,
  caplContract: null,
  caplBalance: 0,
  pendingRewards: 0,
};

const getters = {
  getCAPLContract(state: ContractState) {
    return state.caplContract;
  },
  getCAPLBalance(state: ContractState) {
    return state.caplBalance;
  },
  getRewardsContract(state: ContractState) {
    return state.rewardsContract;
  },
  getPendingRewards(state: ContractState) {
    return state.pendingRewards;
  }
};

const actions = {
  async setContracts({ commit, rootState }: {commit: Commit, rootState: RootState}) {
    const provider = rootState.accounts.web3Provider;
    const signer = provider.getSigner();
    try {
      commit(
        "setCAPLContract",
        markRaw(new ethers.Contract(findObjectContract('CAPL', tokens, ChainID), caplABI, provider))
      );
      commit(
        "setVaultContract",
        markRaw(new ethers.Contract(findObjectContract('rewardsVault', contracts, ChainID), vaultABI, signer))
      );
      commit(
        "setRewardsContract",
        markRaw(new ethers.Contract(findObjectContract('rewards', contracts, ChainID), rewardsABI, signer))
      );
    } catch (e) {
      console.log(e)
    }
  },

  async getCAPLBalance({ commit, rootState }: {commit: Commit, rootState: RootState}) {
    // get address from rootstate,
    const address = rootState.accounts.activeAccount;
    // get contract from contract state (local state)
    if (state.caplContract === null) {
      actions.setContracts({ commit, rootState });
    }

    const caplContract = state.caplContract;
    // @ts-ignore
    const caplBalance = await caplContract?.balanceOf(address);
    // parse balance, set new value in the local state
    commit("setCAPLBalance", ethers.utils.formatUnits(caplBalance, 18));
  },
  
  async getPendingRewards({ commit, rootState }: {commit: Commit, rootState: RootState}) {
    // get address from rootstate,
    const address = rootState.accounts.activeAccount;
    // if state.rewardsContract is null, call the `setContracts` function
    if (state.rewardsContract === null) {
      actions.setContracts({ commit, rootState });
    }

    // get rewards contract
    const rewardsContract = state.rewardsContract;
    // get pending rewards
    const pendingRewards = await rewardsContract?.pendingRewards(findObjectContract('USDC', tokens, ChainID), address);
    // parse balance, set new value in the local state
    commit("setPendingRewards", ethers.utils.formatUnits(pendingRewards, 18));
  },

  async claim({ commit, rootState }: {commit: Commit, rootState: RootState}) {
    // get address from rootstate,
    const address = rootState.accounts.activeAccount;

    // if state.rewardsContract is null, call the `setContracts` function
    if (state.rewardsContract === null) {
      actions.setContracts({ commit, rootState });
    }

    // get rewards contract
    const rewardsContract = state.rewardsContract;
    // claim rewards
    await rewardsContract?.claim(findObjectContract('USDC', tokens, ChainID), address);
  }
};

const mutations = {
  setCAPLContract(state: ContractState, _contract: object ){
    state.caplContract = _contract;
  },
  setVaultContract(state: ContractState, _contract: object) {
    state.vaultContract = _contract;
  },
  setRewardsContract(state: ContractState, _contract: object) {
    state.rewardsContract = _contract;
  },
  setCAPLBalance(state: ContractState, _balance: number) {
    state.caplBalance = _balance;
  },
  setPendingRewards(state: ContractState, _pendingRewards: number) {
    state.pendingRewards = _pendingRewards;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
