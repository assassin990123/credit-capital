import { DashboardState } from "@/models/dashboard";
import { Commit, Dispatch } from "vuex";
import { RootState } from "@/models";
import { calculateCAPLUSDPrice } from "@/utils";
import { ethers } from "ethers";

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
  async fetchTVL({
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

    if (userStakedPosition == 0) return;

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

    console.log(userStakedPosition, tvlTokenPrice);
    commit("setTVL", userStakedPosition * tvlTokenPrice);
  },
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
