import { DashboardState } from "@/models/dashboard";
import { Commit, Dispatch } from "vuex";
import { RootState } from "@/models";
import { calculateCAPLUSDPrice } from "@/utils";

const state: DashboardState = {
  dailyEarnings: 0,
  tvl: 0,
};

const getters = {
  getDailyEarnings(state: DashboardState) {
    return state.dailyEarnings;
  },
  getTVL(state: DashboardState) {
    return state.tvl;
  },
};

const actions = {
  async getTVL({
    commit,
    rootState,
    dispatch,
  }: {
    commit: Commit;
    rootState: RootState;
    dispatch: Dispatch;
  }) {
    if (rootState.rewards.userStakedPosition === null) {
      await dispatch("rewards/getUserPosition", null, { root: true });
    }

    if (rootState.balancer.poolTokens === null) {
      await dispatch("balancer/getPoolTokens", null, { root: true });
    }

    const userStakedPosition = rootState.rewards.userStakedPosition;
    const poolTokens = rootState.balancer.poolTokens;
    // @ts-ignore
    const usdcBalance = poolTokens.balances[0];
    // @ts-ignore
    const caplBalance = poolTokens.balances[1];
    if (rootState.contracts.lpContract === null) {
      await dispatch("contracts/setContracts", null, { root: true });
    }

    // @ts-ignore
    const lpTokenTotalSupply = await rootState.contracts.lpContract.totalSupply();
    
    const tvlTokenPrice = (usdcBalance + calculateCAPLUSDPrice(caplBalance, "capl", poolTokens)) / lpTokenTotalSupply;

    commit("setTVL", userStakedPosition * tvlTokenPrice);
  }
};

const mutations = {
  setTVL(state: DashboardState, _tvl: number) {
    state.tvl = _tvl;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
