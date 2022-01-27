import Web3 from "web3";
import WalletLink from 'walletlink'
import { AbiItem } from 'web3-utils'

import ERC20MockABI from "./ABI/Mocks/ERC20Mock.json";
import VaultMockABI from "./ABI/Mocks/VaultMock.json";

import RewardsIControllerABI from "./ABI/Standard/Rewards/IController.json";
import RewardsIVaultABI from "./ABI/Standard/Rewards/IVault.json";
import RewardsReqardsV2ABI from "./ABI/Standard/Rewards/RewardsV2.json";

import TokenIControllerABI from "./ABI/Standard/TokenController/IController.json";

import TokenControllerABI from "./ABI/Standard/TokenController/Controller/Controller.json";
import TokenICAPLABI from "./ABI/Standard/TokenController/Controller/ICAPL.json";

import VaultABI from "./ABI/Standard/Vault/Vault.json";

import CreditCapitalPlatformTokenABI from "./ABI/Tokens/CreditCapitalPlatformToken.json";

import CAPLABI from "./ABI/Tokens/CAPL/CAPL.json";
import CAPLERC20ABI from "./ABI/Tokens/CAPL/ERC20.json";
import CAPLIERC20ABI from "./ABI/Tokens/CAPL/IERC20.json";
import CAPLIERC20MetadataABI from "./ABI/Tokens/CAPL/IERC20Metadata.json";
import CAPLOwnableABI from "./ABI/Tokens/CAPL/Ownable.json";

import RevenueControllerABI from "./ABI/Treasury/RevenueController.json";
import TreasuryFundABI from "./ABI/Treasury/TreasuryFund.json";

import TreasuryStorageItreasurySharesABI from "./ABI/Treasury/TreasuryStorage/ITreasuryShares.json";
import TreasuryStorageTreasuryStorageABI from "./ABI/Treasury/TreasuryStorage/TreasuryStorage.json";

const NETWORK_TYPE = process.env.VUE_APP_NETWORK ? process.env.VUE_APP_NETWORK : "mainnet" ;

const DEPLOYED_ADDRESS: {[key: string]: any} = {
  "kovan": {
    RPC_URL: "https://rpc-mumbai.maticvigil.com/",
    CHAIN_ID: "80001",
    // Mocks
    ERC20MOCK: "",
    VaultMock: "",
    // standard/rewards
    RewardsIController: "",
    IVault: "",
    RewardsV2: "",
    // standard/tokenController
    TokenIController: "",
    // standard/tokenController/Controller
    TokenController: "",
    TokenICAPL: "",
    // standard/vault
    Vault: "",
    // Tokens
    CreditCapitalPlatformToken: "",
    // Tokens/CAPL
    CAPL: "",
    CAPLERC20: "",
    CAPLIERC20: "",
    CAPLIERC20Metadata: "",
    CAPLOwnable: "",
    // TreasuryStorage
    RevenueController: "",
    TreasuryFund: "",
    // TreasuryStorage/TresuryStorage
    TreasuryStorageItreasuryShares: "",
    TreasuryStorageTreasuryStorage: ""    
  },
  "mainnet": {
    RPC_URL: "https://polygon-rpc.com/",
    CHAIN_ID: "137",
    // Mocks
    ERC20MOCK: "",
    VaultMock: "",
    // standard/rewards
    RewardsIController: "",
    IVault: "",
    RewardsV2: "",
    // standard/tokenController
    TokenIController: "",
    // standard/tokenController/Controller
    TokenController: "",
    TokenICAPL: "",
    // standard/vault
    Vault: "",
    // Tokens
    CreditCapitalPlatformToken: "",
    // Tokens/CAPL
    CAPL: "",
    CAPLERC20: "",
    CAPLIERC20: "",
    CAPLIERC20Metadata: "",
    CAPLOwnable: "",
    // TreasuryStorage
    RevenueController: "",
    TreasuryFund: "",
    // TreasuryStorage/TresuryStorage
    TreasuryStorageItreasuryShares: "",
    TreasuryStorageTreasuryStorage: ""
  },
};


