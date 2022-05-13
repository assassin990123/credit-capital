const { expect } = require("chai");
const { toUtf8Bytes } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

const URI = "testuri";
const NAME = "MTK1";
const DESCRIPTION = "Example description";
const VALUE = BigInt(0.1 * 10 ** 18);

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
    BigInt(1_000_000 * 10 ** 18),
  ]);
  const storage = await deployContract("TreasuryStorage");
  const controller = await deployContract("RevenueController", [
    storage.address,
  ]);
  const nftController = await deployContract("NFTRevenueController", [
    storage.address,
  ]);
  return { lp, controller, nftController, storage };
};

const _formatEther = (amount) => {
  return Number(ethers.utils.formatEther(amount));
};

describe("Treasury", async () => {
  let deployer;
  let user;
  let user2;
  let lp;
  let storage;
  let controller;
  let nftController;

  beforeEach(async () => {
    // get accounts
    [deployer, user, user2] = await ethers.getSigners();

    // deploy token contract
    ({ lp, controller, nftController, storage } = await deployContracts(deployer));

    // grant controller the REVENUE_CONTROLLER role of storage contract
    await storage.grantRole(
      await storage.REVENUE_CONTROLLER(),
      controller.address
    );

    // grant nftController the REVENUE_CONTROLLER role of storage contract
    await storage.grantRole(
      await storage.REVENUE_CONTROLLER(),
      nftController.address
    );
  });

  describe("RevenueController", () => {
    describe("Deposit", () => {
      it("Should add userposition", async () => {
        // add pool
        await controller.addPool(lp.address);

        // approve lp token allowance
        await lp.approve(storage.address, BigInt(250_000 * 10 ** 18));

        // deposit new userposition
        await controller.connect(deployer).deposit(lp.address, BigInt(250_000 * 10 ** 18));

        const user = await storage.getLoanPosition(lp.address, deployer.address);
        const pool = await storage.getPool(lp.address);
        const userbalance = await lp.balanceOf(deployer.address);

        expect(_formatEther(user.loanAmount)).to.equal(0);
        expect(_formatEther(pool.totalPooled)).to.equal(250_000);
        expect(_formatEther(userbalance)).to.equal(750_000);
      });
    });

    describe("Withdraw", () => {
      it("Should update pool", async () => {
        // add pool for the capl
        await controller.addPool(lp.address);

        // approve lp token allowance
        await lp.approve(storage.address, BigInt(250_000 * 10 ** 18));

        // deposit new pool
        await controller.deposit(lp.address, BigInt(250_000 * 10 ** 18));

        // check the storage states
        expect(_formatEther((await storage.getPool(lp.address)).totalPooled).toFixed(0)).to.equal('250000');
        expect(_formatEther(await lp.balanceOf(deployer.address))).to.equal(750_000);
        expect(_formatEther(await lp.balanceOf(storage.address))).to.equal(250_000);

        // withdraw token
        await controller.withdraw(lp.address);

        // check the storage states
        expect(_formatEther((await storage.getPool(lp.address)).totalPooled).toFixed(0)).to.equal('0');
        expect(_formatEther(await lp.balanceOf(deployer.address))).to.equal(1_000_000);
        expect(_formatEther(await lp.balanceOf(storage.address))).to.equal(0);
      });
    });

    describe("Loaning", () => {
      it("Should update corresponsonding storage states", async () => {
        // add pool for the capl
        await controller.addPool(lp.address); // 10 CAPL per block

        // approve lp token allowance
        await lp.approve(storage.address, BigInt(250_000 * 10 ** 18));

        // deposit new userposition
        await controller.deposit(lp.address, BigInt(250_000 * 10 ** 18));
        
        // check the storage states
        let loanPosition = await storage.getLoanPosition(lp.address, deployer.address);
        expect(_formatEther(loanPosition.loanAmount).toFixed(0)).to.equal('0');
        expect(_formatEther((await storage.getPool(lp.address)).totalPooled).toFixed(0)).to.equal('250000');

        // loan token
        await controller.loan(lp.address, BigInt(50_000 * 10 ** 18));

        // check the storage states
        loanPosition = await storage.getLoanPosition(lp.address, deployer.address);
        expect(_formatEther(loanPosition.loanAmount).toFixed(0)).to.equal('50000');
        expect(_formatEther((await storage.getPool(lp.address)).totalPooled).toFixed(0)).to.equal('250000');
        expect(_formatEther((await storage.getPool(lp.address)).loanedAmount).toFixed(0)).to.equal('50000');
      });

      it("Can't loan over unlockedAmount", async () => {
        // add pool for the capl
        await controller.addPool(lp.address);

        // approve lp token allowance
        await lp.approve(storage.address, BigInt(250_000 * 10 ** 18));

        // deposit new userposition
        await controller.deposit(lp.address, BigInt(250_000 * 10 ** 18));

        // check the storage states
        expect(_formatEther((await storage.getLoanPosition(lp.address, deployer.address)).loanAmount).toFixed(0)).to.equal('0');
        expect(_formatEther((await storage.getPool(lp.address)).totalPooled).toFixed(0)).to.equal('250000');

        // get user's unlocked amount
        const unlocked = await storage.getUnlockedAmount(
          lp.address
        );

        // loaning will be reverted token
        try {
          await controller.loan(lp.address, unlocked + BigInt(50_000 * 10 ** 18));
        } catch (error) {
          expect(error.message).match(/Can not loan over unlocked amount/);
        }
        expect(_formatEther((await storage.getLoanPosition(lp.address, deployer.address)).loanAmount).toFixed(0)).to.equal('0');
        expect(_formatEther((await storage.getPool(lp.address)).totalPooled).toFixed(0)).to.equal('250000');
        expect(_formatEther((await storage.getPool(lp.address)).loanedAmount).toFixed(0)).to.equal('0');
      });
    });

    describe("Treasury Income, Profit", () => {
      it("Deposit, loan, return principal and split the profits", async () => {
        // add pool for the capl
        await controller.addPool(lp.address);

        // approve lp token allowance
        await lp.approve(storage.address, BigInt(250_000 * 10 ** 18));

        // deposit new userposition
        await controller.deposit(lp.address, BigInt(250_000 * 10 ** 18));
        expect(_formatEther(await lp.balanceOf(deployer.address)).toFixed(0)).to.equal('750000');

        // check the storage states
        expect(_formatEther((await storage.getLoanPosition(lp.address, deployer.address)).loanAmount).toFixed(0)).to.equal('0');
        expect(_formatEther((await storage.getPool(lp.address)).totalPooled).toFixed(0)).to.equal('250000');

        // approve lp token allowance
        await lp.approve(storage.address, BigInt(50_000 * 10 ** 18));

        // loan token
        await controller.loan(lp.address, BigInt(50_000 * 10 ** 18));
        expect(_formatEther(await lp.balanceOf(deployer.address)).toFixed(0)).to.equal('800000');

        // check the storage states
        expect(_formatEther((await storage.getLoanPosition(lp.address, deployer.address)).loanAmount).toFixed(0)).to.equal('50000');
        expect(_formatEther((await storage.getPool(lp.address)).totalPooled).toFixed(0)).to.equal('250000');
        expect(_formatEther((await storage.getPool(lp.address)).loanedAmount).toFixed(0)).to.equal('50000');

        // approve lp token allowance
        await lp.approve(controller.address, BigInt(51_000 * 10 **18));

        // return loaned amount
        await controller.treasuryIncome(lp.address, BigInt(50_000 * 10 ** 18), BigInt(1_000 * 10 ** 18)); // 1_000 LP for profit
        expect(_formatEther(await lp.balanceOf(deployer.address)).toFixed(0)).to.equal('749000'); // return loanAmount + profit

        // check the storage states
        expect(_formatEther((await storage.getLoanPosition(lp.address, deployer.address)).loanAmount).toFixed(0)).to.equal('0');
        expect(_formatEther((await storage.getPool(lp.address)).totalPooled).toFixed(0)).to.equal('250000');
        expect(_formatEther((await storage.getPool(lp.address)).loanedAmount).toFixed(0)).to.equal('0');

        // the profit should be remain in controller
        expect(_formatEther(await lp.balanceOf(controller.address))).to.equal(1_000);

        /* split the profit based on the user weight */
        // set the user weight - deployer/user/user2 : 50%/30%%/20%
        await controller.setWeight(deployer.address, BigInt(0.5 * 10 ** 18));
        await controller.setWeight(user.address, BigInt(0.3 * 10 ** 18));
        await controller.setWeight(user2.address, BigInt(0.2 * 10 ** 18));

        // check balances of the user before split
        expect(_formatEther(await lp.balanceOf(deployer.address)).toFixed(0)).to.equal('749000');
        expect(_formatEther(await lp.balanceOf(user.address)).toFixed(0)).to.equal('0');
        expect(_formatEther(await lp.balanceOf(user2.address)).toFixed(0)).to.equal('0');

        // check weights of the user before split
        expect(_formatEther(await controller.getWeight(deployer.address)).toFixed(1)).to.equal('0.5');
        expect(_formatEther(await controller.getWeight(user.address)).toFixed(1)).to.equal('0.3');
        expect(_formatEther(await controller.getWeight(user2.address)).toFixed(1)).to.equal('0.2');

        // add whitelisted users
        await controller.addWhitelist(deployer.address);
        await controller.addWhitelist(user.address);
        await controller.addWhitelist(user2.address);

        // splitter
        await controller.splitter(lp.address, BigInt(1_000 * 10 ** 18));

        // check the user balance
        expect(_formatEther(await lp.balanceOf(deployer.address)).toFixed(0)).to.equal('749500');
        expect(_formatEther(await lp.balanceOf(user.address)).toFixed(0)).to.equal('300');
        expect(_formatEther(await lp.balanceOf(user2.address)).toFixed(0)).to.equal('200');

        // check controller balance
        expect(_formatEther(await lp.balanceOf(controller.address)).toFixed(0)).to.equal('0');
      });
    });
  });

  describe("NFT Revenue Controller", () => {
    let nft1;
    let nft2;
    let nft3;
    before(async () => {
      // deploy nft contracts
      nft1 = await deployContract("MyToken");
      nft2 = await deployContract("MyToken");
      nft3 = await deployContract("MyToken");
    });

    it("Deposit, loan, return principal and split the profits", async () => {
      // add pool for the capl
      await nftController.addPool(lp.address);

      // approve lp token allowance
      await lp.approve(storage.address, BigInt(250_000 * 10 ** 18));

      // deposit new userposition
      await nftController.deposit(lp.address, BigInt(250_000 * 10 ** 18));
      expect(_formatEther(await lp.balanceOf(deployer.address)).toFixed(0)).to.equal('750000');

      // check the storage states
      expect(_formatEther((await storage.getLoanPosition(lp.address, deployer.address)).loanAmount).toFixed(0)).to.equal('0');
      expect(_formatEther((await storage.getPool(lp.address)).totalPooled).toFixed(0)).to.equal('250000');

      // approve lp token allowance
      await lp.approve(storage.address, BigInt(50_000 * 10 ** 18));

      // loan token
      await nftController.loan(lp.address, BigInt(50_000 * 10 ** 18));
      expect(_formatEther(await lp.balanceOf(deployer.address)).toFixed(0)).to.equal('800000');

      // check the storage states
      expect(_formatEther((await storage.getLoanPosition(lp.address, deployer.address)).loanAmount).toFixed(0)).to.equal('50000');
      expect(_formatEther((await storage.getPool(lp.address)).totalPooled).toFixed(0)).to.equal('250000');
      expect(_formatEther((await storage.getPool(lp.address)).loanedAmount).toFixed(0)).to.equal('50000');

      // approve lp token allowance
      await lp.approve(nftController.address, BigInt(51_000 * 10 **18));

      // return loaned amount
      await nftController.treasuryIncome(lp.address, BigInt(50_000 * 10 ** 18), BigInt(1_000 * 10 ** 18)); // 1_000 LP for profit
      expect(_formatEther(await lp.balanceOf(deployer.address)).toFixed(0)).to.equal('749000'); // return loanAmount + profit

      // check the storage states
      expect(_formatEther((await storage.getLoanPosition(lp.address, deployer.address)).loanAmount).toFixed(0)).to.equal('0');
      expect(_formatEther((await storage.getPool(lp.address)).totalPooled).toFixed(0)).to.equal('250000');
      expect(_formatEther((await storage.getPool(lp.address)).loanedAmount).toFixed(0)).to.equal('0');

      // the profit should be remain in nftController
      expect(_formatEther(await lp.balanceOf(nftController.address))).to.equal(1_000);

      /* split the profit based on the user weight */
      // mint nft token
      await nft1.safeMint(deployer.address, URI, NAME, DESCRIPTION, VALUE);
      await nft2.connect(user).safeMint(user.address, URI, NAME, DESCRIPTION, VALUE);
      await nft3.connect(user2).safeMint(user2.address, URI, NAME, DESCRIPTION, VALUE);

      // We will have 3 nft token owners and split the profit per each owner

      // check balances of the user before split
      expect(_formatEther(await lp.balanceOf(deployer.address)).toFixed(0)).to.equal('749000');
      expect(_formatEther(await lp.balanceOf(user.address)).toFixed(0)).to.equal('0');
      expect(_formatEther(await lp.balanceOf(user2.address)).toFixed(0)).to.equal('0');

      // add nft addresses
      await nftController.addNFTAddress(nft1.address);
      await nftController.addNFTAddress(nft2.address);
      await nftController.addNFTAddress(nft3.address);

      // splitter
      await nftController.splitter(lp.address, BigInt(1_000 * 10 ** 18));

      // check the user balance
      expect(_formatEther(await lp.balanceOf(deployer.address)).toFixed(0)).to.equal('749317');
      expect(_formatEther(await lp.balanceOf(user.address)).toFixed(0)).to.equal('317');
      expect(_formatEther(await lp.balanceOf(user1.address)).toFixed(0)).to.equal('317');

      // check nftController balance
      expect(_formatEther(await lp.balanceOf(nftController.address)).toFixed(0)).to.equal('50');
    });
  });
});
