// @ts-nocheck
import { ethers } from "ethers";
import { balancerPool, balancerVault } from "../../contracts/abi";
import { balancerVault as vaultContract, caplUSDCPoolId } from "../../contracts";
import { markRaw } from "vue";

const ChainID = process.env.VUE_APP_NETWORK_ID
  ? Number(process.env.VUE_APP_NETWORK_ID)
  : 1;

const state = {
  // CAPLUSDPollContract: null,
  vaultContract: null,
  // poolID: null,
  poolTokens: {}
};

const getters = {
  // get CAPLUSDPollContract
  getVaultContract(state) {
    return state.vaultContract;
  },

  // get poolTokens
  getPoolTokens() {
    return state.poolTokens;
  }
};

const actions = {
  async setContracts({ commit, rootState }) {
    const provider = rootState.accounts.web3Provider;

    // set vault contract
    commit(
      "setVaultContract",
      markRaw(new ethers.Contract(vaultContract[ChainID], balancerVault, provider))
    );
  },

  async getPoolTokens({ commit, rootState }) {
    // get poolID
    const poolID = caplUSDCPoolId[ChainID];

    // if state.vaultContract is null, call the `setContracts` function
    if (state.vaultContract === null) {
      actions.setContracts({ commit, rootState });
    }
    const vaultContract = state.vaultContract;
    
    // call getPoolTokens
    const poolTokens = await vaultContract.getPoolTokens(poolID);
    
    // parse balance
    const balances = poolTokens.balances.map(obj => ethers.utils.formatUnits(obj, 18));
    
    // call setPoolTokens in mutations.
    commit("setPoolTokens", {
      "tokens" : poolTokens.tokens,
      "balances":  balances
    });
  },
  
};

const mutations = {
  // assign vault contract
  setVaultContract(state, _contract) {
    state.vaultContract = _contract;
  },

  // assign poolTokens.
  setPoolTokens(state, _poolTokens) {
    state.poolTokens = _poolTokens;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
