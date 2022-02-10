import { DashboardState } from "@/models/dashboard";

const state: DashboardState = {
  dailyEarnings: 0,
  tvl: 0,
  totalCAPL: 1.0357,
  userCAPL: 0,
  stakedBalance: 0,
  walletAddress: '0x00000000000000000000',
  usdcBalance: 0,
};

const getters = {
  getDailyEarnings(state: DashboardState) {
    return state.dailyEarnings;
  },
  getTVL(state: DashboardState) {
    return state.tvl;
  },
  getTotalCAPL(state: DashboardState) {
    return state.totalCAPL;
  },
  getUserCAPL(state: DashboardState) {
    return state.userCAPL;
  },
  getStakedBalance(state: DashboardState) {
    return state.stakedBalance;
  },
  getWalletAddress(state: DashboardState) {
    return state.walletAddress;
  },
  getUsdcBalance(state: DashboardState) {
    return state.usdcBalance;
  }
};

const actions = {

};

const mutations = {

};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}
