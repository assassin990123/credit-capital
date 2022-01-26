import { InjectionKey } from "vue";
import { createStore, useStore as baseUseStore, Store } from "vuex";

// define your typings for the store state
export interface State {
  connected: boolean;
  wallet: string;
  tBalance: number;
  gBalance: number;
  pendingRewards: number;
  tokenIds: Array<any>;
  showMoons: boolean;
  baseUri: string;
}

// define injection key
export const key: InjectionKey<Store<State>> = Symbol();

export const store = createStore<State>({
  state: {
    connected: false,
    wallet: "",
    tBalance: 0,
    gBalance: 0,
    pendingRewards: 0,
    tokenIds: [],
    showMoons: false,
    baseUri: "",
  },
  mutations: {
    setConnected(state, value) {
      state.connected = value;
    },
    setWalletAddress(state, value) {
      state.wallet = value;
    },
    setTBalance(state, value) {
      state.tBalance = Number(value);
    },
    setGAmount(state, value) {
      state.gBalance = Number(value);
    },
    setUserTokenIds(state, value) {
      state.tokenIds = value;
    },
    setPendingRewards(state, value) {
      state.pendingRewards = Number(value);
    },
    showMoons(state, value) {
      state.showMoons = value;
    },
    setBaseUri(state, value) {
      state.baseUri = value;
    },
  },
  getters: {
    getConnected(state) {
      return state.connected;
    },
    getWallet(state) {
      return state.wallet;
    },
    getTBalance(state) {
      return state.tBalance;
    },
    getGBalance(state) {
      return state.gBalance;
    },
    getTokenIds(state) {
      return state.tokenIds;
    },
    getPendingRewards(state) {
      return state.pendingRewards;
    },
    getShowMoons(state) {
      return state.showMoons;
    },
    getBaseUri(state) {
      return state.baseUri;
    },
  },
});

export function useStore() {
  return baseUseStore(key);
}
