import { ethers } from "ethers"
import { reactive } from 'vue'

import { tokens } from "@/constants"
import { findObjectContract } from "@/utils"
import { RewardsState } from "@/models/rewards"
import { useContracts } from "./contracts"
import { useAccounts } from "./accounts"

const ChainID = process.env.VUE_APP_NETWORK_ID
  ? process.env.VUE_APP_NETWORK_ID
  : "1"

  const rewards = reactive({
    pendingRewards: 0,
    userStakedPosition: 0,
    userUnlockedAmount: 0,
    totalStaked: 0,
    caplPerSecond: 0
  } as RewardsState)

export const useRewards = () => {
  const { connected, activeAccount } = useAccounts()
  const {
    rewardsContract,
    vaultContract,
    lpContract,
    setContracts
  } = useContracts()

  const getPendingRewards = async () => {
    if (rewardsContract.value === null) { setContracts() }

    const lpAddress = lpContract.value.address
    const pendingRewards = await vaultContract.value
      ?.getPendingRewards(lpAddress, activeAccount.value)

    rewards.pendingRewards = Number(ethers.utils.formatUnits(pendingRewards, 18))
  }

  const getUserPosition = async () => {
    if (vaultContract.value === null) { setContracts() }

    const userPosition = await vaultContract.value?.getUserPosition(
      findObjectContract('LP', tokens, ChainID),
      activeAccount.value
    )

    rewards.userStakedPosition = Number(ethers.utils.formatUnits(userPosition.totalAmount, 18))
  }

  const getUserUnlockedAmount = async () => {
    if (!connected.value) { return 19 }

    if (vaultContract.value === null) { setContracts() }
    
    const lpAddress = lpContract.value.address
    const activeAccountAddress = activeAccount.value

    const unlockedAmount = await vaultContract.value
      ?.getUnlockedAmount(lpAddress, activeAccountAddress)

    rewards.userUnlockedAmount = Number(ethers.utils.formatUnits(unlockedAmount, 18))
  }

  const getTotalStaked = async () => {
    const lpAddress = lpContract.value?.address

    let totalSupply = await vaultContract.value?.getTokenSupply(lpAddress)
    totalSupply = Number(ethers.utils.formatEther(totalSupply.toString()))

    rewards.totalStaked = totalSupply
  }

  const getCaplPerSecond = async () => {
    const lpAddress = lpContract.value?.address
    const pool = await vaultContract.value?.getPool(lpAddress)

    const rewardsPerSecond = Number(
      ethers.utils.parseUnits(pool.rewardsPerSecond.toString(), 0)
    )

    rewards.caplPerSecond = rewardsPerSecond
  }

  const claim = async () => {
    if (rewardsContract.value === null) { setContracts() }

    const lpAddress = lpContract.value.address
    
    try {
      await rewardsContract.value.claim(lpAddress, activeAccount.value)
    } catch (err) {
      console.log(err)
    }
  }

  const stake = async ({ amount }: { amount: number }) => {
    if (rewardsContract.value === null) { setContracts() }

    const lpAddress = lpContract.value.address

    if (rewardsContract.value && amount) {
      try {
        await rewardsContract.value?.deposit(
          lpAddress,
          ethers.utils.parseUnits(amount.toString(), 18)
        )
      } catch (err) {
        console.log(err)
      }
    }
  }

  const unstake = async ({ amount }: { amount: number }) => {
    if (rewardsContract.value === null) { setContracts() }

    const lpAddress = lpContract.value.address

    if (rewardsContract.value && amount) {
      try {
        await rewardsContract.value?.withdraw(lpAddress, activeAccount.value)
      } catch (err) {
        console.log(err)
      }
    }
  }

  const getRewardsInfo = async () => {
    await getCaplPerSecond()
    await getTotalStaked()
    await getUserPosition()
  }

  return {
    rewards,
    getPendingRewards,
    getUserPosition,
    getUserUnlockedAmount,
    getTotalStaked,
    getCaplPerSecond,
    getRewardsInfo,
    claim,
    stake,
    unstake
  }
}
