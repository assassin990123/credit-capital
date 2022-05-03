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

const deployContracts = async () => {
  const nft = await deployContract("MyToken", []);
  return { nft };
};

const _formatEther = (amount) => {
  return Number(ethers.utils.formatEther(amount));
};

describe("My Token / MTK", async () => {
  let deployer;
  let user;
  let user2;
  let nft;

  beforeEach(async () => {
    // get accounts
    [deployer, user, user2] = await ethers.getSigners();

    // deploy token contract
    ({ nft } = await deployContracts());
  });

  it("Should mintable", async () => {
    // check balance of deployer
    let balance = await nft.balanceOf(deployer.address);
    expect(balance).to.equal(0);

    await nft.safeMint(deployer.address, URI, NAME, DESCRIPTION, VALUE);
  });
});