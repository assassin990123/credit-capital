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
  const capl = await deployContract("CreditCapitalPlatformToken", [100]);
  const storage = await deployContract("TreasuryStorage", [lp.address]);
  const controller = await deployContract("RevenueController", [
    capl.address,
    storage.address,
  ]);
  return { lp, capl, controller, storage };
};

describe("Treasury", async () => {
  let deployer;
  let user;
  let user2;
  let lp;
  let capl;
  let storage;
  let controller;

  beforeEach(async () => {
    // get accounts
    [deployer, user, user2] = await ethers.getSigners();

    // deploy token contract
    ({ lp, capl, storage, controller } = await deployContracts(deployer));

    // grant controller the REVENUE_CONTROLLER role of storage contract
    await storage.grantRole(
      await storage.REVENUE_CONTROLLER(),
      controller.address
    );

    // add pool for the capl
    await controller.addPool(lp.address); // 10 CAPL per block
  });

  describe("Deposit", () => {
    it("Should add userposition", async () => {
      // approve lp token allowance
      await lp.approve(controller.address, 500_000);

      console.log(
        await lp.allowance(deployer.address, controller.address),
        await lp.balanceOf(deployer.address)
      );

      await network.provider.send("evm_increaseTime", [3600]);
      await network.provider.send("evm_mine"); // this one will have 02:00 PM as its timestamp

      // deposit new userposition
      await controller.connect(deployer).deposit(lp.address, 250_000);

      const user = await storage.getUserPosition(lp.address, deployer.address);
      const pool = await storage.getPool(lp.address);

      expect(user.totalAmount).to.equal(250_000);
      expect(pool.totalPooled).to.equal(250_000);
    });
  });

  describe("Withdraw", () => {
    it ("Should update userposition", async () => {
      // add pool for the capl
      await controller.addPool(lp.address); // 10 CAPL per block

      // approve lp token allowance
      await lp.approve(storage.address, 250_000);

      // deposit new userposition
      await controller.deposit(lp.address, 250_000);

      // check the storage states
      expect(
        await storage.getUserPosition(lp.address, deployer.address).totalAmount
      ).to.equal(250_000);
      expect(await storage.getPool(lp.address).totalPooled).to.equal(250_000);

      // withdraw token
      await controller.withdraw(lp.address);

      // check the storage states
      expect((await storage.getUserPosition(lp.address, deployer.address)).totalAmount).to.equal(0);
      expect((await storage.getPool(lp.address)).totalPooled).to.equal(0);
    }); 
  });

  describe ("Loaning", () => {
    it ("Should update corresponsonding storage states", async () => {
      // add pool for the capl
      await controller.addPool(lp.address); // 10 CAPL per block
  
      // approve lp token allowance
      await lp.approve(storage.address, 250_000);
  
      // deposit new userposition
      await controller.deposit(lp.address, 250_000);

      // check the storage states
      expect(
        await storage.getUserPosition(lp.address, deployer.address).totalAmount
      ).to.equal(250_000);
      expect(await storage.getPool(lp.address).totalPooled).to.equal(250_000);

      // loan token
      await controller.loan(lp.address, 50_000);

      // check the storage states
      expect((await storage.getUserPosition(lp.address, deployer.address)).totalAmount).to.equal(250_000);
      expect((await storage.getUserPosition(lp.address, deployer.address)).loanedAmount).to.equal(50_000);
      expect((await storage.getPool(lp.address)).totalPooled).to.equal(200_000);
    }); 

    it ("Can't loan over unlockedAmount", async () => {
      // add pool for the capl
      await controller.addPool(lp.address); // 10 CAPL per block

      // approve lp token allowance
      await lp.approve(storage.address, 250_000);

      expect(
        await storage.getUserPosition(lp.address, deployer.address).totalAmount
      ).to.equal(250_000);
      expect(
        await storage.getUserPosition(lp.address, deployer.address).loanedAmount
      ).to.equal(50_000);
      expect(await storage.getPool(lp.address).totalPooled).to.equal(200_000);
    });

    it("Can't loan over unlockedAmount", async () => {
      // deposit new userposition
      await controller.deposit(lp.address, 250_000);
      
      // check the storage states
      expect((await storage.getUserPosition(lp.address, deployer.address)).totalAmount).to.equal(250_000);
      expect((await storage.getPool(lp.address)).totalPooled).to.equal(250_000);

      // get user's unlocked amount
      const unlocked = await storage.getUnlockedAmount(lp.address, deployer.address);
      
      // approve lp token allowance
      await lp.approve(storage.address, unlocked + 50_000);

      // loaning will be reverted token
      try {
        await controller.loan(lp.address, unlocked + 50_000);
      } catch (error) {
        expect(error.message).match(/Can not loan over unlocked amount/);
      }
      expect((await storage.getUserPosition(lp.address, deployer.address)).loanedAmount).to.equal(0);
      expect((await storage.getPool(lp.address)).totalPooled).to.equal(250_000);
    });
  });

  describe ("Treasury Income, Profit", () => {
    it ("Should return principal to storage and remain profit in controller", async () => {
      // add pool for the capl
      await controller.addPool(lp.address); // 10 CAPL per block
  
      // approve lp token allowance
      await lp.approve(storage.address, 250_000);
  
      expect(
        await storage.getUserPosition(lp.address, deployer.address).totalAmount
      ).to.equal(250_000);
      expect(await storage.getPool(lp.address).totalPooled).to.equal(250_000);

      // get user's unlocked amount
      const unlocked = await storage.getUnlockedAmount(
        lp.address,
        deployer.address
      );

      // loaning will be reverted token
      expect(
        await controller.loan(lp.address, unlocked + 50_000)
      ).to.be.reverted();
      expect(
        await storage.getUserPosition(lp.address, deployer.address).loanedAmount
      ).to.equal(0);
      expect(await storage.getPool(lp.address).totalPooled).to.equal(250_000);
    });
  });

  describe("Treasury Income, Profit", () => {
    it("Should return principal to storage and remain profit in controller", async () => {
      // deposit new userposition
      await controller.deposit(lp.address, 250_000);

      // check the storage states
      expect((await storage.getUserPosition(lp.address, deployer.address)).totalAmount).to.equal(250_000);
      expect((await storage.getPool(lp.address)).totalPooled).to.equal(250_000);

      // approve lp token allowance
      await lp.approve(storage.address, 50_000);

      // loan token
      await controller.loan(lp.address, 50_000);

      // check the storage states
      expect((await storage.getUserPosition(lp.address, deployer.address)).totalAmount).to.equal(250_000);
      expect((await storage.getUserPosition(lp.address, deployer.address)).loanedAmount).to.equal(50_000);
      expect((await storage.getPool(lp.address)).totalPooled).to.equal(200_000);

      // approve lp token allowance
      await lp.approve(controller.address, 51_000);

      // return loaned amount
      await controller.treasuryIncome(lp.address, 50_000, 1000); // 1000 LP for profit

      // check the storage states
      expect((await storage.getUserPosition(lp.address, deployer.address)).totalAmount).to.equal(250_000);
      expect((await storage.getUserPosition(lp.address, deployer.address)).loanedAmount).to.equal(0);
      expect((await storage.getPool(lp.address)).totalPooled).to.equal(250_000);
      
      // the profit should be remain in controller
      expect(await lp.balanceOf(controller.address)).to.equal(1000);
      
      // distribute user alloc based on time
      const allocAmount = await controller.getTokenAlloc(lp.address);
      
      // return token alloc to the user
      await controller.callStatic.distributeTokenAlloc(lp.address);
      console.log(allocAmount);

      console.log((await storage.getUserPosition(lp.address, deployer.address)).totalAmount);
      expect((await storage.getUserPosition(lp.address, deployer.address)).totalAmount).to.equal(250_000 + allocAmount);
      expect((await storage.getUserPosition(lp.address, deployer.address)).profit).to.equal(allocAmount);
      expect((await storage.getPool(lp.address)).totalPooled).to.equal(250_000 + allocAmount);
    });
  });
});
