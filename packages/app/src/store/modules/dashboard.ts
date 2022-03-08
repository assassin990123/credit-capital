import { DashboardState } from "@/models/dashboard";
import { Commit, Dispatch } from "vuex";
import { RootState } from "@/models";
import { calculateCAPLUSDPrice } from "@/utils";
import { ethers } from "ethers";

const state: DashboardState = {
  dailyEarnings: 0,
  tvl: 0,
  revenueProjectionPerDay: 0
};

const getters = {
  getDailyEarnings(state: DashboardState) {
    return state.dailyEarnings;
  },
  getTVL(state: DashboardState) {
    return state.tvl;
  },
  getRevenueProjectionPerDay (state: DashboardState) {
    return state.revenueProjectionPerDay;
  }
};

const actions = {
  async fetchTVL({
    commit,
    rootState,
    dispatch,
  }: {
    commit: Commit;
    rootState: RootState;
    dispatch: Dispatch;
  }) {
    const userStakedPosition = rootState.rewards.userStakedPosition;
    if (userStakedPosition == 0) {
      commit("setTVL", 0);
      return;
    }

    const poolTokens = rootState.balancer.poolTokens;
    // @ts-ignore
    const usdcBalance = poolTokens.balances[0];
    // @ts-ignore
    const caplBalance = poolTokens.balances[1];
    if (rootState.contracts.lpContract === null) {
      await dispatch("contracts/setContracts", null, { root: true });
    }

    // @ts-ignore
    let lpTokenTotalSupply = await rootState.contracts.lpContract.totalSupply();

    lpTokenTotalSupply = ethers.utils.formatEther(
      lpTokenTotalSupply.toString()
    );

    const tvlTokenPrice =
      (Number(usdcBalance) +
        calculateCAPLUSDPrice(Number(caplBalance), "CAPL", poolTokens)) /
      Number(lpTokenTotalSupply);

    commit("setTVL", userStakedPosition * tvlTokenPrice);
  },

  async fetchRevenueProjectionPerDay({
    commit,
    rootState,
    dispatch,
  }: {
    commit: Commit;
    rootState: RootState;
    dispatch: Dispatch;
  }) {

    if (rootState.rewards.caplPerSecond === 0) {
      await dispatch("rewards/getCaplPerSecond", null, { root: true });
    }
    const rewardsPerDay = rootState.rewards.caplPerSecond * 86400;

    if (rootState.rewards.totalStaked === 0) {
      await dispatch("rewards/getTotalStaked", null, { root: true });
    }
    const totalStakedLPTokens = rootState.rewards.totalStaked;

    if (rootState.rewards.userStakedPosition === 0) {
      await dispatch("rewards/getUserPosition", null, { root: true });
    }
    const userStakedLPTokens = rootState.rewards.userStakedPosition;
    const rev = ethers.BigNumber.from((rewardsPerDay / totalStakedLPTokens * userStakedLPTokens).toString());
    commit("setRevenueProjectionPerDay", Number(ethers.utils.formatEther(rev)));
  }
};

const mutations = {
  setTVL(state: DashboardState, _tvl: number) {
    state.tvl = _tvl;
  },

  setRevenueProjectionPerDay(state: DashboardState, _revenueProjectionPerDay: number) {
    state.revenueProjectionPerDay = _revenueProjectionPerDay;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
