import { ethers } from "ethers";
import { rewardsABI, vaultABI } from "@/abi";
import { contracts } from "@/constants";
import { markRaw } from "vue";
import { Commit } from "vuex";
import { findObjectContract } from "@/utils";
import { RewardsState } from "@/models/rewards";
import { RootState } from "@/models";

const ChainID = process.env.VUE_APP_NETWORK_ID
  ? process.env.VUE_APP_NETWORK_ID
  : "1";

const state: RewardsState = {
  rewardsContract: null,
  vaultContract: null,
  claim: null,
};

const getters = {
  getClaim() {
    return state.claim;
  },
};

const actions = {
  async setContracts({ commit, rootState }: {commit: Commit, rootState: RootState}) {
    const provider = rootState.accounts.web3Provider;
    try {
      commit(
        "setVaultContract",
        markRaw(new ethers.Contract(findObjectContract('rewardsVault', contracts, ChainID), vaultABI, provider))
      );
      commit(
        "setRewardsContract",
        markRaw(new ethers.Contract(findObjectContract('rewards', contracts, ChainID), rewardsABI, provider))
      );
    } catch (e) {
      console.log(e)
    }
  },

  async claim({ commit, rootState }: {commit: Commit, rootState: RootState}) {
    if (state.rewardsContract === null) {
      actions.setContracts({ commit, rootState });
    }
    const rewardsContract = state.rewardsContract;

    // @ts-ignore
    const claim = await rewardsContract?.claim(
      rootState.accounts.activeAccount,
      rootState.accounts.activeAccount,
    );

    commit("setClaim", claim);
  },
};

const mutations = {
  setVaultContract(state: RewardsState, _contract: object) {
    state.vaultContract = _contract;
  },
  setRewardsContract(state: RewardsState, _contract: object) {
    state.rewardsContract = _contract;
  },
  setClaim(state: RewardsState, _claim: object) {
    state.claim = _claim;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
