const { expect } = require("chai");
const { toUtf8Bytes } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

// const URI = "testuri";
// const NAME = "MTK1";
// const DESCRIPTION = "Example description";
// const VALUE = BigInt(0.1 * 10 ** 18);

// const VAULT_ADDRESS = ethers.utils.getAddress("0xBA12222222228d8Ba445958a75a0704d566BF2C8");
// const USDC_CAPL_POOL_ID = "0x270c10cb22cf7dfcbb6435b9a0886bd05e5818e9000200000000000000000624";
// const USDC_ADDRESS = ethers.utils.getAddress("0xc2569dd7d0fd715b054fbf16e75b001e5c0c1115");
// const CAPL_ADDRESS = ethers.utils.getAddress(process.env.CAPL_ADDRESS_KOVAN);

const WEIGHT_CONVERSION = 10 ** 4;
const DEFAULT_DECIMALS = 18;
const SIX_DECIMALS = 6;

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
    BigInt(1_000_000 * 10 ** DEFAULT_DECIMALS),
  ]);

  const usdc = await deployContract("ERC20MockUSDC", [
    "USDC",
    "USDC",
    deployer.address,
    BigInt(1_000_000 * 10 ** SIX_DECIMALS),
  ]);

  // const nft = await deployContract("MyToken", []);
  // const swap = await deployContract("Swap", [CAPL_ADDRESS, USDC_ADDRESS, VAULT_ADDRESS, USDC_CAPL_POOL_ID]);
  const storage = await deployContract("TreasuryStorage", []);
  const controller = await deployContract("TreasuryController", [
    storage.address,
  ]);
  // const nftController = await deployContract("NFTRevenueController", [
  //   nft.address,
  //   swap.address
  // ]);
  return {
    lp,
    usdc,
    // nft,
    // swap,
    controller,
    // nftController,
    storage,
  };
};

const _formatEther = (amount) => {
  return Number(ethers.utils.formatEther(amount));
};

const _formatUSDC = (amount) => {
  return Number(ethers.utils.formatUnits(amount, 6));
};

