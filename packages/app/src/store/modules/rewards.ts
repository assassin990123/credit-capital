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
  pendingRewards: null,
  userPosition: null,
  userStakedPositions: null,
  stake: null,
  unstake: null,
  deposit: null,
  withdraw: null
};

const getters = {
  getClaim() {
    return state.claim;
  },
  getPendingRewards() {
    return state.pendingRewards;
  },
  getUserPosition() {
    return state.userPosition;
  },
  getUserStakedPositions() {
    return state.userStakedPositions;
  },
  getStake() {
    return state.stake;
  },
  getUnstake() {
    return state.unstake;
  },
  getDeposit() {
    return state.deposit;
  },
  getWithdraw() {
    return state.withdraw;
  },
};

const actions = {
  async setContracts({
    commit,
    rootState,
  }: {
    commit: Commit;
    rootState: RootState;
  }) {
    const provider = rootState.accounts.web3Provider;
    try {
      commit(
        "setVaultContract",
        markRaw(
          new ethers.Contract(
            findObjectContract("rewardsVault", contracts, ChainID),
            vaultABI,
            provider
          )
        )
      );
      commit(
        "setRewardsContract",
        markRaw(
          new ethers.Contract(
            findObjectContract("rewards", contracts, ChainID),
            rewardsABI,
            provider
          )
        )
      );
    } catch (e) {
      console.log(e);
    }
  },

  async claim({ commit, rootState }: { commit: Commit; rootState: RootState }) {
    if (state.rewardsContract === null) {
      actions.setContracts({ commit, rootState });
    }
    const rewardsContract = state.rewardsContract;

    // @ts-ignore
    const claim = await rewardsContract?.claim(
      rootState.accounts.activeAccount,
      rootState.accounts.activeAccount
    );

    commit("setClaim", claim);
  },

  async pendingRewards({ commit, rootState }: {commit: Commit, rootState: RootState}) {
    if (state.rewardsContract === null) {
      actions.setContracts({ commit, rootState });
    }
    const rewardsContract = state.rewardsContract;

    // @ts-ignore
    const pendingRewards = await rewardsContract?.pendingRewards(
      rootState.accounts.activeAccount,
      rootState.accounts.activeAccount,
    );

    commit("setPendingRewards", pendingRewards);
  },

  async getUserPosition({ commit, rootState }: {commit: Commit, rootState: RootState}) {
    if (state.rewardsContract === null) {
      actions.setContracts({ commit, rootState });
    }
    const rewardsContract = state.rewardsContract;

    // @ts-ignore
    const getUserPosition = await rewardsContract?.getUserPosition(
      rootState.accounts.activeAccount,
      rootState.accounts.activeAccount,
    );

    commit("setUserPosition", getUserPosition);
  },

  async getUserStakedPositions({ commit, rootState }: {commit: Commit, rootState: RootState}) {
    if (state.rewardsContract === null) {
      actions.setContracts({ commit, rootState });
    }
    const rewardsContract = state.rewardsContract;

    // @ts-ignore
    const getUserStakedPositions = await rewardsContract?.getUserStakedPositions(
      rootState.accounts.activeAccount,
      rootState.accounts.activeAccount,
    );

    commit("setUserStakedPositions", getUserStakedPositions);
  },

  async stake({ commit, rootState }: {commit: Commit, rootState: RootState}) {
    if (state.rewardsContract === null) {
      actions.setContracts({ commit, rootState });
    }
    const rewardsContract = state.rewardsContract;

    // @ts-ignore
    const stake = await rewardsContract?.stake(
      rootState.accounts.activeAccount,
      rootState.accounts.activeAccount,
    );

    commit("setStake", stake);
  },

  async unstake({ commit, rootState }: {commit: Commit, rootState: RootState}) {
    if (state.rewardsContract === null) {
      actions.setContracts({ commit, rootState });
    }
    const rewardsContract = state.rewardsContract;

    // @ts-ignore
    const unstake = await rewardsContract?.unstake(
      rootState.accounts.activeAccount,
      rootState.accounts.activeAccount,
    );

    commit("setUnstake", unstake);
  },

  async deposit({ commit, rootState }: {commit: Commit, rootState: RootState}) {
    if (state.rewardsContract === null) {
      actions.setContracts({ commit, rootState });
    }
    const rewardsContract = state.rewardsContract;

    // @ts-ignore
    const deposit = await rewardsContract?.deposit(
      rootState.accounts.activeAccount,
      rootState.accounts.activeAccount,
    );

    commit("setDeposit", deposit);
  },

  async withdraw({ commit, rootState }: {commit: Commit, rootState: RootState}) {
    if (state.rewardsContract === null) {
      actions.setContracts({ commit, rootState });
    }
    const rewardsContract = state.rewardsContract;

    // @ts-ignore
    const withdraw = await rewardsContract?.withdraw(
      rootState.accounts.activeAccount,
      rootState.accounts.activeAccount,
    );

    commit("setWithdraw", withdraw);
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
  setPendingRewards(state: RewardsState, _pendingRewards: object) {
    state.pendingRewards = _pendingRewards;
  },
  setStake(state: RewardsState, _stake: object) {
    state.stake = _stake;
  },
  setUnstake(state: RewardsState, _unstake: object) {
    state.unstake = _unstake;
  },
  setDeposit(state: RewardsState, _deposit: object) {
    state.deposit = _deposit;
  },
  setWithdraw(state: RewardsState, _withdraw: object) {
    state.withdraw = _withdraw;
  },
  setUserPosition(state: RewardsState, _userPosition: object) {
    state.userPosition = _userPosition;
  },
  setUserStakedPositions(state: RewardsState, _userStakedPositions: object) {
    state.userStakedPositions = _userStakedPositions;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
