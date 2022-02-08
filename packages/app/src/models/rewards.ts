export interface RewardsState {
  rewardsContract: object | null;
  vaultContract: object | null;
  claim: object | null;
  pendingRewards: object | null;
  userPosition: object | null;
  userStakedPositions: object | null;
  stake: object | null;
  unstake: object | null;
  deposit: object | null;
  withdraw: object | null;
}
