import { InjectionKey } from "vue";
import { createStore, useStore as baseUseStore, Store } from "vuex";
import accounts from "./modules/accounts";
import contracts from "./modules/contracts";
import balancer from "./modules/balancer";
import rewards from "./modules/rewards";
import dashboard from "./modules/dashboard";

// define injection key
export const key: InjectionKey<Store<any>> = Symbol();

export const store = createStore<any>({
  modules: {
    accounts: accounts,
    contracts: contracts,
    balancer: balancer,
    rewards: rewards,
    dashboard: dashboard,
  },
  state: {},
});

export function useStore() {
  return baseUseStore(key);
}
