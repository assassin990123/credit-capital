const { expect } = require("chai");
const { toUtf8Bytes } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

const deployContract = async (contract, params) => {
  let c = await ethers.getContractFactory(contract);
  if (params) c = await c.deploy(...params);
  else c = await c.deploy();
  return await c.deployed();
};

const deployContracts = async (deployer) => {
  const nft = await deployContract("MyToken", []);
  return { nft };
};

const _formatEther = (amount) => {
  return Number(ethers.utils.formatEther(amount));
};