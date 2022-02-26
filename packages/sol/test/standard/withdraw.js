const { expect } = require("chai");
const { toUtf8Bytes } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

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
  const vault = await deployContract("VaultMock", [
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
  // vault.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MINTER')), rewards.address)
  return { capl, lp, vault, rewards };
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
  // expect(_formatEther(userPosition.stakes[stakeLength - 1].amount)).to.equal(expectedAmount);
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
  it("Deposit and withdraw a new position", async function () {
    const accounts = await hre.ethers.getSigners();
    const { deployer, alice } = await setupAccounts(accounts);
    const { capl, lp, vault, rewards } = await deployContracts(deployer);

    // role setup
    await setupRoles(vault, capl, rewards);
    // check deployer account capl balance & approve rewards spending
    expect(Number(_formatEther(await lp.balanceOf(deployer.address)))).to.equal(1_000_000);

    // test setup
    // alice gets 10 LP
    lp.transfer(alice.address, TEN_TOKENS_DEFAULT);
    // verify transfers
    expect(_formatEther(await lp.balanceOf(alice.address))).to.equal(10);
    // approvals
    lp.connect(alice).approve(rewards.address, TEN_TOKENS_DEFAULT);

    await rewards.connect(alice).deposit(lp.address, TEN_TOKENS_DEFAULT);
    // check all vault variables to be correct
    let userPosition = await vault.getUserPosition(lp.address, alice.address);
    // should be one user position, one pool, and one stake
    userChecks(userPosition, 10, "0", 1);

    // check pool instance for correct values
    let pool = await vault.getPool(lp.address);
    poolChecks(pool, 10, "0.06", "0.0");

    // fast forward 1h
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");

    // with mock, in 60 seconds the funds are unlocked for withdrawals
    // simulate call
    let unlockedAmount = await vault.callStatic.getUnlockedAmount(lp.address, alice.address);
    expect(Number(_formatEther(unlockedAmount.toString()))).to.equal(10);

    // TODO: withdraw test
    await rewards.connect(alice).withdraw(lp.address, alice.address);

    // verify pool states
    pool = await vault.getPool(lp.address);
    poolChecks(pool, 0, "0.06", "20.8");

    // check userposition states
    userPosition = await vault.getUserPosition(lp.address, alice.address);
    userChecks(userPosition, 0, "208", 1);

    // simulate call
    unlockedAmount = await vault.callStatic.getUnlockedAmount(lp.address, alice.address);
    expect(Number(_formatEther(unlockedAmount.toString()))).to.equal(0);
    
    // check Alice's balance
    expect(
      _formatEther(await lp.balanceOf(alice.address)).toFixed(0)
    ).to.equal("10");
  });
  it("Alice and Bob both deposit, Alice withdraw and Bob claim, Alice and Bob deposit both again, and both withdraw", async () => {
    const accounts = await hre.ethers.getSigners();
    const { deployer, alice, bob } = await setupAccounts(accounts);
    const { capl, lp, vault, rewards } = await deployContracts(deployer);
    // role setup
    await setupRoles(vault, capl, rewards);
    // check deployer account capl balance & approve rewards spending
    expect(
      Number(_formatEther(await lp.balanceOf(deployer.address)))
    ).to.equal(1_000_000);
    // test setup
    // alice gets 10 LP
    // bob gets 10 LP
    // both deposit
    lp.transfer(alice.address, TEN_TOKENS_DEFAULT);
    lp.transfer(bob.address, TWENTY_TOKENS_DEFAULT);
    // verify transfers
    expect(_formatEther(await lp.balanceOf(alice.address))).to.equal(10);
    expect(_formatEther(await lp.balanceOf(bob.address))).to.equal(20);
    // approvals
    lp.connect(alice).approve(rewards.address, TWENTY_TOKENS_DEFAULT);
    lp.connect(bob).approve(rewards.address, TWENTY_TOKENS_DEFAULT);

    // Alice and Bob bot deposit
    await rewards.connect(alice).deposit(lp.address, TEN_TOKENS_DEFAULT);
    // check all vault variables to be correct
    let userPosition = await vault.getUserPosition(lp.address, alice.address);
    // should be one user position, one pool, and one stake
    userChecks(userPosition, 10, "0", 1);

    // check pool instance for correct values
    pool = await vault.getPool(lp.address);
    poolChecks(pool, 10, "0.06", "0.0");

    // fast forward 1h
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");

    await rewards.connect(bob).deposit(lp.address, TEN_TOKENS_DEFAULT);
    // check all vault variables to be correct
    userPosition = await vault.getUserPosition(lp.address, bob.address);
    // should be one user position, one pool, and one stake
    userChecks(userPosition, 10, "208", 1);

    // check pool instance for correct values
    pool = await vault.getPool(lp.address);
    poolChecks(pool, 20, "0.06", "20.8");

    // fast forward 1h
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");

    // Alice withdraw
    // with mock, in 60 seconds the funds are unlocked for withdrawals
    // simulate call
    let unlockedAmount = await vault.callStatic.getUnlockedAmount(lp.address, alice.address);
    expect(Number(_formatEther(unlockedAmount.toString()))).to.equal(10);

    // TODO: withdraw test
    await rewards.connect(alice).withdraw(lp.address, alice.address);
    // check Alice's balance
    expect(
      _formatEther(await lp.balanceOf(alice.address)).toFixed(0)
    ).to.equal("10");

    // verify pool states
    pool = await vault.getPool(lp.address);
    poolChecks(pool, 10, "0.06", "31.3");

    // check userposition states
    userPosition = await vault.getUserPosition(lp.address, alice.address);
    userChecks(userPosition, 0, "313", 1);

    // simulate call
    unlockedAmount = await vault.callStatic.getUnlockedAmount(lp.address, alice.address);
    expect(Number(_formatEther(unlockedAmount.toString()))).to.equal(0);

    // fast forward 1h
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");

    // Bob's rewardsDebt should still be 208
    userPosition = await vault.getUserPosition(lp.address, bob.address);
    // should be one user position, one pool, and one stake
    userChecks(userPosition, 10, "208", 1);

    // Bob's pendingrewards
    let pendingRewards = await vault.getPendingRewards(
      lp.address,
      bob.address
    );
    // verify, should be around 104 for Bob
    expect(_formatEther(pendingRewards).toFixed(0)).to.equal("313");

    await rewards.connect(bob).claim(lp.address, bob.address);
    expect(_formatEther(await capl.balanceOf(bob.address)).toFixed(0)).to.equal(
      "313"
    );
    // Bob's rewardsDebt
    userPosition = await vault.getUserPosition(lp.address, bob.address);
    // should be one user position, one pool, and one stake
    userChecks(userPosition, 10, "521", 1);

    // Alice's rewardsDebt
    userPosition = await vault.getUserPosition(lp.address, alice.address);
    // should be one user position, one pool, and one stake
    userChecks(userPosition, 0, "313", 1);
  
    // verify pool states
    pool = await vault.getPool(lp.address);
    poolChecks(pool, 10, "0.06", "52.1");

    // fast forward 1h
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");

    // Alice and Bob deposit both again
    await rewards.connect(alice).deposit(lp.address, TEN_TOKENS_DEFAULT);
    // check all vault variables to be correct
    userPosition = await vault.getUserPosition(lp.address, alice.address);
    // should be one user position, one pool, and one stake
    userChecks(userPosition, 10, "729", 2);

    // check pool instance for correct values
    pool = await vault.getPool(lp.address);
    poolChecks(pool, 20, "0.06", "72.9");

    // fast forward 1h
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");

    // bob deposit 10 more LP, not bob's position is 20
    await rewards.connect(bob).deposit(lp.address, TEN_TOKENS_DEFAULT);
    // check all vault variables to be correct
    // check pool instance for correct values
    pool = await vault.getPool(lp.address);
    poolChecks(pool, 30, "0.06", "83.4");

    userPosition = await vault.getUserPosition(lp.address, bob.address);
    userChecks(userPosition, 20, "834", 1);

    // fast forward 1h
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");

    // Alice and Bob both withdraw
    unlockedAmount = await vault.callStatic.getUnlockedAmount(lp.address, alice.address);
    expect(Number(_formatEther(unlockedAmount.toString()))).to.equal(10);
    // Alice withdraw
    await rewards.connect(alice).withdraw(lp.address, alice.address);
    // check Alice's balance
    expect(
      _formatEther(await lp.balanceOf(alice.address)).toFixed(0)
    ).to.equal("10");

    // verify pool states
    pool = await vault.getPool(lp.address);
    poolChecks(pool, 20, "0.06", "90.3");
    // check userposition states
    userPosition = await vault.getUserPosition(lp.address, alice.address);
    userChecks(userPosition, 0, "903", 2);

    // fast forward 1h
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");

    unlockedAmount = await vault.callStatic.getUnlockedAmount(lp.address, bob.address);
    expect(Number(_formatEther(unlockedAmount.toString()))).to.equal(20);
    // Bob withdraw
    await rewards.connect(bob).withdraw(lp.address, bob.address);
    // check Bob's balance
    expect(
      _formatEther(await lp.balanceOf(bob.address)).toFixed(0)
    ).to.equal("20");

    // verify pool states
    pool = await vault.getPool(lp.address);
    poolChecks(pool, 0, "0.06", "100.7");
    // // check userposition, rewardDebt is around 2015
    // userPosition = await vault.getUserPosition(lp.address, bob.address);
    // userChecks(userPosition, 0, "2015", 1);
  });
  it("Alice and Bob both deposit, Alice withdraw and Bob claim, Alice and Bob both deposit again, both claim and both withdraw", async () => {
    const accounts = await hre.ethers.getSigners();
    const { deployer, alice, bob } = await setupAccounts(accounts);
    const { capl, lp, vault, rewards } = await deployContracts(deployer);
    // role setup
    await setupRoles(vault, capl, rewards);
    // check deployer account capl balance & approve rewards spending
    expect(
      Number(_formatEther(await lp.balanceOf(deployer.address)))
    ).to.equal(1_000_000);
    // test setup
    // alice gets 10 LP
    // bob gets 10 LP
    // both deposit
    lp.transfer(alice.address, TEN_TOKENS_DEFAULT);
    lp.transfer(bob.address, TWENTY_TOKENS_DEFAULT);
    // verify transfers
    expect(_formatEther(await lp.balanceOf(alice.address))).to.equal(10);
    expect(_formatEther(await lp.balanceOf(bob.address))).to.equal(20);
    // approvals
    lp.connect(alice).approve(rewards.address, TWENTY_TOKENS_DEFAULT);
    lp.connect(bob).approve(rewards.address, TWENTY_TOKENS_DEFAULT);

    // Alice and Bob bot deposit
    await rewards.connect(alice).deposit(lp.address, TEN_TOKENS_DEFAULT);
    // check all vault variables to be correct
    let userPosition = await vault.getUserPosition(lp.address, alice.address);
    // should be one user position, one pool, and one stake
    userChecks(userPosition, 10, "0", 1);

    // check pool instance for correct values
    pool = await vault.getPool(lp.address);
    poolChecks(pool, 10, "0.06", "0.0");

    // fast forward 5 minutes
    await network.provider.send("evm_increaseTime", [300]);
    await network.provider.send("evm_mine");

    // Alice try to withdraw but impossible as her position is still locked(10 mins)
    unlockedAmount = await vault.callStatic.getUnlockedAmount(lp.address, alice.address);
    expect(Number(_formatEther(unlockedAmount.toString()))).to.equal(0);

    // Bob diposit
    await rewards.connect(bob).deposit(lp.address, TEN_TOKENS_DEFAULT);
    // check all vault variables to be correct
    userPosition = await vault.getUserPosition(lp.address, bob.address);
    // should be one user position, one pool, and one stake
    userChecks(userPosition, 10, "17", 1);

    // check pool instance for correct values
    pool = await vault.getPool(lp.address);
    poolChecks(pool, 20, "0.06", "1.7");

    // fast forward 5 minutes
    await network.provider.send("evm_increaseTime", [300]);
    await network.provider.send("evm_mine");

    /**
     * Alice deposits once, 10 minutes go by, and then deposits again
     * Alice should not be able to withdraw anything after 5minutes
     * Alice should only be able to withdraw the first stake after 10 minutes have passed
     * After 20 minutes, she should be able to withdraw her entire position
     */
    
    // Alice withdraw the first stake after 10 minutes have passed
    unlockedAmount = await vault.callStatic.getUnlockedAmount(lp.address, alice.address);
    expect(Number(_formatEther(unlockedAmount.toString()))).to.equal(10);

    // Alice will only able to withdraw first stake
    await rewards.connect(alice).withdraw(lp.address, alice.address);
    // check Alice's balance
    expect(
      _formatEther(await lp.balanceOf(alice.address)).toFixed(0)
    ).to.equal("10");

    // verify pool states
    pool = await vault.getPool(lp.address);
    poolChecks(pool, 10, "0.06", "2.6");

    // check userposition states
    userPosition = await vault.getUserPosition(lp.address, alice.address);
    userChecks(userPosition, 0, "26", 1);

    // fast forward 5 minutes
    await network.provider.send("evm_increaseTime", [300]);
    await network.provider.send("evm_mine");

    // Bob claim
    pendingRewards = await vault.getPendingRewards(lp.address, bob.address);
    expect(_formatEther(pendingRewards).toFixed(0)).to.equal("26");

    await rewards.connect(bob).claim(lp.address, bob.address);
    expect(_formatEther(await capl.balanceOf(bob.address)).toFixed(0)).to.equal(
      "26"
    );

    // check bob's userposition
    userPosition = await vault.getUserPosition(lp.address, bob.address);
    userChecks(userPosition, 10, "44", 1);
    // updated pool state
    pool = await vault.getPool(lp.address);
    poolChecks(pool, 10, "0.06", "4.4");

    // fast forward 5 minutes
    await network.provider.send("evm_increaseTime", [300]);
    await network.provider.send("evm_mine");

    // Alice and Bob deposit both again
    // Alice deposit again
    await rewards.connect(alice).deposit(lp.address, TEN_TOKENS_DEFAULT);
    // check all vault variables to be correct
    userPosition = await vault.getUserPosition(lp.address, alice.address);
    // should be two stake as she should has another position
    userChecks(userPosition, 10, "61", 2);

    // check pool instance for correct values
    pool = await vault.getPool(lp.address);
    poolChecks(pool, 20, "0.06", "6.1");
    
    // fast forward 5 minutes
    await network.provider.send("evm_increaseTime", [300]);
    await network.provider.send("evm_mine");

    // Alice's unlocked amount should be 0 as 5 minutes have passed after the second stake.
    unlockedAmount = await vault.callStatic.getUnlockedAmount(lp.address, alice.address);
    expect(Number(_formatEther(unlockedAmount.toString()))).to.equal(0);

    // Bob deposit again
    await rewards.connect(bob).deposit(lp.address, TEN_TOKENS_DEFAULT);
    // check Alice userPosition, Pool info
    userPosition = await vault.getUserPosition(lp.address, bob.address);
    // Bob should have one stake under the timelocktThreshold (1 week)
    userChecks(userPosition, 20, "70", 1);

    pool = await vault.getPool(lp.address);
    poolChecks(pool, 30, "0.06", "7.0");

    // fast forward 5 minutes
    await network.provider.send("evm_increaseTime", [300]);
    await network.provider.send("evm_mine");
    
    // Alice's pending reward
    // balance : 10
    // accCaplPerShare : (7 + (0.057 * 300) / 30) = 7.57
    // RPS : 0.057
    // passedTime : 300
    // tokenSupply : 30
    // rewardDebt : 61
    // Calcualtion : ~(10 * 7.57 - 61) = ~14
    pendingRewards = await vault.getPendingRewards(lp.address, alice.address);
    expect(_formatEther(pendingRewards).toFixed(0)).to.equal("14");

    // Alice and Bob both claim
    await rewards.connect(alice).claim(lp.address, alice.address);
    expect(_formatEther(await capl.balanceOf(alice.address)).toFixed(0)).to.equal(
      "15"
    );

    // check alice's userposition
    userPosition = await vault.getUserPosition(lp.address, alice.address);
    userChecks(userPosition, 10, "75", 2);
    // updated pool state
    pool = await vault.getPool(lp.address);
    poolChecks(pool, 30, "0.06", "7.5");
    
    // fast forward 5 minutes
    await network.provider.send("evm_increaseTime", [300]);
    await network.provider.send("evm_mine");

    pendingRewards = await vault.getPendingRewards(lp.address, bob.address);
    expect(_formatEther(pendingRewards).toFixed(0)).to.equal("93");

    await rewards.connect(bob).claim(lp.address, bob.address);
    // current capl balance 26
    // claimed amount 93
    // so Bob's total capl balance : 119
    expect(
      _formatEther(await capl.balanceOf(bob.address)).toFixed(0)
    ).to.equal("119");

    // check bob's userposition
    userPosition = await vault.getUserPosition(lp.address, bob.address);
    userChecks(userPosition, 20, "163", 1);
    // updated pool state
    pool = await vault.getPool(lp.address);
    poolChecks(pool, 30, "0.06", "8.1");

    // fast forward 5 minutes
    await network.provider.send("evm_increaseTime", [300]);
    await network.provider.send("evm_mine");
    
    // Alice and Bob both withdraw
    unlockedAmount = await vault.callStatic.getUnlockedAmount(lp.address, alice.address);
    expect(Number(_formatEther(unlockedAmount.toString()))).to.equal(10);
    // Alice withdraw
    await rewards.connect(alice).withdraw(lp.address, alice.address);
    // check Alice's balance
    expect(
      _formatEther(await lp.balanceOf(alice.address)).toFixed(0)
    ).to.equal("10");

    // verify pool states
    pool = await vault.getPool(lp.address);
    poolChecks(pool, 20, "0.06", "8.7");
    // check userposition states
    userPosition = await vault.getUserPosition(lp.address, alice.address);
    userChecks(userPosition, 0, "87", 2);

    // fast forward 5 minutes
    await network.provider.send("evm_increaseTime", [300]);
    await network.provider.send("evm_mine");

    unlockedAmount = await vault.callStatic.getUnlockedAmount(lp.address, bob.address);
    expect(Number(_formatEther(unlockedAmount.toString()))).to.equal(20);
    // Bob withdraw
    await rewards.connect(bob).withdraw(lp.address, bob.address);
    // check Bob's balance
    expect(
      _formatEther(await lp.balanceOf(bob.address)).toFixed(0)
    ).to.equal("20");

    // verify pool states
    pool = await vault.getPool(lp.address);
    poolChecks(pool, 0, "0.06", "9.6");
    // check userposition, rewardDebt is around 2015
    userPosition = await vault.getUserPosition(lp.address, bob.address);
    userChecks(userPosition, 0, "192", 1);
  });
});
