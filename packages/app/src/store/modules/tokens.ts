import { store } from "@/store";
import { TokenState } from "@/models/tokens";
import { RootState } from "@/models";
import { Commit, Dispatch } from "vuex";
import { ethers } from "ethers";
import { parseScientific } from "../../utils";

const state: TokenState = {
  capl: {
    allowance: 0,
    balance: 0,
  },
  usdc: {
    allowance: 0,
    balance: 0,
  },
  lp: {
    allowance: 0,
    balance: 0,
  },
};

const getters = {
  // allowances
  getCAPLBalancerVaultAllowance(state: TokenState) {
    return state.capl.allowance;
  },
  getUSDCBalancerVaultAllowance(state: TokenState) {
    return state.usdc.allowance;
  },
  getLPAllowance(state: TokenState) {
    return state.lp.allowance;
  },
  // balances
  getCAPLBalance(state: TokenState) {
    return state.capl.balance;
  },
  getUSDCBalance(state: TokenState) {
    return state.usdc.balance;
  },
  getLPBalance(state: TokenState) {
    return state.lp.balance;
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
  setCAPLBalance(state: TokenState, _balance: number) {
    state.capl.balance = _balance;
  },
  setUSDCBalance(state: TokenState, _balance: number) {
    state.usdc.balance = _balance;
  },
  setLPBalance(state: TokenState, _balance: number) {
    state.lp.balance = _balance;
  },
};

const actions = {
  async approveBalancerVault(
    { commit, rootState }: { commit: Commit; rootState: RootState },
    { symbol }: { symbol: string }
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
    if (contract > 0) {
      // @ts-ignore
      await contract?.approve(
        address,
        "115792089237316195423570985008687907853269984665640564039457584007913129639935"
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
    dispatch,
  }: {
    commit: Commit;
    rootState: RootState;
    dispatch: Dispatch;
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
      dispatch("contracts/setContracts", { commit, rootState }, { root: true });

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

      // console.log(`CAPL allowance: ${caplAllowance}, USDC allowance: ${usdcAllowance}`)
      commit("setCAPLBalancerVaultAllowance", caplBalancerVaultAllowance);
      commit("setUSDCBalancerVaultAllowance", usdcBalancerVaultAllowance);
      commit("setLPRewardsAllowance", lpRewardsAllowance);
    } catch (e) {
      console.log(e);
    }
  },
  async getTokenBalances({
    commit,
    rootState,
    dispatch,
  }: {
    commit: Commit;
    rootState: RootState;
    dispatch: Dispatch;
  }) {
    // get address from rootstate,
    const address = rootState.accounts.activeAccount;
    const caplContract = rootState.contracts.caplContract;
    const usdcContract = rootState.contracts.usdcContract;
    const lpContract = rootState.contracts.lpContract;

    // get contract from contract state (local state)
    if (!caplContract || !usdcContract || lpContract) {
      dispatch("contracts/setContracts", { commit, rootState }, { root: true });
    }
    // @ts-ignore
    const caplBalance = await caplContract?.balanceOf(address);
    // @ts-ignore
    const usdcBalance = await usdcContract?.balanceOf(address);
    // @ts-ignore
    const lpBalance = await lpContract?.balanceOf(address);

    // parse balance, set new value in the local state
    commit("setCAPLBalance", Number(ethers.utils.formatEther(caplBalance)));
    commit("setLPBalance", Number(ethers.utils.formatEther(lpBalance)));
    commit("setUSDCBalance", Number(ethers.utils.formatUnits(usdcBalance, 6)));
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
