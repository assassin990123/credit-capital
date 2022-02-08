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
};

const getters = {
  getPendingRewards(state: RewardsState) {
    return state.pendingRewards;
  }
};

const actions = {  
  async getPendingRewards({ commit, rootState, dispatch }: {commit: Commit, rootState: RootState, dispatch: Dispatch}) {
    // get address from rootstate,
    const address = rootState.accounts.activeAccount;
    console.log(rootState);
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
  }
};

const mutations = {
  setPendingRewards(state: RewardsState, _pendingRewards: number) {
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
