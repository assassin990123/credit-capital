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
};

const getters = {
  getCAPLContract(state: ContractState) {
    return state.caplContract;
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
