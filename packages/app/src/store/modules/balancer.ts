// @ts-nocheck
import { ethers } from "ethers";
import Web3 from "web3";
import { balancerVault as balancerVaultABI } from "../../contracts/abi";
import { balancerVault as balancerVault, caplUSDCPoolId } from "../../contracts";
import { markRaw } from "vue";

const ChainID = process.env.VUE_APP_NETWORK_ID
  ? Number(process.env.VUE_APP_NETWORK_ID)
  : 1;

const state = {
  balancerVaultContract: null,
  poolTokens: {},
  batchSwap: {},
};

const getters = {
  getBalancerVaultContract(state) {
    return state.balancerVaultContract;
  },

  getPoolTokens() {
    return state.poolTokens;
  },

  getBatchSwap() {
    return state.batchSwap;
  }
};

const actions = {
  async setContracts({ commit, rootState }) {
    const provider = rootState.accounts.web3Provider;
    commit(
      "setBalancerVaultContract",
      markRaw(new ethers.Contract(balancerVault[ChainID], balancerVaultABI, provider))
    );
  },

  async getPoolTokens({ commit, rootState }) {
    // get poolID
    const poolID = caplUSDCPoolId[ChainID];

    // if state.balancerVaultContract is null, call the `setContracts` function
    if (state.balancerVaultContract === null) {
      actions.setContracts({ commit, rootState });
    }
    const balancerVaultContract = state.balancerVaultContract;
    
    // call getPoolTokens
    const poolTokens = await balancerVaultContract.getPoolTokens(poolID);
    
    // parse balance
    const balances = poolTokens.balances.map(obj => ethers.utils.formatUnits(obj, 18));
    
    // call setPoolTokens in mutations.
    commit("setPoolTokens", {
      "tokens" : poolTokens.tokens,
      "balances":  balances
    });
  },

  async batchSwap({ commit, rootState }) {
    const pool_WETH_USDC = "0x3a19030ed746bd1c3f2b0f996ff9479af04c5f0a000200000000000000000004";
    const pool_BAL_WETH = "0x61d5dc44849c9c87b0856a2a311536205c96c7fd000200000000000000000000";

    const token_BAL = "0x41286Bb1D3E870f3F750eB7E1C25d7E48c8A1Ac7".toLowerCase();
    const token_USDC  = "0xc2569dd7d0fd715B054fBf16E75B001E5c0C1115".toLowerCase();
    const token_WETH = "0xdFCeA9088c8A88A76FF74892C1457C17dfeef9C1".toLowerCase();
    const tokenData = {};
    tokenData[token_BAL] = {
      "symbol": "BAL",
      "decimals": "18",
      "limit": "0"
    };
    tokenData[token_USDC] = {
      "symbol": "USDC",
      "decimals": "6",
      "limit": 100
    };
    tokenData[token_WETH] = {
      "symbol": "WETH",
      "decimals": "18",
      "limit": 0
    };
    const tokenAddresses = Object.keys(tokenData);
    tokenAddresses.sort();
    const tokenIndices = {};
    for (let i = 0; i < tokenAddresses.length; i++) {
      tokenIndices[tokenAddresses[i]] = i;
    }

    const fundSettings = {
      "sender": rootState.accounts.activeAccount,
      "recipient": rootState.accounts.activeAccount,
      "fromInternalBalance": false,
      "toInternalBalance": false
    };

    const tokenLimits = [];
    const checksumTokens = [];
    for (const token of tokenAddresses) {
      tokenLimits.push(ethers.utils.formatUnits(tokenData[token]["limit"], 18));
      checksumTokens.push(Web3.utils.toChecksumAddress(token));
    }

    const swapKind = 0;
    const swapSteps = [{
      poolId: pool_WETH_USDC,
      assetInIndex: tokenIndices[token_USDC],
      assetOutIndex: tokenIndices[token_WETH],
      amount: ethers.utils.formatUnits(100, 18),
      userData: '0x',
    }, {
      poolId: pool_BAL_WETH,
      assetInIndex: token_WETH,
      assetOutIndex: token_BAL,
      amount: 0,
      userData: '0x',
    }];
    const fundStruct = {
      sender: Web3.utils.toChecksumAddress(fundSettings["sender"]),
      fromInternalBalance: fundSettings["fromInternalBalance"],
      recipient: Web3.utils.toChecksumAddress(fundSettings["recipient"]),
      toInternalBalance: fundSettings["toInternalBalance"]
    };
    const deadline = ethers.utils.formatUnits(999999999999999999, 18);

    if (state.balancerVaultContract === null) {
      actions.setContracts({ commit, rootState });
    }
    const balancerVaultContract = state.balancerVaultContract;

    const batchSwap = await balancerVaultContract.batchSwap(swapKind, swapSteps, checksumTokens, fundStruct, tokenLimits, deadline);

    commit("setBatchSwap", batchSwap);
  },
};

const mutations = {
  setBalancerVaultContract(state, _contract) {
    state.balancerVaultContract = _contract;
  },

  setPoolTokens(state, _poolTokens) {
    state.poolTokens = _poolTokens;
  },

  setBatchSwap(state, _batchSwap) {
    state.batchSwap = _batchSwap;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
