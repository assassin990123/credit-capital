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
  const capl = await deployContract("CreditCapitalPlatformToken", [100]);
  const vault = await deployContract("VaultMock", []);
  const rewards = await deployContract("Rewards", [
    vault.address,
    capl.address,
  ]);
  // access control
  // give ownership (minting rights) of capl to the vault
  // capl.transferOwnership(vault.address)
  // grant minting rights to rewards contract
  // vault.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MINTER')), rewards.address)
  return { capl, vault, rewards };
};

const setupAccounts = (accounts) => {
  const deployer = accounts[0];
  const user = accounts[1];
  return { deployer, user };
};

describe("Rewards Vault", function () {
  it("Deposit and withdraw a new position", async function () {
    const accounts = await hre.ethers.getSigners();
    const { deployer, user } = await setupAccounts(accounts);
    const { capl, vault, rewards } = await deployContracts();
    await capl.mint(deployer.address, 100); // mint 100 CAPL
    await vault.addPool(capl.address, 10); // 10 CAPL per block

    // grant rewards the REWARDS role in the vault
    vault.grantRole(
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("REWARDS")),
      rewards.address
    );

    // check deployer account capl balance & approve rewards spending
    expect(await capl.balanceOf(deployer.address)).to.equal(100);
    capl.approve(rewards.address, 10);

    await rewards.deposit(capl.address, 10);
    // check all vault variables to be correct
    // withdraw should be impossible
    const userPosition = await vault.getUserPosition(
      capl.address,
      deployer.address
    );
    // should be one user position, one pool, and one stake
    expect(Number(userPosition.totalAmount.toString())).to.equal(10);
    expect(Number(userPosition.rewardDebt.toString())).to.equal(0);
    expect(userPosition.stakes.length).to.equal(1);
    expect(Number(userPosition.stakes[0].amount.toString())).to.equal(10);
    // fast forward
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine"); // this one will have 02:00 PM as its timestamp

    const latestBlock = await hre.ethers.provider.getBlock("latest");
    // with mock, in 60 seconds the funds are unlocked for withdrawals
    // simulate call
    const unlockedAmount = await vault.callStatic.getUnlockedAmount(
      capl.address,
      deployer.address
    );
    expect(Number(unlockedAmount.toString())).to.equal(10);

    // TODO: withdraw test
  });
});
