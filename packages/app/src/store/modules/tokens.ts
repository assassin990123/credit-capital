import { store } from "@/store";
import { TokenState } from "@/models/tokens";
import { RootState } from "@/models";
import { Commit } from "vuex";
import { ethers } from "ethers";

const state: TokenState = {
  capl: {
    allowance: 0,
  },
  usdc: {
    allowance: 0,
  },
  lp: {
    allowance: 0,
  },
};

const getters = {
  getCAPLBalancerVaultAllowance(state: TokenState) {
    return state.capl.allowance;
  },
  getUSDCBalancerVaultAllowance(state: TokenState) {
    return state.usdc.allowance;
  },
  getLPAllowance(state: TokenState) {
    return state.lp.allowance;
  },
};

const mutations = {
  setCAPLBalancerVaultAllowance(state: TokenState, allowance: number) {
    state.capl.allowance = allowance;
  },
  setUSDCBalancerVaultAllowance(state: TokenState, allowance: number) {
    state.usdc.allowance = allowance;
  },
  setLPRewardsAllowance(state: TokenState, allowance: number) {
    state.lp.allowance = allowance;
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
    if (contract && amount > 0) {
      // @ts-ignore
      await contract?.approve(
        address,
        ethers.utils.parseUnits(amount.toString(), decimals)
      );
    }
  },
  async approveRewards(
    { commit, rootState }: { commit: Commit; rootState: RootState },
    { amount }: { amount: number }
  ) {
    const contract = rootState.contracts.lpContract;
    // @ts-ignore
    const rewardsAddress = rootState.contracts.rewardsContract.address;

    if (contract && amount > 0) {
      // @ts-ignore
      await contract?.approve(
        rewardsAddress,
        ethers.utils.parseUnits(amount.toString(), 18)
      );
    }
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
    const lpContract = rootState.contracts.lpContract;

    const balancerVaultAddress =
      // @ts-ignore
      rootState.contracts.balancerVaultContract.address;

    // @ts-ignore
    const rewardsAddress = rootState.contracts.rewardsContract.address;

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
      let caplBalancerVaultAllowance = await caplContract!.allowance(
        user,
        balancerVaultAddress
      );
      caplBalancerVaultAllowance = Number(
        ethers.utils.formatEther(caplBalancerVaultAllowance.toString())
      );
      // @ts-ignore
      let usdcBalancerVaultAllowance = await usdcContract!.allowance(
        user,
        balancerVaultAddress
      );
      usdcBalancerVaultAllowance = Number(
        ethers.utils.formatUnits(usdcBalancerVaultAllowance.toString(), 6)
      );
      // @ts-ignore
      let lpRewardsAllowance = await lpContract!.allowance(
        user,
        rewardsAddress
      );
      lpRewardsAllowance = Number(
        ethers.utils.formatUnits(lpRewardsAllowance.toString(), 18)
      );

      console.log(lpRewardsAllowance);

      // console.log(`CAPL allowance: ${caplAllowance}, USDC allowance: ${usdcAllowance}`)
      commit("setCAPLBalancerVaultAllowance", caplBalancerVaultAllowance);
      commit("setUSDCBalancerVaultAllowance", usdcBalancerVaultAllowance);
      commit("setLPRewardsAllowance", lpRewardsAllowance);
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
