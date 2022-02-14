const hre = require("hardhat");
const fs = require('fs');

async function main() {
  /**
   * Standard contracts - Rewards, Vault
   */
  const Vault = await hre.ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(process.env.LP_ADDRESS_KOVAN, 10);
  await vault.deployed();
  console.log("vault deployed to:", vault.address);
  await saveContractABI("vault", "Vault");

  const Rewards = await hre.ethers.getContractFactory("Rewards");
  const rewards = await Rewards.deploy(vault.address, process.env.CAPL_ADDRESS_KOVAN);
  await rewards.deployed();
  console.log("rewards deployed to:", rewards.address);
  await saveContractABI("rewards", "Rewards");

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

  // save deployed address in config file
  let config = `
  export const vaultcontractaddress = "${vault.address}"
  export const rewardscontractaddress = "${rewards.address}"
  `
  /*
    export const treasurystorage = "${treasurystorage.address}"
  export const revenuecontroller = "${revenuecontroller.address}"
  */

  let data = JSON.stringify(config);
  fs.writeFileSync('config.js', JSON.parse(data));
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

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
