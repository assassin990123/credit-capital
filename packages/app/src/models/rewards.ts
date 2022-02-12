export interface RewardsState {
  pendingRewards: number;
  userPosition: number;
  userStakedPosition: number;
  userUnlockedAmount: number;
  totalStaked: number;
  caplPerSecond: number;
}
