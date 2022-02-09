import { ethers } from "ethers";
import { tokens } from "@/constants";
import { Commit, Dispatch } from 'vuex';
import { findObjectContract } from "@/utils";
import { RewardsState } from "@/models/rewards";
import { RootState } from "@/models";

const ChainID = process.env.VUE_APP_NETWORK_ID
  ? process.env.VUE_APP_NETWORK_ID
  : "1";

const state: RewardsState = {
  pendingRewards: 0,
  userPosition: 0,
  userStakedPosition: 0,
};

const getters = {
  getPendingRewards(state: RewardsState) {
    return state.pendingRewards;
  },
  getUserPosition(state: RewardsState) {
    return state.userPosition;
  },
  getUserStakedPosition(state: RewardsState) {
    return state.userStakedPosition;
  }
};

const actions = {  
  async getPendingRewards({ commit, rootState, dispatch }: {commit: Commit, rootState: RootState, dispatch: Dispatch}) {
    // get address from rootstate,
    const address = rootState.accounts.activeAccount;

    // if state.rewardsContract is null, call the `setContracts` function
    if (rootState.contracts.rewardsContract === null) {
        dispatch("contracts/setContracts", null, { root: true });
    }

    const rewardsContract = rootState.contracts.rewardsContract;
    // @ts-ignore
    const pendingRewards = await rewardsContract?.pendingRewards(findObjectContract('USDC', tokens, ChainID), address);

    // parse balance, set new value in the local state
    commit("setPendingRewards", ethers.utils.formatUnits(pendingRewards, 18));
  },

  async claim({ rootState, dispatch }: {rootState: RootState, dispatch: Dispatch}) {
    // get address from rootstate,
    const address = rootState.accounts.activeAccount;
    // if state.rewardsContract is null, call the `setContracts` function
    if (rootState.contracts.rewardsContract === null) {
      dispatch("contracts/setContracts", null, { root: true });
    }

    const rewardsContract = rootState.contracts.rewardsContract;
    // claim rewards
    try {
      // @ts-ignore
      await rewardsContract?.claim(findObjectContract('USDC', tokens, ChainID), address);
    } catch (error) {
      console.log(error);
    }
  },
  
  async getUserPosition({ commit, rootState, dispatch }: { commit: Commit, rootState: RootState, dispatch: Dispatch}) {
    // get address from rootstate,
    const address = rootState.accounts.activeAccount;
    // if state.vaultContract or state.vaultContract is null, call the `setContracts` function
    if (rootState.contracts.vaultContract === null) {
      dispatch("contracts/setContracts", null, { root: true });
    }

    const vaultContract = rootState.contracts.vaultContract;
    // get userposition
    // @ts-ignore
    const userPosition = await vaultContract?.getUserPosition(findObjectContract('USDC', tokens, ChainID), address);

    // parse balance, set new value in the local state
    commit("setUserPosition", ethers.utils.formatUnits(userPosition, 18));
  },

  async getUserStakedPosition({ commit, rootState, dispatch }: { commit: Commit, rootState: RootState, dispatch: Dispatch}) {
    // get address from rootstate,
    const address = rootState.accounts.activeAccount;
    // if state.vaultContract or state.vaultContract is null, call the `setContracts` function
    if (rootState.contracts.vaultContract === null) {
      dispatch("contracts/setContracts", null, { root: true });
    }
    const vaultContract = rootState.contracts.vaultContract;

    // get user locked amount
    // @ts-ignore
    const userStakedPosition = await vaultContract?.getUserStakedPosition(findObjectContract('USDC', tokens, ChainID), address);
    // parse balance, set new value in the local state
    commit("setUserStakedPosition", ethers.utils.formatUnits(userStakedPosition, 18));
  },

  async stake({ rootState, dispatch }: {rootState: RootState, dispatch: Dispatch}, amount: number) {
    console.log(amount);
    // if state.rewardsContract is null, call the `setContracts` function
    if (rootState.contracts.rewardsContract === null) {
      dispatch("contracts/setContracts", null, { root: true });
    }

    const rewardsContract = rootState.contracts.rewardsContract;
    // claim rewards
    try {
      // @ts-ignore
      await rewardsContract?.deposit(findObjectContract('USDC', tokens, ChainID), amount);
    } catch (error) {
      console.log(error);
    }
  },

  async unstake({ rootState, dispatch }: {rootState: RootState, dispatch: Dispatch}, amount: number) {
    // if state.rewardsContract is null, call the `setContracts` function
    if (rootState.contracts.rewardsContract === null) {
      dispatch("contracts/setContracts", null, { root: true });
    }

    const rewardsContract = rootState.contracts.rewardsContract;
    // claim rewards
    try {
      // @ts-ignore
      await rewardsContract?.withdraw(findObjectContract('USDC', tokens, ChainID), amount);
    } catch (error) {
      console.log(error);
    }
  }
};

const mutations = {
  setPendingRewards(state: RewardsState, _pendingRewards: number) {
    state.pendingRewards = _pendingRewards;
  },
  setUserPosition(state: RewardsState, _userPosition: number) {
    state.userPosition = _userPosition;
  },
  setUserStakedPosition(state: RewardsState, _userStakedPosition: number) {
    state.userStakedPosition = _userStakedPosition;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
