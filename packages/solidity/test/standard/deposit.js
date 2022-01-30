const { expect } = require("chai");
const { toUtf8Bytes } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

const deployContract = async (contract, params) => {
  let c = await ethers.getContractFactory(contract);
  if (params) c = await c.deploy(params)
  else c = await c.deploy()
  return await c.deployed()
}

const deployContracts = async (deployer) => {
  const capl = await deployContract("CreditCapitalPlatformToken", [100])
  const vault = await deployContract("Vault", [null])
  const rewards = await deployContract("RewardsV2", [vault.address, capl.address])
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

describe("Rewards Vault", function () {
  it("Deploy a new pool", async function () {
    // will need to test access control in the future
    const { capl, vault } = await deployContracts()
    console.log("test");

    // await capl.mint(deployer.address, 100); // mint 100 CAPL
    await vault.addPool(capl.address, 10)  // 10 CAPL per block

    const pool = await vault.getPool(capl.address)
  
    expect(Number(pool.totalPooled.toString())).to.equal(0)
    expect(Number(pool.rewardsPerBlock.toString())).to.equal(10)
  });
  it("Deposit a new position", async function () {
    const accounts = await hre.ethers.getSigners();
    const { deployer, user } = await setupAccounts(accounts);
    const { capl, vault, rewards } = await deployContracts()

    await capl.mint(deployer, 100);
    await vault.addPool(capl.address, 10)  // 10 CAPL per block

    // grant rewards the REWARDS role in the vault
    vault.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('REWARDS')), rewards.address)

    // check deployer account capl balance & approve rewards spending
    expect(await capl.balanceOf(deployer.address)).to.equal(100)
    capl.approve(rewards.address, 10)

    await rewards.deposit(capl.address, 10);
    // check all vault variables to be correct
    // withdraw should be impossible
    const userPosition = await vault.getUserPosition(capl.address, deployer.address)
    // should be one user position, one pool, and one stake
    expect(Number(userPosition.totalAmount.toString())).to.equal(10)
    expect(Number(userPosition.rewardDebt.toString())).to.equal(0)
    expect(userPosition.stakes.length).to.equal(1)
    expect(Number(userPosition.stakes[0].amount.toString())).to.equal(10)

    // expect no unlocked amount
    const unlockedAmount = await vault.getUnlockedAmount(capl.address, deployer.address)
    expect(Number(unlockedAmount.value.toString())).to.equal(0)
  })
});
