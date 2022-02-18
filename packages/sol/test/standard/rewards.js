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
  const capl = await deployContract("CreditCapitalPlatformToken", [BigInt(100_000_000 * (10 ** 18))]);
  const lp = await deployContract("ERC20Mock", [
    "LP",
    "LP",
    deployer.address,
    1_000_000,
  ]);
  const vault = await deployContract("Vault", [
    lp.address,
    BigInt((5000 / (24 * 60 * 60)) * 10 ** 18),
  ]);
  const rewards = await deployContract("Rewards", [
    vault.address,
    capl.address,
  ]);
  // access control
  // give ownership (minting rights) of capl to the vault
  // capl.transferOwnership(vault.address)
  // grant minting rights to rewards contract
  // vault.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MINTER_ROLE')), rewards.address)
  return { capl, vault, rewards, lp };
};

const setupAccounts = (accounts) => {
  const deployer = accounts[0];
  const user = accounts[1];
  const user2 = accounts[2];
  return { deployer, user, user2 };
};

describe("Rewards Vault", function () {
  it("Rewards end to end", async function () {
    const accounts = await hre.ethers.getSigners();
    const { deployer, user, user2 } = await setupAccounts(accounts);
    const { capl, vault, rewards, lp } = await deployContracts(deployer);

    // grant rewards the REWARDS role in the vault
    vault.grantRole(
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("REWARDS")),
      rewards.address
    );

    // check deployer account capl balance & approve rewards spending
    expect(Number(await lp.balanceOf(deployer.address))).to.equal(1_000_000);

    // deposit capl from user, this should really be a different ERC20
    // transfer capl t user
    lp.transfer(user.address, 500_000);
    expect(Number(await lp.balanceOf(user.address))).to.equal(500_000);

    // user 1 deposit = 500k LP
    lp.connect(user).approve(rewards.address, 500_000);
    await rewards.connect(user).deposit(lp.address, 500_000);

    const userPosition = await vault.getUserPosition(lp.address, user.address);
    expect(Number(userPosition.totalAmount.toString())).to.equal(500_000);
    expect(Number(userPosition.rewardDebt.toString())).to.equal(0);
    expect(userPosition.stakes.length).to.equal(1);
    expect(Number(userPosition.stakes[0].amount.toString())).to.equal(500_000);

    // transfer capl to user 2
    lp.transfer(user2.address, 250_000);
    expect(Number(await lp.balanceOf(user2.address))).to.equal(250_000);

    // user 2 deposit = 250k LP
    lp.connect(user2).approve(rewards.address, 250_000);
    await rewards.connect(user2).deposit(lp.address, 250_000);

    // check all vault variables for both users...
    const userPosition2 = await vault.getUserPosition(
      lp.address,
      user2.address
    );
    expect(Number(userPosition2.totalAmount.toString())).to.equal(250_000);
    expect(Number(userPosition2.rewardDebt.toString())).to.equal(0); // math makes sense, 3 blocks have passed @ 10 CAPL / block.
    expect(userPosition2.stakes.length).to.equal(1);
    expect(Number(userPosition2.stakes[0].amount.toString())).to.equal(250_000);

    // fast forward
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine"); // this one will have 02:00 PM as its timestamp

    // Access Control
    // set rewards as MINTER_ROLE role in capl
    await capl.grantRole(capl.MINTER_ROLE(), rewards.address.toLowerCase());

    // fast forward
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine"); // this one will have 02:00 PM as its timestamp

    let pendingRewards = await vault.getPendingRewards(
      lp.address,
      user2.address
    );
    expect(Number(pendingRewards)).to.equal(138);

    expect(await rewards.connect(user).claim(lp.address, user.address))
      .to.emit(rewards, "Claim")
      .withArgs(lp.address, user.address, 278);

    expect(await rewards.connect(user).claim(lp.address, user2.address))
      .to.emit(rewards, "Claim")
      .withArgs(lp.address, user2.address, 139);

    console.log(await capl.balanceOf(user.address))
    expect(Number(ethers.utils.formatEther(await capl.balanceOf(user.address)))).to.equal(278);
    expect(Number(ethers.utils.formatEther(await capl.balanceOf(user2.address)))).to.equal(139);

    // fast forward
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine"); // this one will have 02:00 PM as its timestamp

    pendingRewards = await vault.getPendingRewards(lp.address, user.address);
    console.log("User pending rewards: " + pendingRewards);
  });
});
