import { Commit, Dispatch } from "vuex";
import { RootState } from "@/models";
import { TreasuryState } from "@/models/treasury";

const state = {
  aum: 0,
  balances: [],
};

const getters = {
  getAUM(state: TreasuryState) {
    return state.aum;
  },
};

const actions = {
  async getAvailableBalances(
    { commit, rootState }: { commit: Commit; rootState: RootState },
    { tokens }: { tokens: string[] }
  ) {
    const contract = rootState.contracts.treasuryStorageContract;

    const balances: TreasuryState["balances"] = [];

    tokens.forEach(async (token) => {
      balances.push({
        token,
        balance: await contract?.getAvailableBalance(token),
      });
    });

    commit("setBalances", balances);
  },
};

const mutations = {
  setAUM(state: TreasuryState, aum: number) {
    state.aum = aum;
  },
  setBalances(state: TreasuryState, balances: TreasuryState["balances"]) {
    state.balances = balances;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
