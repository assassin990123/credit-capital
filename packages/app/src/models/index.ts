import { AccountState } from "./accounts";
import { BalancerState } from "./balancer";
import { ContractState } from "./contracts";
import { RewardsState } from "./rewards";
import { DashboardState } from "./dashboard";
import { TokenState } from "./tokens";

export interface RootState {
  accounts: AccountState;
  balancer: BalancerState;
  contracts: ContractState;
  rewards: RewardsState;
  dashboard: DashboardState;
  tokens: TokenState;
}
