const hre = require("hardhat");
const fs = require('fs');

const USDC_CAPL_POOL_ID = "0x270c10cb22cf7dfcbb6435b9a0886bd05e5818e9000200000000000000000624";
const USDC_ADDRESS = "0xc2569dd7d0fd715b054fbf16e75b001e5c0c1115";

async function main() {
  /**
   * Standard contracts - Rewards, Vault
   */
  // const Vault = await hre.ethers.getContractFactory("Vault");
  // const vault = await Vault.deploy(process.env.LP_ADDRESS_KOVAN, BigInt(5000 / (24 * 60 * 60) * (10 ** 18)));
  // await vault.deployed();
  // console.log("vault deployed to:", vault.address);
  // await saveContractABI("vault", "Vault");

  // const Rewards = await hre.ethers.getContractFactory("Rewards");
  // const rewards = await Rewards.deploy(vault.address, process.env.CAPL_ADDRESS_KOVAN);
  // await rewards.deployed();
  // console.log("rewards deployed to:", rewards.address);
  // await saveContractABI("rewards", "Rewards");

  const Swap = await hre.ethers.getContractFactory("Swap");
  const swap = await Swap.deploy(process.env.CAPL_ADDRESS_KOVAN, USDC_ADDRESS, USDC_CAPL_POOL_ID);
  await swap.deployed();
  console.log("swap deployed to:", swap.address);
  await saveContractABI("swap", "Swap");

  /**
   * Treasury contracts - RevenueController, TreasuryStorage
  const TreasuryStorage = await hre.ethers.getContractFactory("TreasuryStorage");
  const treasurystorage = await TreasuryStorage.deploy(process.env.LP_TOKEN_ADDRESS);
  await treasurystorage.deployed();
  console.log("treasurystorage deployed to:", treasurystorage.address);
  await saveContractABI("treasurystorage", "TreasuryStorage");
 
  const RevenueController = await hre.ethers.getContractFactory("RevenueController");
  const revenuecontroller = await RevenueController.deploy(capl.address, treasurystorage.address);
  await revenuecontroller.deployed();
  console.log("revenuecontroller deployed to:", revenuecontroller.address);
  await saveContractABI("revenuecontroller", "RevenueController");
   */  

  // /**
  //  * Grant roles
  //  */
  // await grantRoles(rewards, vault);
  
  // // save deployed address in config file
  // let config = `
  // export const vaultcontractaddress = "${vault.address}"
  // export const rewardscontractaddress = "${rewards.address}"
  // `
  // /*
  //   export const treasurystorage = "${treasurystorage.address}"
  // export const revenuecontroller = "${revenuecontroller.address}"
  // */

  // let data = JSON.stringify(config);
  // fs.writeFileSync('config.js', JSON.parse(data));
}

async function saveContractABI(contract, contractArtifact) {
  const fs = require("fs");
  const abiDir = __dirname + "/../../app/src/abi";

  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir);
  }

  const artifact = JSON.stringify(artifacts.readArtifactSync(contractArtifact).abi);
  const contractABI = `export const ${contract}ABI = ${artifact}`;

  fs.writeFileSync(
    abiDir + "/" + contract + ".ts",
    contractABI
  );
}

async function grantRoles(rewards, vault) {
  const REWARDS = await vault.REWARDS();
  const MINTER_ROLE = await rewards.MINTER_ROLE();

  // get capl contract
  const CAPL = await hre.ethers.getContractFactory('CreditCapitalPlatformToken');
  const capl = await CAPL.attach(process.env.CAPL_ADDRESS_KOVAN);

  await vault.grantRole(REWARDS, rewards.address);
  await capl.grantRole(MINTER_ROLE, rewards.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