export const getAddress = (contractName: string) => {
  return DEPLOYED_ADDRESS[NETWORK_TYPE][contractName];
}

const RPC_URL = getAddress('RPC_URL');
const CHAIN_ID = getAddress('CHAIN_ID');

export const walletLink = new WalletLink({
  appName: 'Credit Capital',
  darkMode: true,
})

export const ethereum = walletLink.makeWeb3Provider(RPC_URL, CHAIN_ID)

export const getContracts = (walletType: any) => {
  let web3;

  switch (walletType) {
    case 'MetaMask':
      //@ts-ignore
      web3 = new Web3(window.ethereum)
      break
    case 'Coinbase':
      web3 = new Web3(ethereum)
      break
    default:
      web3 = new Web3(RPC_URL)
      break
  }

  const ERC20Mock = new web3.eth.Contract(ERC20MockABI as AbiItem[], getAddress('ERC20MOCK'));
  const VaultMock = new web3.eth.Contract(VaultMockABI as AbiItem[], getAddress('VaultMock'));

  const RewardsIController = new web3.eth.Contract(RewardsIControllerABI as AbiItem[], getAddress('RewardsIController'));
  const RewardsIVault = new web3.eth.Contract(RewardsIVaultABI as AbiItem[], getAddress('IVault'));
  const RewardsReqardsV2 = new web3.eth.Contract(RewardsReqardsV2ABI as AbiItem[], getAddress('RewardsV2'));

  const TokenIController = new web3.eth.Contract(TokenIControllerABI as AbiItem[], getAddress('TokenIController'));

  const TokenController = new web3.eth.Contract(TokenControllerABI as AbiItem[], getAddress('TokenController'));
  const TokenICAPL = new web3.eth.Contract(TokenICAPLABI as AbiItem[], getAddress('TokenICAPL'));

  const Vault = new web3.eth.Contract(VaultABI as AbiItem[], getAddress('Vault'));

  const CreditCapitalPlatformToken = new web3.eth.Contract(CreditCapitalPlatformTokenABI as AbiItem[], getAddress('CreditCapitalPlatformToken'));
  const CAPL = new web3.eth.Contract(CAPLABI as AbiItem[], getAddress('CAPL'));
  const CAPLERC20 = new web3.eth.Contract(CAPLERC20ABI as AbiItem[], getAddress('CAPLERC20'));
  const CAPLIERC20 = new web3.eth.Contract(CAPLIERC20ABI as AbiItem[], getAddress('CAPLIERC20'));
  const CAPLIERC20Metadata = new web3.eth.Contract(CAPLIERC20MetadataABI as AbiItem[], getAddress('CAPLIERC20Metadata'));
  const CAPLOwnable = new web3.eth.Contract(CAPLOwnableABI as AbiItem[], getAddress('CAPLOwnable'));

  const RevenueController = new web3.eth.Contract(RevenueControllerABI as AbiItem[], getAddress('RevenueController'));
  const TreasuryFund = new web3.eth.Contract(TreasuryFundABI as AbiItem[], getAddress('TreasuryFund'));

  const TreasuryStorageItreasuryShares = new web3.eth.Contract(TreasuryStorageItreasurySharesABI as AbiItem[], getAddress('TreasuryStorageItreasuryShares'));
  const TreasuryStorageTreasuryStorage = new web3.eth.Contract(TreasuryStorageTreasuryStorageABI as AbiItem[], getAddress('TreasuryStorageTreasuryStorage'));


  return {
    web3,
    ERC20Mock,
    VaultMock,
    RewardsIController,
    RewardsIVault,
    RewardsReqardsV2,
    TokenIController,
    TokenController,
    TokenICAPL,
    Vault,
    CreditCapitalPlatformToken,
    CAPL,
    CAPLERC20,
    CAPLIERC20,
    CAPLIERC20Metadata,
    CAPLOwnable,
    RevenueController,
    TreasuryFund,
    TreasuryStorageItreasuryShares,
    TreasuryStorageTreasuryStorage
  }
};
