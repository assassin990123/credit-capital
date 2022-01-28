import Web3 from "web3";
import WalletLink from 'walletlink'
import { AbiItem } from 'web3-utils'

import CAPLABI from "./ABI/CAPL.json";

const NETWORK_TYPE = process.env.VUE_APP_NETWORK ? process.env.VUE_APP_NETWORK : "mainnet" ;

const DEPLOYED_ADDRESS: {[key: string]: any} = {
  "rinkeby": {
    RPC_URL: "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
    CHAIN_ID: "4",

    CAPL: "0xe6264813D43Ef97cCE76E66be873040eBe9be09A",
  },
  "mainnet": {
    RPC_URL: "https://polygon-rpc.com/",
    CHAIN_ID: "137",

    CAPL: "",
  },
};


export const getAddress = (contractName: string) => {
  if (DEPLOYED_ADDRESS[NETWORK_TYPE] === undefined) {
    return false;
  }

  if (DEPLOYED_ADDRESS[NETWORK_TYPE][contractName] == undefined) {
    return false;
  }

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

  const CAPL = new web3.eth.Contract(CAPLABI as AbiItem[], getAddress('CAPL'));

  return {
    web3,
    CAPL
  }
};
