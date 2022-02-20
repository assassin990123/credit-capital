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
  addLiquidity: {},
};

const getters = {
  getPoolTokens() {
    return state.poolTokens;
  },

  getBatchSwap() {
    return state.batchSwap;
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

  async singleSwap(
    { commit, rootState, dispatch }: { commit: Commit; rootState: RootState; dispatch: Dispatch; },
    { amount, symbol }: { amount: number, symbol: string }
  ) {
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

    const fundSettings: any = {
      sender: rootState.accounts.activeAccount,
      recipient: rootState.accounts.activeAccount,
      fromInternalBalance: false,
      toInternalBalance: false,
    };

    const TOKEN_IN = symbol === 'CAPL' ? token_USDC : token_CAPL;
    const TOKEN_OUT = symbol === 'CAPL' ? token_CAPL : token_USDC;

    const swapKind = 0;
    const swap_struct = {
      poolId: pool_CAPL_USDC,
      kind: swapKind,
      assetIn: TOKEN_IN,
      assetOut: TOKEN_OUT,
      amount: ethers.BigNumber.from(
        (amount * Math.pow(10, tokenData[TOKEN_IN]["decimals"]))
      ),
      userData: "0x",
    };
    const fundStruct = {
      sender: ethers.utils.getAddress(fundSettings["sender"]),
      fromInternalBalance: fundSettings["fromInternalBalance"],
      recipient: ethers.utils.getAddress(fundSettings["recipient"]),
      toInternalBalance: fundSettings["toInternalBalance"],
    };
    console.log(fundSettings, fundStruct)
    const deadline = ethers.BigNumber.from("600000");
    const token_limit = ethers.BigNumber.from((tokenData[TOKEN_OUT]["limit"]) * Math.pow(10, tokenData[TOKEN_OUT]["decimals"])).toString();

    if (rootState.contracts.balancerVaultContract === null) {
      dispatch("contracts/setContracts", null, { root: true });
    }

    const balancerVaultContract = rootState.contracts.balancerVaultContract;

    // @ts-ignore
    try {
      // @ts-ignore
      const singleSwap = await balancerVaultContract?.swap(
        swap_struct,
        fundStruct,
        token_limit,
        deadline.toString(),
      );
      commit("setSingleSwap", singleSwap);
    } catch (e) {
      console.log(e)
    }
  },

  async addLiquidity({
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
    await balancerVaultContract?.joinPool(poolID, sender, recipient, request);
  },
};

const mutations = {
  setPoolTokens(state: BalancerState, _poolTokens: object) {
    state.poolTokens = _poolTokens;
  },

  setBatchSwap(state: BalancerState, _batchSwap: object) {
    state.batchSwap = _batchSwap;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
