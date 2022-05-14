const { expect } = require("chai");
const { toUtf8Bytes } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

const URI = "testuri";
const NAME = "MTK1";
const DESCRIPTION = "Example description";
const VALUE = BigInt(0.1 * 10 ** 18);

const VAULT_ADDRESS="0xBA12222222228d8Ba445958a75a0704d566BF2C8"
const USDC_CAPL_POOL_ID = "0x270c10cb22cf7dfcbb6435b9a0886bd05e5818e9000200000000000000000624";
const USDC_ADDRESS = "0xc2569dd7d0fd715b054fbf16e75b001e5c0c1115";

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

  const nft = await deployContract("MyToken", []);
  const swap = await deployContract("Swap", [process.env.CAPL_ADDRESS_KOVAN, USDC_ADDRESS, VAULT_ADDRESS, USDC_CAPL_POOL_ID]);
  const storage = await deployContract("TreasuryStorage", []);
  const controller = await deployContract("RevenueController", [
    storage.address,
  ]);
  const nftController = await deployContract("NFTRevenueController", [
    nft.address,
    swap.address
  ]);
  return { lp, nft, swap, controller, nftController, storage };
};

const _formatEther = (amount) => {
  return Number(ethers.utils.formatEther(amount));
};

describe("Treasury", async () => {
  let deployer, user, user2;
  let lp, nft;
  let swap, storage, controller, nftController;

  beforeEach(async () => {
    // get accounts
    [deployer, user, user2] = await ethers.getSigners();

    // deploy token contract
    ({ lp, nft, swap, controller, nftController, storage } = await deployContracts(deployer));

    // grant controller the REVENUE_CONTROLLER role of storage contract
    await storage.grantRole(
      await storage.REVENUE_CONTROLLER(),
      controller.address
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
    it("Deposit profit and split the profits", async () => {
      // approve lp token allowance
      await lp.approve(nftController.address, BigInt(250_000 * 10 ** 18));

      // deposit the profit from assets (NFT)
      await nftController.depositProfit(lp.address, BigInt(250_000 * 10 ** 18));
      // check the storage states
      expect(_formatEther(await lp.balanceOf(nftController.address)).toFixed(0)).to.equal('250000');
      expect(_formatEther(await lp.balanceOf(deployer.address)).toFixed(0)).to.equal('750000');

      /* split the profit based on the weight */
      // mint nft token
      const transaction = await nft.safeMint(deployer.address, URI, NAME, DESCRIPTION, VALUE);
      const tx = await transaction.wait();
      const tokenId = tx.events[0].args[2];

      // splitter
      await nftController.splitter(lp.address, BigInt(250_000 * 10 ** 18), tokenId);

      // check the nft owner balance
      expect(_formatEther(await lp.balanceOf(deployer.address)).toFixed(0)).to.equal('975000');

      // check nftController balance - will remain 5% of the profit
      expect(_formatEther(await lp.balanceOf(nftController.address)).toFixed(0)).to.equal('12500');
    });
  });
});
