import { ethers } from "ethers";
import { pools, tokens } from "@/constants";
import { findObjectContract, findObjectId, Pool } from "@/utils";
import { BalancerState } from "@/models/balancer";
import { reactive } from "vue";
import { useContracts } from './contracts'
import { useAccounts } from "./accounts";

const ChainID = process.env.VUE_APP_NETWORK_ID
  ? process.env.VUE_APP_NETWORK_ID
  : "1";

enum JoinKind {
  INIT,
  EXACT_TOKENS_IN_FOR_BPT_OUT,
  TOKEN_IN_FOR_EXACT_BPT_OUT,
  ALL_TOKENS_IN_FOR_EXACT_BPT_OUT,
}

export const balancer = reactive({
  poolTokens: {
    tokens: {},
    balances: [],
  },
  addLiquidity: {},
  batchSwap: {},
} as BalancerState)

export const useBalancer = () => {
  const { activeAccount } = useAccounts()
  const { balancerVaultContract, setContracts } = useContracts()

  const getPoolTokens = async () => {
    // get poolID
    const poolID = findObjectId('CAPL/USDC', pools as Pool[], ChainID)

    if (balancerVaultContract.value === null) { setContracts() }

    const poolTokens = await balancerVaultContract.value.getPoolTokens(poolID)

    const usdcBalance = poolTokens.balances[0]
    const caplBalance = poolTokens.blaances[1]

    const balances = [
      ethers.utils.formatUnits(usdcBalance, 6),
      ethers.utils.formatEther(caplBalance)
    ]

    balancer.poolTokens = {
      tokens: poolTokens.tokens,
      balances: balances
    }
  }

  const singleSwap = async ({ amount, symbol }: { amount: number, symbol: string }) => {
    const pool_CAPL_USDC = findObjectId('CAPL/USDC', pools as Pool[], ChainID)
    const token_CAPL = findObjectContract('CAPL', tokens, ChainID)
    const token_USDC = findObjectContract('USDC', tokens, ChainID)

    const tokenData: any = {
      token_USDC: {
        symbol: 'USDC',
        decimals: '6',
        liimit: symbol === 'CAPL' ? 0 : amount
      },
      token_CAPL: {
        symbol: 'CAPL',
        decimals: '18',
        limit: symbol === 'CAPL' ? amount: 0
      }
    }

    const fundSettings = {
      sender: activeAccount.value,
      recipient: activeAccount.value,
      fromInternalBalance: false,
      toInternalBalance: false,
    }

    const TOKEN_IN = symbol === 'CAPL' ? token_CAPL : token_USDC
    const TOKEN_OUT = symbol === 'CAPL' ? token_USDC : token_CAPL

    const swapKind = 0
    const swap_struct = {
      poolId: pool_CAPL_USDC,
      kind: swapKind,
      assetIn: TOKEN_IN,
      assetOut: TOKEN_OUT,
      amount: ethers.utils
        .parseUnits(amount.toString(), tokenData[TOKEN_IN]['decimals'])
        .toString(),
      userData: '0x'
    }

    const fundStruct = {
      sender: ethers.utils.getAddress(fundSettings.sender),
      fromInternalBalance: fundSettings.fromInternalBalance,
      recipient: ethers.utils.getAddress(fundSettings.recipient),
      toInternalBalance: fundSettings.toInternalBalance
    }

    const deadline = ethers.BigNumber.from('999999999999999999')
    const token_limit = ethers.BigNumber.from(
      tokenData.TOKEN_OUT.limit * Math.pow(10, tokenData.TOKEN_OUT.decimals)
    ).toString()

    if (balancerVaultContract.value === null) { setContracts() }

    await balancerVaultContract.value?.swap(
      swap_struct,
      fundStruct,
      token_limit,
      deadline.toString()
    )
  }

  const addLiquidity = async (
    {
      caplAmount, usdcAmount
    }: {
      caplAmount: number, usdcAmount: number
    }
  ) => {
    if (balancerVaultContract.value === null) { setContracts() }

    const poolId = findObjectId('CAPL/USDC', pools as Pool[], ChainID)
    const sender = activeAccount.value
    const recipient = activeAccount.value

    const token_CAPL = findObjectContract('CAPL', tokens, ChainID)
    const token_USDC = findObjectContract('USDC', tokens, ChainID)

    const assets = [
      {
        token: token_CAPL,
        maxAmountsIn: ethers.utils.parseUnits(caplAmount.toString(), 18)
      },
      {
        token: token_USDC,
        maxAmountsIn: ethers.BigNumber.from(usdcAmount * Math.pow(10, 6))
      }
    ]

    assets.sort((asset1, asset2) => {
      if (asset1.token > asset2.token) { return 1 }
      if (asset1.token < asset2.token) { return -1 }
      return 0
    })

    const userType = ["uint256", "uint256[]"]
    const userData = [
      JoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT,
      assets.map((asset) => asset.maxAmountsIn)
    ]
    const encodedUserData = ethers.utils
      .defaultAbiCoder.encode(userType, userData)

    const request = {
      assets: assets.map((asset) => asset.token),
      maxAmountsIn: assets.map((asset) => asset.maxAmountsIn),
      userData: encodedUserData,
      fromInternalBalance: false
    }

    await balancerVaultContract.value?.joinPool(poolId, sender, recipient, request)
  }

  return {
    balancer,
    getPoolTokens,
    singleSwap,
    addLiquidity
  }
}
