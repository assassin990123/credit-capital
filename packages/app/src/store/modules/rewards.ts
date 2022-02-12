import { ethers } from "ethers";
import { tokens } from "@/constants";
import { Commit, Dispatch } from "vuex";
import { findObjectContract } from "@/utils";
import { RewardsState } from "@/models/rewards";
import { RootState } from "@/models";

const ChainID = process.env.VUE_APP_NETWORK_ID
  ? process.env.VUE_APP_NETWORK_ID
  : "1";

const state: RewardsState = {
  pendingRewards: 0,
  userStakedPosition: 0,
  userUnlockedAmount: 0,
  totalStaked: 0,
  caplPerSecond: 0,
};

const getters = {
  getPendingRewards(state: RewardsState) {
    return state.pendingRewards;
  },
  getUserStakedPosition(state: RewardsState) {
    return state.userStakedPosition;
  },
  getUserUnlockedAmount(state: RewardsState) {
    return state.userUnlockedAmount;
  },
};

const actions = {
  async getPendingRewards({
    commit,
    rootState,
    dispatch,
  }: {
    commit: Commit;
    rootState: RootState;
    dispatch: Dispatch;
  }) {
    // get address from rootstate,
    const address = rootState.accounts.activeAccount;

    // if state.rewardsContract is null, call the `setContracts` function
    if (rootState.contracts.rewardsContract === null) {
      dispatch("contracts/setContracts", null, { root: true });
    }

    const rewardsContract = rootState.contracts.rewardsContract;
    // @ts-ignore
    const pendingRewards = await rewardsContract?.pendingRewards(
      findObjectContract("USDC", tokens, ChainID),
      address
    );

    // parse balance, set new value in the local state
    commit("setPendingRewards", ethers.utils.formatUnits(pendingRewards, 18));
  },

  async claim({
    rootState,
    dispatch,
  }: {
    rootState: RootState;
    dispatch: Dispatch;
  }) {
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
      await rewardsContract?.claim(
        findObjectContract("USDC", tokens, ChainID),
        address
      );
    } catch (error) {
      console.log(error);
    }
  },

  async getUserStakedPosition({
    commit,
    rootState,
    dispatch,
  }: {
    commit: Commit;
    rootState: RootState;
    dispatch: Dispatch;
  }) {
    // get address from rootstate,
    const address = rootState.accounts.activeAccount;
    // if state.vaultContract or state.vaultContract is null, call the `setContracts` function
    if (rootState.contracts.vaultContract === null) {
      dispatch("contracts/setContracts", null, { root: true });
    }
    const vaultContract = rootState.contracts.vaultContract;

    // get user locked amount
    // @ts-ignore
    const userStakedPosition = await vaultContract?.getUserStakedPosition(
      findObjectContract("USDC", tokens, ChainID),
      address
    );
    // parse balance, set new value in the local state
    commit(
      "setUserStakedPosition",
      ethers.utils.formatUnits(userStakedPosition, 18)
    );
  },

  async getUserUnlockedAmount({
    commit,
    rootState,
    dispatch,
  }: {
    commit: Commit;
    rootState: RootState;
    dispatch: Dispatch;
  }) {
    // if state.vaultContract is null, call the `setContracts` function
    if (rootState.contracts.vaultContract === null) {
      dispatch("contracts/setContracts", null, { root: true });
    }

    const vaultContract = rootState.contracts.vaultContract;
    // @ts-ignore
    const lpContractAddress = rootState.contracts.lpContract.address;
    // @ts-ignore
    const activeAccountAddress = rootState.accounts.activeAccount.address;

    // @ts-ignore
    const unlockedAmount = await vaultContract?.getUnlockedAmount(
      lpContractAddress,
      activeAccountAddress
    );

    commit(
      "setUserUnlockedAmount",
      ethers.utils.formatUnits(unlockedAmount, 18)
    );
  },

  async stake(
    { rootState, dispatch }: { rootState: RootState; dispatch: Dispatch },
    { amount }: { amount: number }
  ) {
    // if state.rewardsContract is null, call the `setContracts` function
    if (rootState.contracts.rewardsContract === null) {
      dispatch("contracts/setContracts", null, { root: true });
    }

    const rewardsContract = rootState.contracts.rewardsContract;
    // @ts-ignore
    const lpContractAddress = rootState.contracts.lpContract.address;

    // deposit lptoken
    if (rewardsContract && amount > 0) {
      try {
        // @ts-ignore
        await rewardsContract?.deposit(
          lpContractAddress,
          ethers.utils.parseUnits(amount.toString(), 18)
        );
      } catch (error) {
        console.log(error);
      }
    }
  },

  async unstake(
    { rootState, dispatch }: { rootState: RootState; dispatch: Dispatch },
    { amount }: { amount: number }
  ) {
    // if state.rewardsContract is null, call the `setContracts` function
    if (rootState.contracts.rewardsContract === null) {
      dispatch("contracts/setContracts", null, { root: true });
    }

    const rewardsContract = rootState.contracts.rewardsContract;
    // @ts-ignore
    const lpContractAddress = rootState.contracts.lpContract.address;

    // claim rewards
    if (rewardsContract && amount > 0) {
      try {
        // @ts-ignore
        await rewardsContract?.withdraw(
          lpContractAddress,
          ethers.utils.parseUnits(amount.toString(), 18)
        );
      } catch (error) {
        console.log(error);
      }
    }
  },
  async getTotalStaked({
    commit,
    rootState,
  }: {
    commit: Commit;
    rootState: RootState;
  }) {
    const rewardsContract = rootState.contracts.rewardsContract;
    // @ts-ignore
    const lpAddress = rootState.contracts.lpContract?.address;
    // @ts-ignore
    const totalSupply = rewardsContract?.getTokenSupply(lpAddress);

    commit("setTotalStaked", ethers.utils.parseEther(totalSupply.toString()));
  },
  async getCaplPerSecond({
    commit,
    rootState,
  }: {
    commit: Commit;
    rootState: RootState;
  }) {
    const rewardsContract = rootState.contracts.rewardsContract;
    // @ts-ignore
    const lpAddress = rootState.contracts.lpContract?.address;
    // @ts-ignore
    const pool = rewardsContract?.getPool(lpAddress);
    // we now have the pool struct, IPool, need to unpack
    console.log(pool) // for test
    
    const rewardsPerSecond = Number(pool.rewardsPerBlock.toString())

    commit("setCaplPerSecond", ethers.utils.parseEther(rewardsPerSecond.toString()));
  },
};

const mutations = {
  setPendingRewards(state: RewardsState, _pendingRewards: number) {
    state.pendingRewards = _pendingRewards;
  },
  setUserStakedPosition(state: RewardsState, _userStakedPosition: number) {
    state.userStakedPosition = _userStakedPosition;
  },
  setUserUnlockedAmount(state: RewardsState, _userUnlockedAmount: number) {
    state.userUnlockedAmount = _userUnlockedAmount;
  },
  setCaplPerSecond(state: RewardsState, _caplPerSecond: number) {
    state.caplPerSecond = _caplPerSecond;
  },
  setTotalStake(state: RewardsState, _totalStake: number) {
    state.totalStaked = _totalStake;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
