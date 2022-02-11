import { store } from "@/store";
import { TokenState } from "@/models/tokens";
import { RootState } from "@/models";
import { Commit } from "vuex";
import { ethers } from "ethers";

const state: TokenState = {
  capl: {
    balancerVaultAllowance: 0,
    rewardsAllowance: 0,
  },
  usdc: {
    balancerVaultAllowance: 0,
    rewardsAllowance: 0,
  },
};

const getters = {
  getCAPLBalancerVaultAllowance(state: TokenState) {
    return state.capl.balancerVaultAllowance;
  },
  getUSDCBalancerVaultAllowance(state: TokenState) {
    return state.usdc.balancerVaultAllowance;
  },
  getCAPLRewardsAllowance(state: TokenState) {
    return state.capl.rewardsAllowance;
  },
  getUSDCRewardsAllowance(state: TokenState) {
    return state.usdc.rewardsAllowance;
  },
};

const mutations = {
  setCAPLBalancerVaultAllowance(state: TokenState, allowance: number) {
    state.capl.balancerVaultAllowance = allowance;
  },
  setUSDCBalancerVaultAllowance(state: TokenState, allowance: number) {
    state.usdc.balancerVaultAllowance = allowance;
  },
  setCAPLRewardsAllowance(state: TokenState, allowance: number) {
    state.capl.rewardsAllowance = allowance;
  },
  setUSDCRewardsAllowance(state: TokenState, allowance: number) {
    state.usdc.rewardsAllowance;
  },
};

const actions = {
  async approveBalancerVault(
    { commit, rootState }: { commit: Commit; rootState: RootState },
    { symbol, amount }: { symbol: string; amount: number }
  ) {
    let contract;
    let decimals;
    symbol == "CAPL"
      ? (contract = rootState.contracts.caplContract)
      : (contract = rootState.contracts.usdcContract);
    symbol == "CAPL" ? (decimals = 18) : (decimals = 6); // USDC - 6 decimals, CAPL - 8 decimals
    // @ts-ignore
    const address = rootState.contracts.balancerVaultContract.address;
    // @ts-ignore
    if (contract && amount > 0)
      // @ts-ignore
      await contract?.approve(
        address,
        ethers.utils.parseUnits(amount.toString(), decimals)
      );
  },

  async getAllowances({
    commit,
    rootState,
  }: {
    commit: Commit;
    rootState: RootState;
  }) {
    const connected = rootState.accounts.isConnected;
    if (!connected) return;

    const caplContract = rootState.contracts.caplContract;
    const usdcContract = rootState.contracts.usdcContract;

    const balancerVaultAddress =
      // @ts-ignore
      rootState.contracts.balancerVaultContract.address;

    if (!caplContract || !usdcContract)
      store.dispatch("contracts/setContracts", { commit, rootState });

    const user = rootState.accounts.activeAccount;
    // @ts-ignore
    if (!caplContract?.signer || !usdcContract?.signer) {
      return;
    }

    try {
      // TODO: ERC20 TYPES
      // @ts-ignore
      let caplAllowance = await caplContract!.allowance(
        user,
        balancerVaultAddress
      );
      caplAllowance = Number(
        ethers.utils.formatEther(caplAllowance.toString())
      );
      // @ts-ignore
      let usdcAllowance = await usdcContract!.allowance(
        user,
        balancerVaultAddress
      );
      usdcAllowance = Number(
        ethers.utils.formatUnits(usdcAllowance.toString())
      );

      // console.log(`CAPL allowance: ${caplAllowance}, USDC allowance: ${usdcAllowance}`)
      commit("setCAPLBalancerVaultAllowance", caplAllowance);
      commit("setUSDCBalancerVaultAllowance", usdcAllowance);
    } catch (e) {
      console.log(e);
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
