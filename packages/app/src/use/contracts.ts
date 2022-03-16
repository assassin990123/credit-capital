import { ethers } from "ethers";
import {
  caplABI,
  rewardsABI,
  vaultABI,
  balancerVault as balancerVaultABI,
} from "@/abi";
import { contracts, tokens } from "@/constants";
import { markRaw, reactive, toRefs } from "vue";
import { findObjectContract, getEthereum } from "@/utils";
import { ContractState } from "@/models/contracts";
import { lpABI } from "@/abi/lp";
import { accounts } from './accounts'

const ChainID = process.env.VUE_APP_NETWORK_ID
  ? process.env.VUE_APP_NETWORK_ID
  : "1";

const contractInfo = reactive({
  balancerVaultContract: null,
  rewardsContract: null,
  vaultContract: null,
  caplContract: null,
  usdcContract: null,
  lpContract: null,
} as ContractState)

export const useContracts = () => {
  const {
    balancerVaultContract,
    rewardsContract,
    vaultContract,
    caplContract,
    usdcContract,
    lpContract,
  } = toRefs(contractInfo)

  const setContracts = () => {
    let providerOrSigner

    if (accounts.signer) {
      providerOrSigner = accounts.signer
    } else {
      providerOrSigner = new ethers.providers.Web3Provider(getEthereum())
    }

    try {
      contractInfo.caplContract = markRaw(new ethers.Contract(
        findObjectContract('CAPL', tokens, ChainID),
        caplABI,
        providerOrSigner
      ))
      contractInfo.usdcContract = markRaw(new ethers.Contract(
        findObjectContract('USDC', tokens, ChainID),
        caplABI,
        providerOrSigner
      ))
      contractInfo.vaultContract = markRaw(new ethers.Contract(
        findObjectContract('rewardsVault', contracts, ChainID),
        vaultABI,
        providerOrSigner
      )),
      contractInfo.rewardsContract = markRaw(new ethers.Contract(
        findObjectContract('rewards', contracts, ChainID),
        rewardsABI,
        providerOrSigner
      ))
      contractInfo.balancerVaultContract = markRaw(new ethers.Contract(
        findObjectContract('balancerVault', contracts, ChainID),
        balancerVaultABI,
        providerOrSigner
      ))
      contractInfo.lpContract = markRaw(new ethers.Contract(
        findObjectContract('LP', tokens, ChainID),
        lpABI,
        providerOrSigner
      ))
    } catch (err) {
      console.log('Error on setting up contracts', err)
    }
  }

  return {
    contractInfo,
    balancerVaultContract,
    rewardsContract,
    vaultContract,
    caplContract,
    usdcContract,
    lpContract,

    setContracts
  }
}
