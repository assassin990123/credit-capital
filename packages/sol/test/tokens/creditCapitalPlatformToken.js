const { expect } = require("chai");
const { toUtf8Bytes } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

const deployContract = async (contract, params) => {
  let c = await ethers.getContractFactory(contract);
  if (params) c = await c.deploy(...params);
  else c = await c.deploy();
  return await c.deployed();
};

const deployContracts = async (cap) => {
  const capl = await deployContract("CreditCapitalPlatformToken", [cap]);
  return capl;
};

describe("Credit Capital Platform Token", function () {
  let deployer;
  let minter;
  let nonMinter;
  let capl;
  let cap;
  let minterRole;

  beforeEach(async function () {
    cap = 10000;

    [deployer, minter, nonMinter] = await ethers.getSigners();
    // deploy token contract
    capl = await deployContracts(cap);

    minterRole = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("MINTER_ROLE")
    );
    // grant minter role to the account
    await capl.grantRole(minterRole, minter.address);
  });

  it("Should be mintable", async function () {
    const mintAmount = 100;

    // minter mint the amount
    await capl.mint(minter.address, mintAmount);

    // check the minted amount
    const minterBalance = await capl.balanceOf(minter.address);
    const totalSupply = await capl.totalSupply();
    expect(totalSupply).to.equal(mintAmount);
    expect(minterBalance).to.equal(mintAmount);

    // Access Control
    // deployer(owner) should have minter role by default
    await capl.mint(deployer.address, mintAmount);

    const ownerBalance = await capl.balanceOf(deployer.address);
    expect(ownerBalance).to.equal(mintAmount);

    // mint should be failed without minter role
    try {
      await capl.connect(nonMinter).mint(nonMinter.address, mintAmount);
    } catch (error) {
      const revert = new RegExp(
        "AccessControl: account " +
          nonMinter.address.toLowerCase() +
          " is missing role " +
          minterRole
      );
      expect(error.message).match(revert);
    }
  });

  it("Should be capped", async function () {
    const mintAmount = 100;

    // mint should be impossible
    try {
      await capl.mint(deployer.address, cap + mintAmount);
    } catch (error) {
      expect(error.message).match(/ERC20Capped: cap exceeded/);
    }
  });

  it("Should be burnable", async function () {
    const burnAmount = 100;
    const mintAmount = 10000;

    // owner mint the amount
    await capl.mint(deployer.address, mintAmount);
    // burn amount from the deployer balance
    await capl.burn(burnAmount);

    // check the balance
    expect(await capl.balanceOf(deployer.address)).to.equal(
      mintAmount - burnAmount
    );
    expect(await capl.totalSupply()).to.equal(mintAmount - burnAmount);

    // burnFrom
    await capl.approve(nonMinter.address, burnAmount);
    await capl.connect(nonMinter).burnFrom(deployer.address, burnAmount);

    // the normal user can burn from the deployer balance
    expect(await capl.balanceOf(deployer.address)).to.equal(
      mintAmount - burnAmount * 2
    );
    expect(await capl.totalSupply()).to.equal(mintAmount - burnAmount * 2);
  });
});
