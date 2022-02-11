import { ethers } from "ethers";
import { Commit, Dispatch } from "vuex";
import { pools, tokens } from "@/constants";
import { findObjectContract, findObjectId, Pool, Constant } from "@/utils";
import { BalancerState } from "@/models/balancer";
import { RootState } from "@/models";

const ChainID = process.env.VUE_APP_NETWORK_ID
  ? process.env.VUE_APP_NETWORK_ID
  : "1";

const state: BalancerState = {
  poolTokens: {},
  batchSwap: {},
  joinPool: {},
};

const getters = {
  getPoolTokens() {
    return state.poolTokens;
  },

  getBatchSwap() {
    return state.batchSwap;
  },

  getJoinPool() {
    return state.joinPool;
  },
};

const actions = {
  async getPoolTokens({
    commit,
    rootState,
    dispatch,
  }: {
    commit: Commit;
    rootState: RootState;
    dispatch: Dispatch;
  }) {
    // get poolID
    const poolID = findObjectId("CAPL/USDC", pools as Pool[], ChainID);

    if (rootState.contracts.balancerVaultContract === null) {
      dispatch("contracts/setContracts", null, { root: true });
    }

    const balancerVaultContract = rootState.contracts.balancerVaultContract;

    // call getPoolTokens
    // @ts-ignore
    const poolTokens = await balancerVaultContract.getPoolTokens(poolID);
    // calculate token amount based on received values...
    const usdcBalance = poolTokens.balances[0];
    const caplBalance = poolTokens.balances[1];

    const balances = [
      ethers.utils.formatUnits(usdcBalance, 6),
      ethers.utils.formatEther(caplBalance),
    ];

    // call setPoolTokens in mutations.
    commit("setPoolTokens", {
      tokens: poolTokens.tokens,
      balances: balances,
    });
  },

  async batchSwap({
    commit,
    rootState,
    dispatch,
  }: {
    commit: Commit;
    rootState: RootState;
    dispatch: Dispatch;
  }) {
    const pool_CAPL_USDC = findObjectId("CAPL/USDC", pools as Pool[], ChainID);

    const token_CAPL = findObjectContract("CAPL", tokens, ChainID);
    const token_USDC = findObjectContract("USDC", tokens, ChainID);

    const tokenData: any = {};
    tokenData[token_USDC] = {
      symbol: "USDC",
      decimals: "6",
      limit: 100,
    };
    tokenData[token_CAPL] = {
      symbol: "CAPL",
      decimals: "18",
      limit: 0,
    };
    const tokenAddresses = Object.keys(tokenData);
    tokenAddresses.sort();
    const tokenIndices: any = {};
    for (let i = 0; i < tokenAddresses.length; i++) {
      tokenIndices[tokenAddresses[i]] = i;
    }

    const fundSettings: any = {
      sender: rootState.accounts.activeAccount,
      recipient: rootState.accounts.activeAccount,
      fromInternalBalance: false,
      toInternalBalance: false,
    };

    const tokenLimits = [];
    const checksumTokens = [];
    for (const token of tokenAddresses) {
      tokenLimits.push(
        ethers.BigNumber.from(
          (
            tokenData[token]["limit"] *
            Math.pow(10, tokenData[token]["decimals"])
          ).toString()
        )
      );
      checksumTokens.push(ethers.utils.getAddress(token));
    }

    const swapKind = 0;
    const swapSteps = [
      {
        poolId: pool_CAPL_USDC,
        assetInIndex: tokenIndices[token_CAPL],
        assetOutIndex: tokenIndices[token_USDC],
        amount: ethers.BigNumber.from(
          (100 * Math.pow(10, tokenData[token_USDC]["decimals"])).toString()
        ),
        userData: "0x",
      },
      {
        poolId: pool_CAPL_USDC,
        assetInIndex: tokenIndices[token_CAPL],
        assetOutIndex: tokenIndices[token_USDC],
        amount: ethers.BigNumber.from(
          (0 * Math.pow(10, tokenData[token_CAPL]["decimals"])).toString()
        ),
        userData: "0x",
      },
    ];
    const fundStruct = {
      sender: ethers.utils.getAddress(fundSettings["sender"]),
      fromInternalBalance: fundSettings["fromInternalBalance"],
      recipient: ethers.utils.getAddress(fundSettings["recipient"]),
      toInternalBalance: fundSettings["toInternalBalance"],
    };
    const deadline = ethers.BigNumber.from("999999999999999999");

    if (rootState.contracts.balancerVaultContract === null) {
      dispatch("contracts/setContracts", null, { root: true });
    }

    const balancerVaultContract = rootState.contracts.balancerVaultContract;

    // @ts-ignore
    const batchSwap = await balancerVaultContract?.batchSwap(
      swapKind,
      swapSteps,
      checksumTokens,
      fundStruct,
      tokenLimits,
      deadline
    );

    commit("setBatchSwap", batchSwap);
  },

  async joinPool({
    commit,
    rootState,
    dispatch,
  }: {
    commit: Commit;
    rootState: RootState;
    dispatch: Dispatch;
  }) {
    if (rootState.contracts.balancerVaultContract === null) {
      dispatch("contracts/setContracts", null, { root: true });
    }

    const balancerVaultContract = rootState.contracts.balancerVaultContract;

    const poolID = findObjectId("CAPL/USDC", pools as Pool[], ChainID);
    const sender = rootState.accounts.activeAccount;
    const recipient = rootState.accounts.activeAccount;

    const token_CAPL = findObjectContract("CAPL", tokens, ChainID);
    const token_USDC = findObjectContract("USDC", tokens, ChainID);

    const assets = [
      {
        token: token_CAPL,
        maxAmountsIn: ethers.BigNumber.from(
          (100 * Math.pow(10, 18)).toString()
        ),
      },
      {
        token: token_USDC,
        maxAmountsIn: ethers.BigNumber.from(
          (100 * Math.pow(10, 18)).toString()
        ),
      },
    ];
    assets.sort((asset1, asset2) => {
      if (asset1.token > asset2.token) {
        return 1;
      }
      if (asset1.token < asset2.token) {
        return -1;
      }
      return 0;
    });
    const request: any = {
      assets: assets.map((asset) => asset.token),
      maxAmountsIn: assets.map((asset) => asset.maxAmountsIn),
      userData: "0x",
      fromInternalBalance: false,
    };

    // @ts-ignore
    const joinPool = await balancerVaultContract?.joinPool(
      poolID,
      sender,
      recipient,
      request
    );

    commit("setJoinPool", joinPool);
  },
};

const mutations = {
  setPoolTokens(state: BalancerState, _poolTokens: object) {
    state.poolTokens = _poolTokens;
  },

  setBatchSwap(state: BalancerState, _batchSwap: object) {
    state.batchSwap = _batchSwap;
  },

  setJoinPool(state: BalancerState, _joinPool: object) {
    state.joinPool = _joinPool;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
