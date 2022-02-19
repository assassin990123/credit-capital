const { expect } = require("chai");
const { toUtf8Bytes } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

const TEN_TOKENS_DEFAULT = BigInt(10 * 10 ** 18);

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

const userChecks = (userPosition, expectedAmount, expectedDebt, stakeLength) => {
  expect(_formatEther(userPosition.totalAmount)).to.equal(
    expectedAmount
  );
  expect(_formatEther(userPosition.rewardDebt).toFixed(0)).to.equal(expectedDebt);
  expect(userPosition.stakes.length).to.equal(stakeLength);
  expect(_formatEther(userPosition.stakes[0].amount)).to.equal(
    expectedAmount
  );
};

const poolChecks = (pool, expectedAmount, expectedRPS, expectedCaplPerShare) => {
  expect(_formatEther(pool.totalPooled)).to.equal(expectedAmount)
  expect(_formatEther(pool.rewardsPerSecond).toFixed(2)).to.equal(expectedRPS)
  expect(_formatEther(pool.accCaplPerShare).toFixed(1)).to.equal(expectedCaplPerShare)
}

describe("Rewards Vault", function () {
  it("Rewards end to end", async function () {
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
    userChecks(userPosition, 10, '0', 1);

    let pool = await vault.getPool(lp.address);
    poolChecks(pool, 10, '0.06', '0.0')
    // fast forward
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");
    // get alices rewards after 1 hour
    let pendingRewards = await vault.getPendingRewards(lp.address, alice.address);
    // verify, should be around 208 for one user
    expect(_formatEther(pendingRewards).toFixed(0)).to.equal('208')
    // Bob deposits 10 LP tokens
    await rewards.connect(bob).deposit(lp.address, TEN_TOKENS_DEFAULT);
    // check Alice userPosition, Pool info
    userPosition = await vault.getUserPosition(lp.address, bob.address);
    userChecks(userPosition, 10, '208', 1);

    pool = await vault.getPool(lp.address);
    poolChecks(pool, 20, '0.06', '20.8')
    // check both alice & bob rewards
    pendingRewards = await vault.getPendingRewards(lp.address, bob.address);
    // immediately after bob should have zero
    expect(_formatEther(pendingRewards)).to.equal(0)
    // alice should have roughly 208 still
    pendingRewards = await vault.getPendingRewards(lp.address, alice.address);
    expect(_formatEther(pendingRewards).toFixed(0)).to.equal('208')
    // fast forward an hour, and they should both have accrued the same amount...
    // around 208 total, so 104 each.
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");

    pendingRewards = await vault.getPendingRewards(lp.address, bob.address);
    expect(_formatEther(pendingRewards).toFixed(0)).to.equal('104')

    pendingRewards = await vault.getPendingRewards(lp.address, alice.address);
    expect(_formatEther(pendingRewards).toFixed(0)).to.equal('313')
    // bob now decides to claim
    await rewards.connect(bob).claim(lp.address, bob.address)
    // bobs CAPL balance should now be 104
    let balance = await capl.balanceOf(bob.address)
    console.log(_formatEther(balance))


    /*
    // transfer capl to user 2
    lp.transfer(bob.address, 250_000);
    expect(Number(await lp.balanceOf(bob.address))).to.equal(250_000);

    // user 2 deposit = 250k LP
    lp.connect(bob).approve(rewards.address, 250_000);
    await rewards.connect(bob).deposit(lp.address, 250_000);

    // check all vault variables for both users...
    const userPosition2 = await vault.getUserPosition(lp.address, bob.address);
    expect(Number(userPosition2.totalAmount.toString())).to.equal(250_000);
    expect(Number(userPosition2.rewardDebt.toString())).to.equal(
      86805555555555550
    ); // math makes sense, 3 blocks have passed @ 10 CAPL / block.
    expect(userPosition2.stakes.length).to.equal(1);
    expect(Number(userPosition2.stakes[0].amount.toString())).to.equal(250_000);

    // fast forward
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine"); // this one will have 02:00 PM as its timestamp

    // fast forward
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine"); // this one will have 02:00 PM as its timestamp

    let pendingRewards = await vault.getPendingRewards(lp.address, bob.address);
    expect(
      Number(ethers.utils.formatEther(pendingRewards)).toFixed(0)
    ).to.equal("139");

    await rewards.connect(alice).claim(lp.address, alice.address);

    pendingRewards = await vault.getPendingRewards(lp.address, alice.address);
    console.log("User pending rewards: " + pendingRewards);
    */
  });

  it("Rewards simple test", async () => {
    const accounts = await hre.ethers.getSigners();
    const { deployer, alice } = await setupAccounts(accounts);
    const { capl, vault, rewards, lp } = await deployContracts(deployer);

    // grant rewards the REWARDS role in the vault
    await vault.grantRole(
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("REWARDS")),
      rewards.address
    );

    // set rewards as MINTER_ROLE role in capl
    await capl.grantRole(capl.MINTER_ROLE(), rewards.address.toLowerCase());
    expect(
      Number(ethers.utils.formatEther(await lp.balanceOf(deployer.address)))
    ).to.equal(1_000_000);

    // deposit capl from user, this should really be a different ERC20
    // transfer capl to user
    lp.transfer(alice.address, BigInt(10 * 10 ** 18));
    console.log(
      "user balance before first deposit: ",
      await lp.balanceOf(alice.address)
    );

    // user 1 deposit = 1 LP
    lp.connect(alice).approve(rewards.address, BigInt(10 * 10 ** 18));
    await rewards.connect(alice).deposit(lp.address, BigInt(10 * 10 ** 18));
    let userPosition = await vault.getUserPosition(lp.address, alice.address);
    let pool = await vault.getPool(lp.address);

    //console.log('user balance after first deposit: ', await lp.balanceOf(user.address));
    //console.log('userposition after first deposit: ', userPosition.totalAmount);
    //console.log('rewardDebt after first deposit: ', userPosition.rewardDebt);

    // fast forward 1 min
    await network.provider.send("evm_increaseTime", [60]);
    await network.provider.send("evm_mine");

    let pendingRewards = await vault.getPendingRewards(
      lp.address,
      alice.address
    );
    console.log(
      "pendingRewards 60 seconds after the first deposit: ",
      ethers.utils.formatEther(pendingRewards)
    );
    console.log("");

    //userPosition = await vault.getUserPosition(lp.address, user.address);
    //pool = await vault.getPool(lp.address);

    // fast forward 1 min
    await network.provider.send("evm_increaseTime", [60]);
    await network.provider.send("evm_mine");

    pendingRewards = await vault.getPendingRewards(lp.address, alice.address);
    console.log(
      "pendingRewards 120 seconds after the first deposit: ",
      ethers.utils.formatEther(pendingRewards)
    );

    await network.provider.send("evm_increaseTime", [60]);
    await network.provider.send("evm_mine");

    pendingRewards = await vault.getPendingRewards(lp.address, alice.address);
    console.log(
      "pendingRewards 180 seconds after the first deposit: ",
      ethers.utils.formatEther(pendingRewards)
    );

    await network.provider.send("evm_increaseTime", [60]);
    await network.provider.send("evm_mine");

    pendingRewards = await vault.getPendingRewards(lp.address, alice.address);
    console.log(
      "pendingRewards 240 seconds after the first deposit: ",
      ethers.utils.formatEther(pendingRewards)
    );

    await network.provider.send("evm_increaseTime", [120]);
    await network.provider.send("evm_mine");

    pendingRewards = await vault.getPendingRewards(lp.address, alice.address);
    console.log(
      "pendingRewards 360 seconds after the first deposit: ",
      ethers.utils.formatEther(pendingRewards)
    );

    await network.provider.send("evm_increaseTime", [240]);
    await network.provider.send("evm_mine");

    pendingRewards = await vault.getPendingRewards(lp.address, alice.address);
    console.log(
      "pendingRewards 600 seconds after the first deposit: ",
      ethers.utils.formatEther(pendingRewards)
    );

    await network.provider.send("evm_increaseTime", [300]);
    await network.provider.send("evm_mine");

    pendingRewards = await vault.getPendingRewards(lp.address, alice.address);
    console.log(
      "pendingRewards 900 seconds after the first deposit: ",
      ethers.utils.formatEther(pendingRewards)
    );

    await network.provider.send("evm_increaseTime", [300]);
    await network.provider.send("evm_mine");

    pendingRewards = await vault.getPendingRewards(lp.address, alice.address);
    console.log(
      "pendingRewards 1200 seconds after the first deposit: ",
      ethers.utils.formatEther(pendingRewards)
    );

    await network.provider.send("evm_increaseTime", [600]);
    await network.provider.send("evm_mine");

    pendingRewards = await vault.getPendingRewards(lp.address, alice.address);
    console.log(
      "pendingRewards 1800 seconds after the first deposit: ",
      ethers.utils.formatEther(pendingRewards)
    );

    await network.provider.send("evm_increaseTime", [2400]);
    await network.provider.send("evm_mine");

    pendingRewards = await vault.getPendingRewards(lp.address, alice.address);
    console.log(
      "pendingRewards 3600 seconds after the first deposit: ",
      ethers.utils.formatEther(pendingRewards)
    );

    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");

    pendingRewards = await vault.getPendingRewards(lp.address, alice.address);
    console.log(
      "pendingRewards 7200 seconds after the first deposit: ",
      ethers.utils.formatEther(pendingRewards)
    );

    await network.provider.send("evm_increaseTime", [7200]);
    await network.provider.send("evm_mine");

    pendingRewards = await vault.getPendingRewards(lp.address, alice.address);
    console.log(
      "pendingRewards 43200 seconds after the first deposit: ",
      ethers.utils.formatEther(pendingRewards)
    );

    await network.provider.send("evm_increaseTime", [28800]);
    await network.provider.send("evm_mine");

    pendingRewards = await vault.getPendingRewards(lp.address, alice.address);
    console.log(
      "pendingRewards 43200 seconds after the first deposit: ",
      ethers.utils.formatEther(pendingRewards)
    );

    await network.provider.send("evm_increaseTime", [43200]);
    await network.provider.send("evm_mine");

    pendingRewards = await vault.getPendingRewards(lp.address, alice.address);
    console.log(
      "pendingRewards 86400 seconds after the first deposit: ",
      ethers.utils.formatEther(pendingRewards)
    );

    //console.log('user balance after first claim: ', ethers.utils.formatEther(await capl.balanceOf(user.address)));
    //console.log('rewardDebt after first claim: ', ethers.utils.formatEther(userPosition.rewardDebt));
    //console.log('accCaplPerShare after first claim', ethers.utils.formatEther(pool.accCaplPerShare));

    /*
    // fast forward 10 mins
    await network.provider.send("evm_increaseTime", [600]);
    await network.provider.send("evm_mine");

    pendingRewards = await vault.getPendingRewards(lp.address, user.address);
    console.log('pendingRewards 600 seconds after the first claim: ', pendingRewards);

    await rewards.connect(user).claim(lp.address, user.address);
    userPosition = await vault.getUserPosition(lp.address, user.address);
    pool = await vault.getPool(lp.address);

    console.log('user balance after second claim: ', await lp.balanceOf(deployer.address));
    console.log('rewardDebt after second claim: ', userPosition.rewardDebt);
    console.log('accCaplPerShare after second claim', pool.accCaplPerShare);

    // fast forward an hour
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");
    
    pendingRewards = await vault.getPendingRewards(lp.address, user.address);
    console.log('pendingRewards 3600 seconds after the second claim: ', pendingRewards);

    await rewards.connect(user).claim(lp.address, user.address);
    userPosition = await vault.getUserPosition(lp.address, user.address);
    pool = await vault.getPool(lp.address);

    console.log('user balance after third claim: ', await lp.balanceOf(deployer.address));
    console.log('rewardDebt after third claim: ', userPosition.rewardDebt);
    console.log('accCaplPerShare after third claim', pool.accCaplPerShare);
    */
  });
});
