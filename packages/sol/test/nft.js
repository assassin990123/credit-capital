const { expect } = require("chai");
const { toUtf8Bytes } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

const URI = "testuri";
const NAME = "MTK1";
const DESCRIPTION = "Example description";
const VALUE = BigInt(0.1 * 10 ** 18);
const MINTER_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes("MINTER_ROLE")
);
const TIMELOCK = 60 * 60; // 1 hour

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
  let nft;

  beforeEach(async () => {
    // get accounts
    [deployer, user] = await ethers.getSigners();

    // deploy token contract
    ({ nft } = await deployContracts());
  });

  it("Should be mintable with RBAC", async () => {
    // check balance of deployer
    let balance = await nft.balanceOf(deployer.address);
    expect(balance).to.equal(0);

    /* the metadata is assumed to come from IPFS */
    // the uri, name, description, value will be stored offchain like IPFS
    let transaction = await nft.safeMint(deployer.address, URI, NAME, DESCRIPTION, VALUE);
    let tx = await transaction.wait();
    let tokenId = tx.events[0].args[2];

    // check the metadata on chain
    const metadata = await nft.getMetadataOnChain(tokenId);
    expect(metadata.name).to.equal(NAME);
    expect(metadata.description).to.equal(DESCRIPTION);
    expect(metadata.value).to.equal(VALUE);
    expect(await nft.tokenURI(tokenId)).to.equal(URI);

    // check minter balance
    balance = await nft.balanceOf(deployer.address);
    expect(balance).to.equal(1);

    // mint without permission
    try {
      await nft.connect(user).safeMint(deployer.address, URI, NAME, DESCRIPTION, VALUE);
    } catch (error) {
      const revert = new RegExp(
        "AccessControl: account " +
          user.address.toLowerCase() +
          " is missing role " +
          MINTER_ROLE
      );
      expect(error.message).match(revert);
    }
  });

  it("Should be able to be locked", async () => {
    // mint nft
    let transaction = await nft.safeMint(deployer.address, URI, NAME, DESCRIPTION, VALUE);
    let tx = await transaction.wait();
    let tokenId = tx.events[0].args[2];

    // check the metadata on chain
    let metadata = await nft.getMetadataOnChain(tokenId);

    // get blocktimestamp
    let blockNumBefore = await ethers.provider.getBlockNumber();
    let blockBefore = await ethers.provider.getBlock(blockNumBefore);

    expect(metadata.name).to.equal(NAME);
    expect(metadata.description).to.equal(DESCRIPTION);
    expect(metadata.value).to.equal(VALUE);
    expect(metadata.timelockEnd).to.equal(blockBefore.timestamp);
    expect(await nft.tokenURI(tokenId)).to.equal(URI);

    // lock nft
    await nft.lockNFT(tokenId, TIMELOCK);

    // check the metadata on chain
    metadata = await nft.getMetadataOnChain(tokenId);
    blockNumBefore = await ethers.provider.getBlockNumber();
    blockBefore = await ethers.provider.getBlock(blockNumBefore);
    expect(metadata.timelockEnd).to.equal(blockBefore.timestamp + TIMELOCK);

    // only the token owner can lock nft
    try {
      await nft.connect(user).lockNFT(tokenId, TIMELOCK);
    } catch (error) {
      expect(error.message).match(/Permission: the sender is not the owner of this token/);
    }
    // console.log(Object.keys(nft));

    // token transfer should be failed
    try {
      await nft['safeTransferFrom(address,address,uint256)'](deployer.address, user.address, tokenId);
    } catch (error) {
      expect(error.message).match(/Timelock: Locked token/);
    }

    // fast forward 1h
    await network.provider.send("evm_increaseTime", [3600]);
    await network.provider.send("evm_mine");

    await nft['safeTransferFrom(address,address,uint256)'](deployer.address, user.address, tokenId);
    expect(await nft.ownerOf(tokenId)).to.equal(user.address);
  });
});