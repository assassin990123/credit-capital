const { expect } = require("chai");
const { toUtf8Bytes } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

const ONE_TOKEN_DEFAULT = BigInt(1 * 10 ** 18)
const TEN_TOKENS_DEFAULT = BigInt(10 * 10 ** 18);
const TWENTY_TOKENS_DEFAULT = BigInt(20 * 10 ** 18);


const deployContract = async (contract, params) => {
  let c = await ethers.getContractFactory(contract);
  if (params) c = await c.deploy(...params);
  else c = await c.deploy();
  return await c.deployed();
};

const deployContracts = async (deployer) => {
  const capl = await deployContract("CreditCapitalPlatformToken", [
    BigInt(100_000_000 * 10 ** 18),
  ]);
  const lp = await deployContract("ERC20Mock", [
    "LP",
    "LP",
    deployer.address,
    BigInt(1_000_000 * 10 ** 18),
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
  const alice = accounts[1];
  const bob = accounts[2];
  return { deployer, alice, bob };
};

const setupRoles = async (vault, capl, rewards) => {
  // vault grants rewards contract REWARDS role
  await vault.grantRole(
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("REWARDS")),
    rewards.address
  );
  // Access Control
  // set rewards as MINTER_ROLE role in capl
  await capl.grantRole(capl.MINTER_ROLE(), rewards.address.toLowerCase());
};

const _formatEther = (amount) => {
  return Number(ethers.utils.formatEther(amount));
};

const userChecks = (
  userPosition,
  expectedAmount,
  expectedDebt,
  stakeLength
) => {
  expect(_formatEther(userPosition.totalAmount)).to.equal(expectedAmount);
  expect(_formatEther(userPosition.rewardDebt).toFixed(0)).to.equal(
    expectedDebt
  );
  expect(userPosition.stakes.length).to.equal(stakeLength);
  expect(_formatEther(userPosition.stakes[0].amount)).to.equal(expectedAmount);
};

const poolChecks = (
  pool,
  expectedAmount,
  expectedRPS,
  expectedCaplPerShare
) => {
  expect(_formatEther(pool.totalPooled)).to.equal(expectedAmount);
  expect(_formatEther(pool.rewardsPerSecond).toFixed(2)).to.equal(expectedRPS);
  expect(_formatEther(pool.accCaplPerShare).toFixed(1)).to.equal(
    expectedCaplPerShare
  );
};

describe("Rewards Vault", function () {
  it("Rewards: Alice & Bob Deposit the same amount", async function () {
    const accounts = await hre.ethers.getSigners();
    const { deployer, alice, bob } = await setupAccounts(accounts);
    const { capl, vault, rewards, lp } = await deployContracts(deployer);
    // role setup
    await setupRoles(vault, capl, rewards);
    // check deployer account capl balance & approve rewards spending
    expect(
      Number(ethers.utils.formatEther(await lp.balanceOf(deployer.address)))
    ).to.equal(1_000_000);
    // test setup
    // alice gets 10 LP
    // bob gets 10 LP
    // both deposit
    lp.transfer(alice.address, TEN_TOKENS_DEFAULT);
    lp.transfer(bob.address, TEN_TOKENS_DEFAULT);
    // verify transfers
    expect(_formatEther(await lp.balanceOf(alice.address))).to.equal(10);
    expect(_formatEther(await lp.balanceOf(bob.address))).to.equal(10);
    // approvals
    lp.connect(alice).approve(rewards.address, TEN_TOKENS_DEFAULT);
    lp.connect(bob).approve(rewards.address, TEN_TOKENS_DEFAULT);
    // Alice deposits 10 LP tokens
    await rewards.connect(alice).deposit(lp.address, TEN_TOKENS_DEFAULT);
    // check Alice userPosition, Pool info
    let userPosition = await vault.getUserPosition(lp.address, alice.address);
    userChecks(userPosition, 10, "0", 1);

    let pool = await vault.getPool(lp.address);
    poolChecks(pool, 10, "0.06", "0.0");
    // fast forward
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");
    // get alices rewards after 1 hour
    let pendingRewards = await vault.getPendingRewards(
      lp.address,
      alice.address
    );
    // verify, should be around 208 for one user
    expect(_formatEther(pendingRewards).toFixed(0)).to.equal("208");
    // Bob deposits 10 LP tokens
    await rewards.connect(bob).deposit(lp.address, TEN_TOKENS_DEFAULT);
    // check Alice userPosition, Pool info
    userPosition = await vault.getUserPosition(lp.address, bob.address);
    userChecks(userPosition, 10, "208", 1);

    pool = await vault.getPool(lp.address);
    poolChecks(pool, 20, "0.06", "20.8");
    // check both alice & bob rewards
    pendingRewards = await vault.getPendingRewards(lp.address, bob.address);
    // immediately after bob should have zero
    expect(_formatEther(pendingRewards)).to.equal(0);
    // alice should have roughly 208 still
    pendingRewards = await vault.getPendingRewards(lp.address, alice.address);
    expect(_formatEther(pendingRewards).toFixed(0)).to.equal("208");

    // fast forward an hour, and they should both have accrued the same amount...
    // around 208 total, so 104 each.
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");

    // both parties now claim their rewards
    pendingRewards = await vault.getPendingRewards(lp.address, bob.address);
    expect(_formatEther(pendingRewards).toFixed(0)).to.equal("104");

    await rewards.connect(bob).claim(lp.address, bob.address);
    expect(_formatEther(await capl.balanceOf(bob.address)).toFixed(0)).to.equal(
      "104"
    );

    pendingRewards = await vault.getPendingRewards(lp.address, alice.address);
    expect(_formatEther(pendingRewards).toFixed(0)).to.equal("313");

    await rewards.connect(alice).claim(lp.address, alice.address);
    expect(
      _formatEther(await capl.balanceOf(alice.address)).toFixed(0)
    ).to.equal("313");
  });
  it("Rewards: Alice deposits twice", async function () {
    const accounts = await hre.ethers.getSigners();
    const { deployer, alice } = await setupAccounts(accounts);
    const { capl, vault, rewards, lp } = await deployContracts(deployer);
    // role setup
    await setupRoles(vault, capl, rewards);
    // test setup
    // alice gets 10 LP
    lp.transfer(alice.address, TWENTY_TOKENS_DEFAULT);
    // verify transfers
    expect(_formatEther(await lp.balanceOf(alice.address))).to.equal(20);
    // approvals
    lp.connect(alice).approve(rewards.address, TWENTY_TOKENS_DEFAULT);

    // Alice deposits 10 LP tokens
    await rewards.connect(alice).deposit(lp.address, TEN_TOKENS_DEFAULT);
    // check Alice userPosition, Pool info
    let userPosition = await vault.getUserPosition(lp.address, alice.address);
    userChecks(userPosition, 10, "0", 1);

    // fast forward
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");
    // get alices rewards after 1 hour
    let pendingRewards = await vault.getPendingRewards(
      lp.address,
      alice.address
    );
    // verify, should be around 208 for one user
    expect(_formatEther(pendingRewards).toFixed(0)).to.equal("208");

    await rewards.connect(alice).deposit(lp.address, ONE_TOKEN_DEFAULT);

    pendingRewards = await vault.getPendingRewards(
      lp.address,
      alice.address
    );

    console.log(pendingRewards) // this is zero, should still be 208

  })
  it("Rewards: Alice & Bob deposit different amounts", async function () {
    // TODO
  });
  it("Rewards: Alice & Bob deposit different amounts, Alice deposits twice", async function () {
    // TODO
  });
  it("Rewards: Alice & Bob deposit different amounts and claim at different times", async function () {
    // TODO
  });
});
