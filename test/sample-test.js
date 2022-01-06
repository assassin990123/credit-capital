const { expect } = require("chai");
const { ethers } = require("hardhat");

const deployContract = async (contract, params) => {
  let c = await ethers.getContractFactory(contract);
  c = await c.deploy(params)
  return await c.deployed()
}

describe("Vault", function () {
  it("Deploy a pool", async function () {

    // create reward token contract with default sender
    const capl = await deployContract("CAPL", 100)
    const vault = await deployContract("Vault", capl.address)
    const rewards = await deployContract("RewardsV2", vault.address)

    // give ownership (minting rights) of capl to the vault
    capl.transferOwnership(vault.address)
    // grant minting rights to rewards contract
    vault.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MINTER')), rewards.address)
    // test minting
    // deploy a pool via rewards.depositStakeNew(address _token, address _amount)
    // check both contracts persistance

  });
});
