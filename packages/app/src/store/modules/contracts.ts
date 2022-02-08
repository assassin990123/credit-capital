import { ethers } from "ethers";
import { caplABI } from "@/abi";
import { contracts, tokens } from "@/constants";
import { markRaw } from "vue";
import { Commit } from "vuex";
import { findObjectContract } from "@/utils";
import { ContractState } from "@/models/contracts";
import { RootState } from "@/models";

const ChainID = process.env.VUE_APP_NETWORK_ID
  ? process.env.VUE_APP_NETWORK_ID
  : "1";

const state: ContractState = {
  caplContract: null,
  caplBalance: 0,
};

const getters = {
  getCAPLContract(state: ContractState) {
    return state.caplContract;
  },
  getCAPLBalance(state: ContractState) {
    return state.caplBalance;
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
        "setCAPLContract",
        markRaw(
          new ethers.Contract(
            findObjectContract("CAPL", tokens, ChainID),
            caplABI,
            provider
          )
        )
      );
    } catch (e) {
      console.log(e);
    }
  },

  async getCAPLBalance({
    commit,
    rootState,
  }: {
    commit: Commit;
    rootState: RootState;
  }) {
    // get address from rootstate,
    const address = rootState.accounts.activeAccount;
    // get contract from contract state (local state)
    if (state.caplContract === null) {
      actions.setContracts({ commit, rootState });
    }

    const caplContract = state.caplContract;
    // @ts-ignore
    const caplBalance = await caplContract?.balanceOf(address);
    // parse balance, set new value in the local state
    commit("setCAPLBalance", ethers.utils.formatUnits(caplBalance, 18));
  },
};

const mutations = {
  setCAPLContract(state: ContractState, _contract: object) {
    state.caplContract = _contract;
  },
  setCAPLBalance(state: ContractState, _balance: number) {
    state.caplBalance = _balance;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
