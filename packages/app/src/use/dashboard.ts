import { reactive } from 'vue'
import { ethers } from "ethers"

import { calculateCAPLUSDPrice } from "@/utils"
import { DashboardState } from "@/models/dashboard"
import { useContracts } from './contracts'
import { useBalancer } from "./balancer"
import { useRewards } from "./rewards"

export const dashboard = reactive({
  dailyEarnings: 0,
  tvl: 0,
  lpTokenSupply: 0,
  revenueProjectionPerDay: 0
} as DashboardState)

export const useDashboard = () => {
  const { lpContract, setContracts } = useContracts()
  const { balancer } = useBalancer()
  const { rewards, getCaplPerSecond, getTotalStaked, getUserPosition } = useRewards()

  const fetchTVL = async () => {
    if (!rewards.userStakedPosition) {
      dashboard.tvl = 0
      return
    }

    const poolTokens = balancer.poolTokens
    const usdcBalance = poolTokens.balances[0]
    const caplBalance = poolTokens.balances[1]

    if (lpContract.value === null) { setContracts() }

    const lpTokenTotalSupply = await lpContract.value.totalSupply()
    dashboard.lpTokenSupply = Number(ethers.utils
      .formatEther(lpTokenTotalSupply.toString()))

    const caplUSDPrice = calculateCAPLUSDPrice(+caplBalance, 'CAPL', poolTokens)
    const tvlTokenPrice = +usdcBalance + caplUSDPrice / +lpTokenTotalSupply

    dashboard.tvl = rewards.userStakedPosition + tvlTokenPrice
  }

  const fetchRevenueProjectionPerDay = async () => {
    if (!rewards.caplPerSecond) { await getCaplPerSecond() }
    if (!rewards.totalStaked) { await getTotalStaked() }
    if (!rewards.userStakedPosition) { await getUserPosition() }

    const rewardsPerDay = rewards.caplPerSecond * 86400
    const totalStakedLPTokens = rewards.totalStaked
    const userStakedLPTokens = rewards.userStakedPosition

    dashboard.revenueProjectionPerDay =
      rewardsPerDay / totalStakedLPTokens * userStakedLPTokens
  }

  return {
    dashboard,
    fetchTVL,
    fetchRevenueProjectionPerDay
  }
}