describe("Treasury", async () => {
  let deployer, user, user2;
  let lp;
  // let swap, nft, nftController;
  let storage, controller;

  beforeEach(async () => {
    // get accounts
    [deployer, user, user2] = await ethers.getSigners();

    // deploy token contract
    ({ lp, usdc, nft, swap, controller, nftController, storage } =
      await deployContracts(deployer));

    // grant controller the REVENUE_CONTROLLER role of storage contract
    await storage.grantRole(
      await storage.REVENUE_CONTROLLER(),
      controller.address
    );
  });

  describe("TreasuryController", () => {
    describe("Deposit", () => {
      it("Should add userposition", async () => {
        // add pool
        await controller.addPool(lp.address);

        // approve lp token allowance
        await lp.approve(storage.address, BigInt(250_000 * 10 ** 18));

        // deposit new userposition
        await controller
          .connect(deployer)
          .deposit(lp.address, BigInt(250_000 * 10 ** 18));

        const pool = await storage.getPool(lp.address);
        const userbalance = await lp.balanceOf(deployer.address);

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
        expect(
          _formatEther((await storage.getPool(lp.address)).totalPooled).toFixed(
            0
          )
        ).to.equal("250000");
        expect(_formatEther(await lp.balanceOf(deployer.address))).to.equal(
          750_000
        );
        expect(_formatEther(await lp.balanceOf(storage.address))).to.equal(
          250_000
        );

        // withdraw token
        await controller.withdraw(lp.address, BigInt(250_000 * 10 ** 18));

        // check the storage states
        expect(
          _formatEther((await storage.getPool(lp.address)).totalPooled).toFixed(
            0
          )
        ).to.equal("0");
        expect(_formatEther(await lp.balanceOf(deployer.address))).to.equal(
          1_000_000
        );
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
        expect(
          _formatEther((await storage.getPool(lp.address)).totalPooled).toFixed(
            0
          )
        ).to.equal("250000");

        // loan token
        await controller.borrow(lp.address, BigInt(50_000 * 10 ** 18));

        // check the storage states
        expect(
          _formatEther((await storage.getPool(lp.address)).totalPooled).toFixed(
            0
          )
        ).to.equal("250000");
        expect(
          _formatEther(
            (await storage.getPool(lp.address)).loanedAmount
          ).toFixed(0)
        ).to.equal("50000");
      });

      it("Can't loan over available balance.", async () => {
        // add pool for the capl
        await controller.addPool(lp.address);

        // approve lp token allowance
        await lp.approve(storage.address, BigInt(250_000 * 10 ** 18));

        // deposit new userposition
        await controller.deposit(lp.address, BigInt(250_000 * 10 ** 18));

        // check the storage states
        expect(
          _formatEther((await storage.getPool(lp.address)).totalPooled).toFixed(
            0
          )
        ).to.equal("250000");

        // get user's unlocked amount
        const unlocked = await storage.getAvailableBalance(lp.address);

        // loaning will be reverted token
        try {
          await controller.borrow(
            lp.address,
            unlocked + BigInt(50_000 * 10 ** 18)
          );
        } catch (error) {
          expect(error.message).match(
            /Unable to borrow more than available balance/
          );
        }
        expect(
          _formatEther((await storage.getPool(lp.address)).totalPooled).toFixed(
            0
          )
        ).to.equal("250000");
        expect(
          _formatEther(
            (await storage.getPool(lp.address)).loanedAmount
          ).toFixed(0)
        ).to.equal("0");
      });
    });

    describe("Treasury Income, Profit", () => {
      it("Deposit, borrow, repay and split the revenue(CAPL)", async () => {
        // add pool for the capl
        await controller.addPool(lp.address);

        // approve lp token allowance
        await lp.approve(storage.address, BigInt(250_000 * 10 ** 18));

        // deposit new userposition
        await controller.deposit(lp.address, BigInt(250_000 * 10 ** 18));
        expect(
          _formatEther(await lp.balanceOf(deployer.address)).toFixed(0)
        ).to.equal("750000");

        // check the storage states
        expect(
          _formatEther((await storage.getPool(lp.address)).totalPooled).toFixed(
            0
          )
        ).to.equal("250000");

        // approve lp token allowance
        await lp.approve(storage.address, BigInt(50_000 * 10 ** 18));

        // loan token
        await controller.borrow(lp.address, BigInt(50_000 * 10 ** 18));
        expect(
          _formatEther(await lp.balanceOf(deployer.address)).toFixed(0)
        ).to.equal("800000");

        // check the storage states
        expect(
          _formatEther((await storage.getPool(lp.address)).totalPooled).toFixed(
            0
          )
        ).to.equal("250000");
        expect(
          _formatEther(
            (await storage.getPool(lp.address)).loanedAmount
          ).toFixed(0)
        ).to.equal("50000");

        // approve lp token allowance
        await lp.approve(controller.address, BigInt(51_000 * 10 ** 18));

        // return loaned amount
        await controller.treasuryIncome(
          lp.address,
          BigInt(50_000 * 10 ** 18),
          BigInt(1_000 * 10 ** 18)
        ); // 1_000 LP for profit
        expect(
          _formatEther(await lp.balanceOf(deployer.address)).toFixed(0)
        ).to.equal("749000"); // return loanAmount + profit

        // check the storage states
        expect(
          _formatEther((await storage.getPool(lp.address)).totalPooled).toFixed(
            0
          )
        ).to.equal("250000");
        expect(
          _formatEther(
            (await storage.getPool(lp.address)).loanedAmount
          ).toFixed(0)
        ).to.equal("0");

        // the profit should be remain in controller
        expect(_formatEther(await lp.balanceOf(controller.address))).to.equal(
          1_000
        );

        /* split the profit based on the user weight */
        // set the user weight - deployer/user/user2 : 50%/30%%/20%
        await storage.setWeight(
          deployer.address,
          BigInt(0.5 * WEIGHT_CONVERSION)
        );
        await storage.setWeight(user.address, BigInt(0.3 * WEIGHT_CONVERSION));
        await storage.setWeight(user2.address, BigInt(0.2 * WEIGHT_CONVERSION));

        // check balances of the user before split
        expect(
          _formatEther(await lp.balanceOf(deployer.address)).toFixed(0)
        ).to.equal("749000");
        expect(
          _formatEther(await lp.balanceOf(user.address)).toFixed(0)
        ).to.equal("0");
        expect(
          _formatEther(await lp.balanceOf(user2.address)).toFixed(0)
        ).to.equal("0");

        // check weights of the user before split
        expect(await storage.getWeight(deployer.address)).to.equal("5000");
        expect(await storage.getWeight(user.address)).to.equal("3000");
        expect(await storage.getWeight(user2.address)).to.equal("2000");

        // add whitelisted users
        await storage.addDistributionList(deployer.address);
        await storage.addDistributionList(user.address);
        await storage.addDistributionList(user2.address);

        // ditributeRevenue
        await controller.distributeRevenue(lp.address);

        // check the user balance
        expect(
          _formatEther(await lp.balanceOf(deployer.address)).toFixed(0)
        ).to.equal("749500");
        expect(
          _formatEther(await lp.balanceOf(user.address)).toFixed(0)
        ).to.equal("300");
        expect(
          _formatEther(await lp.balanceOf(user2.address)).toFixed(0)
        ).to.equal("200");

        // check controller balance
        expect(
          _formatEther(await lp.balanceOf(controller.address)).toFixed(0)
        ).to.equal("0");
      });
      it("Deposit, borrow, repay and split the revenue(USDC)", async () => {
        // add pool for the capl
        await controller.addPool(usdc.address);

        // approve lp token allowance
        await usdc.approve(
          storage.address,
          BigInt(250_000 * 10 ** SIX_DECIMALS)
        );

        // deposit new userposition
        await controller.deposit(
          usdc.address,
          BigInt(250_000 * 10 ** SIX_DECIMALS)
        );
        expect(
          _formatUSDC(await usdc.balanceOf(deployer.address)).toFixed(0)
        ).to.equal("750000");

        // check the storage states
        expect(
          _formatUSDC(
            (await storage.getPool(usdc.address)).totalPooled
          ).toFixed(0)
        ).to.equal("250000");

        // approve lp token allowance
        await usdc.approve(
          storage.address,
          BigInt(50_000 * 10 ** SIX_DECIMALS)
        );

        // loan token
        await controller.borrow(
          usdc.address,
          BigInt(50_000 * 10 ** SIX_DECIMALS)
        );
        expect(
          _formatUSDC(await usdc.balanceOf(deployer.address)).toFixed(0)
        ).to.equal("800000");

        // check the storage states
        expect(
          _formatUSDC(
            (await storage.getPool(usdc.address)).totalPooled
          ).toFixed(0)
        ).to.equal("250000");
        expect(
          _formatUSDC(
            (await storage.getPool(usdc.address)).loanedAmount
          ).toFixed(0)
        ).to.equal("50000");

        // approve lp token allowance
        await usdc.approve(controller.address, BigInt(51_000 * 10 ** 18));

        // return loaned amount
        await controller.treasuryIncome(
          usdc.address,
          BigInt(50_000 * 10 ** SIX_DECIMALS),
          BigInt(1_000 * 10 ** SIX_DECIMALS)
        ); // 1_000 LP for profit
        expect(
          _formatUSDC(await usdc.balanceOf(deployer.address)).toFixed(0)
        ).to.equal("749000"); // return loanAmount + profit

        // check the storage states
        expect(
          _formatUSDC(
            (await storage.getPool(usdc.address)).totalPooled
          ).toFixed(0)
        ).to.equal("250000");
        expect(
          _formatUSDC(
            (await storage.getPool(usdc.address)).loanedAmount
          ).toFixed(0)
        ).to.equal("0");

        // the profit should be remain in controller
        expect(_formatUSDC(await usdc.balanceOf(controller.address))).to.equal(
          1_000
        );

        /* split the profit based on the user weight */
        // set the user weight - deployer/user/user2 : 50%/30%%/20%
        await storage.setWeight(
          deployer.address,
          BigInt(0.5 * WEIGHT_CONVERSION)
        );
        await storage.setWeight(user.address, BigInt(0.3 * WEIGHT_CONVERSION));
        await storage.setWeight(user2.address, BigInt(0.2 * WEIGHT_CONVERSION));

        // check balances of the user before split
        expect(
          _formatUSDC(await usdc.balanceOf(deployer.address)).toFixed(0)
        ).to.equal("749000");
        expect(
          _formatUSDC(await usdc.balanceOf(user.address)).toFixed(0)
        ).to.equal("0");
        expect(
          _formatUSDC(await usdc.balanceOf(user2.address)).toFixed(0)
        ).to.equal("0");

        // check weights of the user before split
        expect(await storage.getWeight(deployer.address)).to.equal("5000");
        expect(await storage.getWeight(user.address)).to.equal("3000");
        expect(await storage.getWeight(user2.address)).to.equal("2000");

        // add whitelisted users
        await storage.addDistributionList(deployer.address);
        await storage.addDistributionList(user.address);
        await storage.addDistributionList(user2.address);

        // ditributeRevenue
        await controller.distributeRevenue(usdc.address);

        // check the user balance
        expect(
          _formatUSDC(await usdc.balanceOf(deployer.address)).toFixed(0)
        ).to.equal("749500");
        expect(
          _formatUSDC(await usdc.balanceOf(user.address)).toFixed(0)
        ).to.equal("300");
        expect(
          _formatUSDC(await usdc.balanceOf(user2.address)).toFixed(0)
        ).to.equal("200");

        // check controller balance
        expect(
          _formatUSDC(await usdc.balanceOf(controller.address)).toFixed(0)
        ).to.equal("0");
      });
    });
  });

  // describe("NFT Revenue Controller", () => {
  //   it("Deposit profit and split the profits", async () => {
  //     // approve lp token allowance
  //     await lp.approve(nftController.address, BigInt(250_000 * 10 ** 18));

  //     // deposit the profit from assets (NFT)
  //     await nftController.depositProfit(lp.address, BigInt(250_000 * 10 ** 18));
  //     // check the storage states
  //     expect(_formatEther(await lp.balanceOf(nftController.address)).toFixed(0)).to.equal('250000');
  //     expect(_formatEther(await lp.balanceOf(deployer.address)).toFixed(0)).to.equal('750000');

  //     /* split the profit based on the weight */
  //     // mint nft token
  //     const transaction = await nft.safeMint(deployer.address, URI, NAME, DESCRIPTION, VALUE);
  //     const tx = await transaction.wait();
  //     const tokenId = tx.events[0].args[2];

  //     // splitter
  //     await nftController.splitter(lp.address, BigInt(250_000 * 10 ** 18), tokenId);

  //     // check the nft owner balance
  //     expect(_formatEther(await lp.balanceOf(deployer.address)).toFixed(0)).to.equal('975000');

  //     // check nftController balance - will remain 5% of the profit
  //     expect(_formatEther(await lp.balanceOf(nftController.address)).toFixed(0)).to.equal('12500');
  //   });
  // });
});
