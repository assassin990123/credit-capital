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
  const controller = await deployContract("Controller", capl.address)
  // access control
  // give ownership (minting rights) of capl to the vault
  // capl.transferOwnership(vault.address)
  // grant minting rights to rewards contract
  // vault.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MINTER')), rewards.address)

  return { capl, vault, rewards, controller }
}

const setupAccounts = (accounts) => {
  const deployer = accounts[0]
  const user = accounts[1]
  return { deployer, user }
}

const deployPool = async (vault, token, deployer) => {
  await vault.connect(deployer).addPool(token, 10)  // 10 CAPL per block

  const pool = await vault.connect(deployer).getPool(capl.address)

  expect(Number(pool.totalPooled.toString())).to.equal(0)
  expect(Number(pool.rewardsPerBlock.toString())).to.equal(10)
}

describe("Vault", function () {
  it("Deploy a new pool", async function () {

    // default account only for simplicity
    // will need to test access control in the future
    const accounts = await hre.ethers.getSigners();
    const { capl, vault } = await deployContracts()

    await vault.addPool(capl.address, 10)  // 10 CAPL per block

    const pool = await vault.getPool(capl.address)
  
    expect(Number(pool.totalPooled.toString())).to.equal(0)
    expect(Number(pool.rewardsPerBlock.toString())).to.equal(10)
  });
  it("Deposit a new position", async function () {
    const accounts = await hre.ethers.getSigners();
    const { deployer, user } = await setupAccounts(accounts);

    const { capl, vault, rewards } = await deployContracts()

    await vault.addPool(capl.address, 10)  // 10 CAPL per block

    await rewards.connect(user).deposit(capl.address, 10);
  })
});
