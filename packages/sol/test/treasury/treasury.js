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
  const lp = await deployContract("ERC20Mock", [
    "LP",
    "LP",
    deployer.address,
    1_000_000,
  ]);
  const storage = await deployContract("TreasuryStorage");
  const controller = await deployContract("RevenueController", [
    storage.address,
  ]);
  return { lp, controller, storage };
};

describe("Treasury", async () => {
  let deployer;
  let user;
  let user2;
  let lp;
  let storage;
  let controller;

  beforeEach(async () => {
    // get accounts
    [deployer, user, user2] = await ethers.getSigners();

    // deploy token contract
    ({ lp, storage, controller } = await deployContracts(deployer));

    // grant controller the REVENUE_CONTROLLER role of storage contract
    await storage.grantRole(
      await storage.REVENUE_CONTROLLER(),
      controller.address
    );
  });

  describe("Deposit", () => {
    it("Should add userposition", async () => {
      // add pool
      await controller.addPool(lp.address);

      // approve lp token allowance
      await lp.approve(storage.address, 250_000);

      // deposit new userposition
      await controller.connect(deployer).deposit(lp.address, 250_000);

      const user = await storage.getLoanPosition(lp.address, deployer.address);
      const pool = await storage.getPool(lp.address);
      const userbalance = await lp.balanceOf(deployer.address);

      expect(user.loanAmount).to.equal(0);
      expect(pool.totalPooled).to.equal(250_000);
      expect(userbalance).to.equal(750_000);
    });
  });

  describe("Withdraw", () => {
    it("Should update pool", async () => {
      // add pool for the capl
      await controller.addPool(lp.address);

      // approve lp token allowance
      await lp.approve(storage.address, 250_000);

      // deposit new pool
      await controller.deposit(lp.address, 250_000);

      // check the storage states
      expect((await storage.getPool(lp.address)).totalPooled).to.equal(250_000);
      expect(await lp.balanceOf(deployer.address)).to.equal(750_000);
      expect(await lp.balanceOf(storage.address)).to.equal(250_000);

      // withdraw token
      await controller.withdraw(lp.address);

      // check the storage states
      expect((await storage.getPool(lp.address)).totalPooled).to.equal(0);
      expect(await lp.balanceOf(deployer.address)).to.equal(1_000_000);
      expect(await lp.balanceOf(storage.address)).to.equal(0);
    });
  });

  describe("Loaning", () => {
    it("Should update corresponsonding storage states", async () => {
      // add pool for the capl
      await controller.addPool(lp.address); // 10 CAPL per block

      // approve lp token allowance
      await lp.approve(storage.address, 250_000);

      // deposit new userposition
      await controller.deposit(lp.address, 250_000);

      // check the storage states
      expect(
        (await storage.getLoanPosition(lp.address, deployer.address))
          .loanAmount
      ).to.equal(0);
      expect((await storage.getPool(lp.address)).totalPooled).to.equal(250_000);

      // loan token
      await controller.loan(lp.address, 50_000);

      // check the storage states
      expect(
        (await storage.getLoanPosition(lp.address, deployer.address))
          .loanAmount
      ).to.equal(50_000);
      expect((await storage.getPool(lp.address)).totalPooled).to.equal(250_000);
      expect((await storage.getPool(lp.address)).loanedAmount).to.equal(50_000);
    });

    it("Can't loan over unlockedAmount", async () => {
      // add pool for the capl
      await controller.addPool(lp.address);

      // approve lp token allowance
      await lp.approve(storage.address, 250_000);

      // deposit new userposition
      await controller.deposit(lp.address, 250_000);

      // check the storage states
      expect(
        (await storage.getLoanPosition(lp.address, deployer.address))
          .loanAmount
      ).to.equal(0);
      expect((await storage.getPool(lp.address)).totalPooled).to.equal(250_000);

      // get user's unlocked amount
      const unlocked = await storage.getUnlockedAmount(
        lp.address
      );

      // loaning will be reverted token
      try {
        await controller.loan(lp.address, unlocked + 50_000);
      } catch (error) {
        expect(error.message).match(/Can not loan over unlocked amount/);
      }
      expect(
        (await storage.getLoanPosition(lp.address, deployer.address))
          .loanAmount
      ).to.equal(0);
      expect((await storage.getPool(lp.address)).totalPooled).to.equal(250_000);
      expect((await storage.getPool(lp.address)).loanedAmount).to.equal(0);
    });
  });

  describe("Treasury Income, Profit", () => {
    it("Deposit, loan, return principal and split the profits", async () => {
      // add pool for the capl
      await controller.addPool(lp.address);

      // approve lp token allowance
      await lp.approve(storage.address, 250_000);

      // deposit new userposition
      await controller.deposit(lp.address, 250_000);

      // check the storage states
      expect(
        (await storage.getLoanPosition(lp.address, deployer.address))
          .loanAmount
      ).to.equal(0);
      expect((await storage.getPool(lp.address)).totalPooled).to.equal(250_000);

      // approve lp token allowance
      await lp.approve(storage.address, 50_000);

      // loan token
      await controller.loan(lp.address, 50_000);

      // check the storage states
      expect(
        (await storage.getLoanPosition(lp.address, deployer.address))
          .loanAmount
      ).to.equal(50_000);
      expect((await storage.getPool(lp.address)).totalPooled).to.equal(250_000);
      expect((await storage.getPool(lp.address)).loanedAmount).to.equal(50_000);

      // approve lp token allowance
      await lp.approve(controller.address, 51_000);

      // return loaned amount
      await controller.treasuryIncome(lp.address, 50_000, 1_000); // 1_000 LP for profit

      // check the storage states
      expect(
        (await storage.getLoanPosition(lp.address, deployer.address))
          .loanAmount
      ).to.equal(0);
      expect((await storage.getPool(lp.address)).totalPooled).to.equal(250_000);
      expect((await storage.getPool(lp.address)).loanedAmount).to.equal(0);

      // the profit should be remain in controller
      expect(await lp.balanceOf(controller.address)).to.equal(1_000);

      /* split the profit based on the user weight */
      // set the user weight - deployer/user/user2 : 50%/30%%/20%
      await storage.setWeight(deployer.address, 0.5);
      await storage.setWeight(user.address, 0.3);
      await storage.setWeight(user2.address, 0.2);

      // splitter
      await controller.splitter(lp.address, 1_000);

      // check the user balance
      expect(await lp.balanceOf(deployer.address)).to.equal(500);
      expect(await lp.balanceOf(user.address)).to.equal(500);
      expect(await lp.balanceOf(user2.address)).to.equal(500);

      // check controller balance
      expect(await lp.balanceOf(controller.address)).to.equal(0);
    });
  });
});
