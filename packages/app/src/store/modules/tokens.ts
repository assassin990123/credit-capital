import { store } from "@/store";
import { TokenState } from "@/models/tokens";
import { RootState } from "@/models";
import { Commit } from "vuex";

const state: TokenState = {};

const getters = {};

const actions = {
  async approve(
    { commit, rootState }: { commit: Commit; rootState: RootState },
    {
      contract,
      amount,
      address,
    }: { contract: object; amount: number; address: string }
  ) {
    if (contract === null) {
      store.dispatch("contracts/setContracts", { commit, rootState });
    }

    const owner = rootState.accounts.activeAccount;
    // @ts-ignore
    const allowance = await contract?.allowance(owner, address);

    if (allowance < amount) {
      // @ts-ignore
      await contract?.approve(address, amount);
    }
  },

  async checkAllowance(
    { commit, rootState }: { commit: Commit; rootState: RootState },
    {
      contract,
      amount,
      address,
    }: { contract: object; amount: number; address: string }
  ) {
    if (contract === null) {
      store.dispatch("contracts/setContracts", { commit, rootState });
    }

    const owner = rootState.accounts.activeAccount;
    // @ts-ignore
    const allowance = 5; // await contract?.allowance(owner, address);

    return allowance >= amount;
  },
};

const mutations = {};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
