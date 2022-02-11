import { ethers } from "ethers";
import {
  caplABI,
  rewardsABI,
  vaultABI,
  balancerVault as balancerVaultABI,
} from "@/abi";
import { contracts, pools, tokens } from "@/constants";
import { markRaw } from "vue";
import { Commit } from "vuex";
import { findObjectContract } from "@/utils";
import { ContractState } from "@/models/contracts";
import { RootState } from "@/models";
import { lpABI } from "@/abi/lp";

const ChainID = process.env.VUE_APP_NETWORK_ID
  ? process.env.VUE_APP_NETWORK_ID
  : "1";

const state: ContractState = {
  balancerVaultContract: null,
  rewardsContract: null,
  vaultContract: null,
  caplContract: null,
  usdcContract: null,
  lpContract: null,
  caplBalance: 0,
  usdcBalance: 0,
};

const getters = {
  getCAPLContract(state: ContractState) {
    return state.caplContract;
  },
  getCAPLBalance(state: ContractState) {
    return state.caplBalance;
  },
  getUSDCBalance(state: ContractState) {
    return state.usdcBalance;
  },
  getRewardsContract(state: ContractState) {
    return state.rewardsContract;
  },
  getBalancerVaultContract(state: ContractState) {
    return state.balancerVaultContract;
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
    // if user connected pass the signer to the contract instance.
    let providerOrSigner;
    const signer = rootState.accounts.signer;

    signer
      ? (providerOrSigner = signer)
      : (providerOrSigner = new ethers.providers.Web3Provider(
          window.ethereum as any
        ));

    try {
      commit(
        "setCAPLContract",
        markRaw(
          new ethers.Contract(
            findObjectContract("CAPL", tokens, ChainID),
            caplABI,
            providerOrSigner
          )
        )
      );
      commit(
        "setUSDCContract",
        markRaw(
          new ethers.Contract(
            findObjectContract("USDC", tokens, ChainID),
            caplABI,
            providerOrSigner
          )
        )
      );
      commit(
        "setVaultContract",
        markRaw(
          new ethers.Contract(
            findObjectContract("rewardsVault", contracts, ChainID),
            vaultABI,
            providerOrSigner
          )
        )
      );
      commit(
        "setRewardsContract",
        markRaw(
          new ethers.Contract(
            findObjectContract("rewards", contracts, ChainID),
            rewardsABI,
            providerOrSigner
          )
        )
      );
      commit(
        "setBalancerVaultContract",
        markRaw(
          new ethers.Contract(
            findObjectContract("balancerVault", contracts, ChainID),
            balancerVaultABI,
            providerOrSigner
          )
        )
      );
      commit(
        "setCAPLUSDCTokenContract",
        markRaw(
          new ethers.Contract(
            findObjectContract("LP", tokens, ChainID),
            lpABI,
            providerOrSigner
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
  setVaultContract(state: ContractState, _contract: object) {
    state.vaultContract = _contract;
  },
  setRewardsContract(state: ContractState, _contract: object) {
    state.rewardsContract = _contract;
  },
  setCAPLBalance(state: ContractState, _balance: number) {
    state.caplBalance = _balance;
  },
  setBalancerVaultContract(state: ContractState, _contract: object) {
    state.balancerVaultContract = _contract;
  },
  setUSDCContract(state: ContractState, _contract: object) {
    state.usdcContract = _contract;
  },
  setCAPLUSDCTokenContract(state: ContractState, _contract: object) {
    state.lpContract = _contract;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
