
import { reactive } from 'vue'
import { ethers } from "ethers"

import { TokenState } from "@/models/tokens"
import { useContracts } from './contracts'
import { useAccounts } from './accounts'

export const tokens = reactive({
  capl: {
    allowance: 0,
    balance: 0
  },
  usdc: {
    allowance: 0,
    balance: 0
  },
  lp: {
    allowance: 0,
    balance: 0
  }
} as TokenState)

export const useTokens = () => {
  const {
    connected,
    activeAccount
  } = useAccounts()

  const {
    caplContract,
    usdcContract,
    lpContract,
    rewardsContract,
    balancerVaultContract,
    setContracts
  } = useContracts()

  const approveBalancerVault = async ({ symbol }: { symbol: string }) => {
    const contract = symbol === 'CAPL'
      ? caplContract.value
      : usdcContract.value
    const address = balancerVaultContract.value.address

    if (contract) {
      await contract?.approve(address, '115792089237316195423570985008687907853269984665640564039457584007913129639935')
    }
  }

  const approveAll = async (flag: string) => {
    // handles three cases
    // 1. USDC Approvals, 2. CAPL approvals, 3. Both tokens approvals

    if (!flag) return;
  
    if (flag == "USDC") {
      approveBalancerVault({ symbol: 'USDC'})
    } else if (flag == "CAPL") {
      approveBalancerVault({ symbol: 'CAPL'})
    } else {
      approveBalancerVault({ symbol: 'USDC'})
      approveBalancerVault({ symbol: 'CAPL'})
    }
  };

  const approveRewards = async ({ amount }: { amount: number }) => {
    const contract = lpContract.value
    const rewardsAddress = rewardsContract.value.address

    if (contract && amount) {
      await contract?.approve(rewardsAddress, '115792089237316195423570985008687907853269984665640564039457584007913129639935')
    }
  }

  const getAllowances = async () => {
    if (!connected.value) { return }

    const balancerVaultAddress = balancerVaultContract.value.address
    const rewardsAddress = rewardsContract.value.address

    if (!caplContract.value || !usdcContract.value) { setContracts() }
    if (!caplContract.value?.signer || !usdcContract.value?.signer) { return }

    try {
      // TODO: ERC20 TYPES
      let caplBalancerVaultAllowance = await caplContract.value
        .allowance(activeAccount.value, balancerVaultAddress)
      caplBalancerVaultAllowance = Number(
        ethers.utils.formatEther(caplBalancerVaultAllowance.toString())
      )

      let usdcBalancerVaultAllowance = await usdcContract.value
        .allowance(activeAccount.value, balancerVaultAddress)
      usdcBalancerVaultAllowance = Number(
        ethers.utils.formatUnits(usdcBalancerVaultAllowance.toString(), 6)
      )

      let lpRewardsAllowance = await lpContract.value
        .allowance(activeAccount.value, rewardsAddress)
      lpRewardsAllowance = Number(
        ethers.utils.formatUnits(lpRewardsAllowance.toString(), 18)
      )

      tokens.capl.allowance = caplBalancerVaultAllowance
      tokens.usdc.allowance = usdcBalancerVaultAllowance
      tokens.lp.allowance = lpRewardsAllowance
    } catch (err) {
      console.log('Error while getting allowances', err)
    }
  }

  const getTokenBalances = async () => {
    if (!caplContract.value || !usdcContract.value || !lpContract.value) { setContracts() }

    const caplBalance = await caplContract.value.balanceOf(activeAccount.value)
    const usdcBalance = await usdcContract.value.balanceOf(activeAccount.value)
    const lpBalance = await lpContract.value.balanceOf(activeAccount.value)

    tokens.capl.balance = Number(ethers.utils.formatEther(caplBalance))
    tokens.usdc.balance = Number(ethers.utils.formatEther(usdcBalance))
    tokens.lp.balance = Number(ethers.utils.formatEther(lpBalance))
  }

  return {
    tokens,
    approveRewards,
    approveBalancerVault,
    approveAll,
    getAllowances,
    getTokenBalances
  }
}
