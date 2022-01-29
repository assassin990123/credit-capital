import { ethers } from "ethers";

import { store } from "../store";

import CAPLABI from "./ABI/CAPL.json";
import VaultABI from "./ABI/Vault.json";
import RewardsABI from "./ABI/Rewards.json";

const NETWORK_TYPE = process.env.VUE_APP_NETWORK ? process.env.VUE_APP_NETWORK : "mainnet" ;
const ChainID = process.env.VUE_APP_NETWORK_ID ? process.env.VUE_APP_NETWORK_ID : "1" ;



const CAPLDeployments: {[key: string]: string} = {
  1: "",
  4: "0xe6264813D43Ef97cCE76E66be873040eBe9be09A",
};

const VaultDeployments: {[key: string]: string} = {
  1: "",
  4: "0x450534E9F3B431d192BE70B4bEbE57C54583c438",
};

const RewardsDeployments: {[key: string]: string} = {
  1: "",
  4: "0xDF9a85C7F10F5845399113c62543Cfa5DadE7482",
};

async function connectWallet () {
  if (store.getters.getConnected) {
    return;
  }

  if (window.ethereum) {
    const hexadecimal = '0x' + parseInt(ChainID).toString(16);

    try {
      // check if the chain to connect to is installed
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexadecimal }], // chainId must be in hexadecimal numbers
      });
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      // if it is not, then install it into the user MetaMask
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: hexadecimal,
                rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
              },
            ],
          });
        } catch (addError) {
          console.error(addError);
        }
      }
      console.error(error);
    }
  } else {
    // if no window.ethereum then MetaMask is not installed
    return 'MetaMask is not installed. Please consider installing it: https://metamask.io/download.html';
  } 
}

export const CAPLContractInit = (provider: any) => {
  connectWallet();
  const address = CAPLDeployments[ChainID]; // refactor
  return new ethers.Contract(address, CAPLABI, provider);
};

export const VaultContractInit = (provider: any) => {
  connectWallet();
  const address = VaultDeployments[ChainID]; // refactor
  return new ethers.Contract(address, VaultABI, provider);
};

export const RewardsContractInit = (provider: any) => {
  connectWallet();
  const address = RewardsDeployments[ChainID]; // refactor
  return new ethers.Contract(address, RewardsABI, provider);
};