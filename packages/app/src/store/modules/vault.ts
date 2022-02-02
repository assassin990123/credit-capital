// @ts-nocheck
import { ethers } from "ethers";
import { balancerPool, balancerVault } from "../../contracts/abi";
import { balancerVault, caplUSDCPoolId } from "../../contracts";
import { markRaw } from "vue";

const ChainID = process.env.VUE_APP_NETWORK_ID
  ? Number(process.env.VUE_APP_NETWORK_ID)
  : 1;

const state = {
  CAPLUSDPollContract: null,
  poolID: null
};

const getters = {
  // get CAPLUSDPollContract
  getCAPLUSDPollContract(state) {
    return state.CAPLUSDPollContract;
  },

  // get poolID
  getPoolID(state) {
    return state.poolID;
  },
};

const actions = {
  async setContracts({ commit, rootState }) {
    const provider = rootState.accounts.web3Provider;
    commit(
      "setCAPLUSDCPoolContract",
      markRaw(new ethers.Contract(caplUSDCPoolId[ChainID], balancerPool, provider))
    );
  },

  async getPoolID({ commit, rootState }) {
    // get contract from contract state (local state)
    if (state.CAPLUSDPollContract === null) {
      actions.setContracts({ commit, rootState });
    }
    const CAPLUSDPollContract = state.CAPLUSDPollContract;
    
    // parse poolID, set new value in the local state
    const poolID = await CAPLUSDPollContract.getPoolId();
    commit("setCAPLUSDCPoolContract", poolID);
  },
};

const mutations = {
  setCAPLUSDCPoolContract(state, _contract) {
    state.CAPLUSDPollContract = _contract;
  },

  setPoolID(state, _poolID) {
    state.poolID = _poolID;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
