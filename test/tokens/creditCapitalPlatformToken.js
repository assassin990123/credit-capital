const { expect } = require("chai");
const { toUtf8Bytes } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

const deployContract = async (contract, params) => {
  let c = await ethers.getContractFactory(contract);
  if (params) c = await c.deploy(params)
  else c = await c.deploy()
  return await c.deployed()
}

describe("Credit Capital Platform Token", async function () {
	beforeEach(async function () {
		// set supply limit
		const cap = 10000;

		// deploy token contract
		const creditCapitalPlatformToken = await deployContract("CAPL", cap);

		// get test accounts
		[deployer, minter, normalUser] = await ethers.getSigners();

		// grant minter role to the account
		await creditCapitalPlatformToken.grantRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MINTER_ROLE')), minter.address);
	});

	it("Should be mintable", async function () {
		const mintAmount = 100;

		// minter mint the amount
		await creditCapitalPlatformToken.connect(minter.address).mint(mintAmount);

		// check the minted amount
		const minterBalance = await creditCapitalPlatformToken.balanceOf(minter.address);
		const totalSupply = await creditCapitalPlatformToken.totalSupply();

		expect(totalSupply).to.eql(mintAmount);
		expect(minterBalance).to.eql(mintAmount);

		// Access Control
		// deployer(owner) should have minter role by default
		await creditCapitalPlatformToken.mint(mintAmount);

		const ownerBalance = await creditCapitalPlatformToken.balanceOf(deployer.address);
		expect(ownerBalance).to.eql(mintAmount);

		// mint should be failed without minter role
		expect(await creditCapitalPlatformToken.connect(normalUser.address).mint(mintAmount)).fail();
	});

	it("Should be capped", async function () {
		const mintAmount = 100;

		// mint should be impossible
		expect(await creditCapitalPlatformToken.mint(cap + mintAmount)).fail();
	});

	it("Should be burnable", async function () {
		const burnAmount = 100;
		const mintAmount = 10000;

		// owner mint the amount
		await creditCapitalPlatformToken.mint(mintAmount);

		// burn amount from the deployer balance
		await creditCapitalPlatformToken.burn(burnAmount);

		// check the balance
		expect(await creditCapitalPlatformToken.balanceOf(deployer.address)).to.eql(mintAmount - burnAmount);
		expect(await creditCapitalPlatformToken.totalSupply()).to.eql(mintAmount - burnAmount);

		// burnFrom
		await creditCapitalPlatformToken.approve(normalUser, burnAmount);
		await creditCapitalPlatformToken.burnFrom(deployer.address, burnAmount);
		
		// the normal user can burn from the deployer balance
		expect(await creditCapitalPlatformToken.balanceOf(deployer.address)).to.eql(mintAmount - (burnAmount * 2));
		expect(await creditCapitalPlatformToken.totalSupply()).to.eql(mintAmount - (burnAmount * 2));
	});
})