import { DashboardState } from "@/models/dashboard";

const state: DashboardState = {
  dailyEarnings: 0,
  tvl: 0,
  userCAPL: 0,
  stakedBalance: 0,
};

const getters = {
  getDailyEarnings(state: DashboardState) {
    return state.dailyEarnings;
  },
  getTVL(state: DashboardState) {
    return state.tvl;
  },
  getUserCAPL(state: DashboardState) {
    return state.userCAPL;
  },
  getStakedBalance(state: DashboardState) {
    return state.stakedBalance;
  },
};

const actions = {};

const mutations = {};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
