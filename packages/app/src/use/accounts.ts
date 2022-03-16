import { computed, reactive, toRefs } from "vue";

import { getEthereum } from '@/utils'
import { AccountState } from "@/models/accounts";

export const accounts = reactive({
  activeAccount: null,
  chainId: null,
  connected: false,
  signer: null,
  web3Provider: null
} as AccountState)

export const useAccounts = () => {
  const { chainId } = toRefs(accounts)
  const activeAccount = computed(() =>
    accounts.activeAccount || getEthereum().selectedAddress)
  const connected = computed({
    get: () => accounts.connected,
    set: (connected) => {
      accounts.connected = connected
      localStorage.setItem('isConnected', connected.toString())
    }
  })

  return {
    accounts,
    activeAccount,
    chainId,
    connected
  }
}
