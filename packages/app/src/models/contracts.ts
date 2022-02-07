export interface ContractState {
    rewardsContract: object | null,
    vaultContract: object | null,
    caplContract: object | null,
    caplBalance: number,
    pendingRewards: number,
}