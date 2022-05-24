import { Commit, Dispatch } from "vuex";
import { RootState } from "@/models";
import { TreasuryState } from "@/models/treasury";
import { contracts } from './../../constants/contracts';
import { ethers } from "ethers";

const state = {
  aum: 0,
  balances: [],
};

const getters = {
  getAUM(state: TreasuryState) {
    return state.aum;
  },

  getAvailableBalances(state: TreasuryState) {
    return state.balances;
  },
};

const actions = {
  // getters
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

  async getAUM(
    { commit, rootState, dispatch }: { commit: Commit; rootState: RootState; dispatch: Dispatch }
  ) {
    if (rootState.contracts.treasuryStorageContract === null) {
      dispatch("contracts/setContracts", null, { root: true });
    }
    const contract = rootState.contracts.treasuryStorageContract;

    const aum =  await contract?.getAUM();

    commit("setAUM", aum);
  },

  // setters
  async deposit(
    { rootState, dispatch }: { rootState: RootState; dispatch: Dispatch },
    { token, amount, decimal }: { token: string; amount: number; decimal: number }
  ) {
    if (rootState.contracts.treasuryControllerContract === null) {
      dispatch("contracts/setContracts", null, { root: true });
    }
    const treasuryController = rootState.contracts.treasuryControllerContract;

    if (treasuryController && amount > 0) {
      try {
        // @ts-ignore
        await treasuryController?.deposit(
          token,
          ethers.utils.parseUnits(amount.toString(), decimal) // decimal maybe different in the case of usdc
        );
      } catch (error) {
        console.log(error);
      }
    }
  },

  async withdraw(
    { rootState, dispatch }: { rootState: RootState; dispatch: Dispatch },
    { token, amount, decimal }: { token: string; amount: number; decimal: number }
  ) {
    if (rootState.contracts.treasuryControllerContract === null) {
      dispatch("contracts/setContracts", null, { root: true });
    }
    const treasuryController = rootState.contracts.treasuryControllerContract;

    if (treasuryController && amount > 0) {
      try {
        // @ts-ignore
        await treasuryController?.withdraw(
          token,
          ethers.utils.parseUnits(amount.toString(), decimal) // decimal maybe different in the case of usdc
        );
      } catch (error) {
        console.log(error);
      }
    }
  },

  async borrow(
    { rootState, dispatch }: { rootState: RootState; dispatch: Dispatch },
    { token, amount, decimal }: { token: string; amount: number; decimal: number }
  ) {
    if (rootState.contracts.treasuryControllerContract === null) {
      dispatch("contracts/setContracts", null, { root: true });
    }
    const treasuryController = rootState.contracts.treasuryControllerContract;

    if (treasuryController && amount > 0) {
      try {
        // @ts-ignore
        await treasuryController?.borrow(
          token,
          ethers.utils.parseUnits(amount.toString(), decimal) // decimal maybe different in the case of usdc
        );
      } catch (error) {
        console.log(error);
      }
    }
  },

  async repay(
    { rootState, dispatch }: { rootState: RootState; dispatch: Dispatch },
    { token, principal, profit, decimal }: { token: string; principal: number; profit: number; decimal: number }
  ) {
    if (rootState.contracts.treasuryControllerContract === null) {
      dispatch("contracts/setContracts", null, { root: true });
    }
    const treasuryController = rootState.contracts.treasuryControllerContract;

    if (treasuryController && principal > 0) {
      try {
        // @ts-ignore
        await treasuryController?.treasuryIncome(
          token,
          ethers.utils.parseUnits(principal.toString(), decimal),
          ethers.utils.parseUnits(profit.toString(), decimal)
        );
      } catch (error) {
        console.log(error);
      }
    }
  }
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
