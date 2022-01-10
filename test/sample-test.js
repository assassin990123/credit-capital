const { expect } = require("chai");
const { ethers } = require("hardhat");

const deployContract = async (contract, params) => {
  let c = await ethers.getContractFactory(contract);
  if (params) c = await c.deploy(params)
  else c = await c.deploy()
  return await c.deployed()
}

const deployContracts = async (deployer) => {
  const capl = await deployContract("CAPL", 100)
  const vault = await deployContract("Vault", null)
  const rewards = await deployContract("RewardsV2", vault.address)
  // access control
  // give ownership (minting rights) of capl to the vault
  // capl.transferOwnership(vault.address)
  // grant minting rights to rewards contract
  // vault.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MINTER')), rewards.address)

  return { capl, vault, rewards }
}

const setupAccounts = (accounts) => {
  const deployer = accounts[0]
  const user = accounts[1]
  return { deployer, user }
}

describe("Vault", function () {
  it("Deploy a new (CAPL) pool", async function () {

    // default account only for simplicity
    // will need to test access control in the future
    const accounts = await hre.ethers.getSigners();
    const { deployer, user } = await setupAccounts(accounts);

    const { capl, vault } = await deployContracts()
    // test minting
    expect(await capl.balanceOf(deployer.address)).to.equal(100)

    await capl.approve(vault.address, 100);
    
    await vault.connect(deployer).depositStakeNew(capl.address, 10, 10)

  });
});
