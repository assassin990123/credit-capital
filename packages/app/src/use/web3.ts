import { markRaw } from 'vue'
import { useAccounts } from "@/use/accounts"
import detectEthereumProvider from "@metamask/detect-provider"
import { ethers } from "ethers";
import { getEthereum } from '@/utils'
import { checkWalletConnect, showConnectResult } from "@/utils/notifications";
import { useContracts } from '@/use/contracts';
import { useBalancer } from '@/use/balancer';
import { useTokens } from '@/use/tokens';
import { useRewards } from '@/use/rewards';
import { useDashboard } from '@/use/dashboard';

interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}

const ChainID = process.env.VUE_APP_NETWORK_ID
  ? process.env.VUE_APP_NETWORK_ID
  : "1";

export const useWeb3 = () => {
  const { setContracts } = useContracts()
  const { getPoolTokens } = useBalancer()
  const { getAllowances } = useTokens()
  const { getRewardsInfo } = useRewards()
  const { fetchTVL } = useDashboard()

  const { connected, activeAccount } = useAccounts()

  const ethereumListener = () => {
    getEthereum().on('accountsChanged', (accounts: any) => {
      if (!accounts.length) {
        accounts.connected = false
        accounts.activeAccount = null
      }
      else if (accounts.connected) {
        accounts.activeAccount = accounts[0]
      }
    })

    getEthereum().on('disconnect', async (error: ProviderRpcError) => {
      connected.value = false
      window.location.reload()
      console.log('disconnect error:', error.message)
    })
  }

  const checkNetwork = async () => {
    if (getEthereum()) {
      const hex = "0x" + parseInt(ChainID).toString(16);

      try {
        // check if the chain to connect to is installed
        await getEthereum().request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: hex }] // chainId must be in hexadecimal numbers
        })
      } catch (error: any) {
        // This error code indicates that the chain has not been added to MetaMask
        // if it is not, then install it into the user MetaMask
        if (error.code === 4902) {
          try {
            await getEthereum().request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: hex,
                  rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545/",
                },
              ],
            })
          } catch (addError) {
            console.log(addError)
          }
        }
        console.log(error)
      }
    }
  }

  const initWeb3 = async () => {
    console.log('init web3', connected.value)
    if (connected.value) { return }

    const ethProvider: any = await detectEthereumProvider()
    const provider = new ethers.providers.Web3Provider(ethProvider)

    if (provider) {
      if (await getEthereum()._metamask.isUnlocked()) {
        const accounts = await getEthereum().request({
          method: "eth_requestAccounts",
        })

        await checkNetwork()
        accounts.connected = true
        accounts.activeAccount = accounts[0]
        accounts.web3Provider = provider
        accounts.signer = markRaw(provider.getSigner(activeAccount.value))
      } else {
        checkWalletConnect()
      }

      ethereumListener()
    } else {
      await setContracts()
      await getPoolTokens()
      await getAllowances()
    }
  }

  const connectWeb3 = async () => {
    await initWeb3()
    if (connected.value) {
      await getRewardsInfo()
      await getPoolTokens()
      await fetchTVL()
    }

    showConnectResult()
  }

  return {
    connectWeb3
  }
}
