import { InjectionKey } from "vue";
import { createStore, useStore as baseUseStore, Store } from "vuex";
import accounts from "./modules/accounts";
import contracts from "./modules/contracts";
import vault from "./modules/vault";

// define injection key
export const key: InjectionKey<Store<any>> = Symbol();

export const store = createStore<any>({
  modules: {
    accounts: accounts,
    contracts: contracts,
    vault: vault,
  },
  state: {},
});

export function useStore() {
  return baseUseStore(key);
}
