import {AccountState} from "./accounts"
import {BalancerState} from "./balancer"
import {ContractState} from "./contracts"

export interface RootState {
    accounts: AccountState,
    balancer: BalancerState,
    contracts: ContractState
};