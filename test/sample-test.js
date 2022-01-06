const { expect } = require("chai");
const { ethers } = require("hardhat");

const deployContract = async (contract, params) => {
  let c = await ethers.getContractFactory(contract);
  c = await c.deploy(params)
  return await c.deployed()
}

const deployContracts = async (deployer) => {
  const capl = await deployContract("CAPL", 100)
  const vault = await deployContract("Vault", capl.address)
  const rewards = await deployContract("RewardsV2", vault.address)
  // access control
  // give ownership (minting rights) of capl to the vault
  capl.transferOwnership(vault.address)
  // grant minting rights to rewards contract
  vault.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MINTER')), rewards.address)

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

    const { capl, vault, rewards } = await deployContracts()
    // test minting
    expect(await capl.balanceOf(deployer.address)).to.equal(100)

    // deploy a pool via rewards.depositStakeNew(address _token, address _amount)
    // approve externally
    await capl.approve(rewards.address, 100);

    await rewards.connect(deployer).depositStakeNew(capl.address, 10)
    // check both contracts persistance
    // vault contract capl balance
    expect(await capl.balanceOf(vault.address)).to.equal(10)
    // vault contract pool registered
    const pool = await vault.connect(user).getPoolInfo(capl.address)

    expect(Number(pool.totalPooled.toString())).to.equal(10)
    expect(pool.active).to.equal(true)

  });
});
