const hre = require("hardhat");
const fs = require('fs');

const VAULT_ADDRESS="0xBA12222222228d8Ba445958a75a0704d566BF2C8"
const USDC_CAPL_POOL_ID = "0x270c10cb22cf7dfcbb6435b9a0886bd05e5818e9000200000000000000000624";
const USDC_ADDRESS = "0xc2569dd7d0fd715b054fbf16e75b001e5c0c1115";

async function main() {
  /**
   * Standard contracts - Rewards, Vault
   */
  const Vault = await hre.ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(process.env.LP_ADDRESS_KOVAN, BigInt(5000 / (24 * 60 * 60) * (10 ** 18)));
  await vault.deployed();
  console.log("vault deployed to:", vault.address);
  await saveContractABI("vault", "Vault");

  const Rewards = await hre.ethers.getContractFactory("Rewards");
  const rewards = await Rewards.deploy(vault.address, process.env.CAPL_ADDRESS_KOVAN);
  await rewards.deployed();
  console.log("rewards deployed to:", rewards.address);
  await saveContractABI("rewards", "Rewards");

  /**
   * Balancer swap contract
   */
  const Swap = await hre.ethers.getContractFactory("SwapAndBurnUSDCtoCAPL");
  const swap = await Swap.deploy(process.env.CAPL_ADDRESS_KOVAN, USDC_ADDRESS, VAULT_ADDRESS, USDC_CAPL_POOL_ID);
  await swap.deployed();
  console.log("swap deployed to:", swap.address);
  await saveContractABI("swapAndBurnUSDCtoCAPL", "SwapAndBurnUSDCtoCAPL");

  /**
   * Treasury contracts - TreasuryController, Treasury Storage 
  */
  const TreasuryStorage = await hre.ethers.getContractFactory("TreasuryStorage");
  const treasurystorage = await TreasuryStorage.deploy();
  await treasurystorage.deployed();
  console.log("treasurystorage deployed to:", treasurystorage.address);
  await saveContractABI("treasurystorage", "TreasuryStorage");
 
  const TreasuryController = await hre.ethers.getContractFactory("TreasuryController");
  const treasuryController = await TreasuryController.deploy(treasurystorage.address);
  await treasuryController.deployed();
  console.log("treasuryController deployed to:", treasuryController.address);
  await saveContractABI("treasuryController", "TreasuryController");

  /**
   * NFT contracts - CCAssets, NFTRevenueController
   */
  const CCAssets = await hre.ethers.getContractFactory("CCAssets");
  const ccAssets = await CCAssets.deploy();
  await ccAssets.deployed();
  console.log("ccAssets deployed to:", ccAssets.address);
  await saveContractABI("ccAssets", "CCAssets");

  const NFTRevenueController = await hre.ethers.getContractFactory("NFTRevenueController");
  const nftRevenueController = await NFTRevenueController.deploy(ccAssets.address, 0, swap.address, USDC_ADDRESS, process.env.CAPL_ADDRESS_KOVAN, treasuryController.address);
  await nftRevenueController.deployed();
  console.log("nftRevenueController deployed to:", nftRevenueController.address);
  await saveContractABI("nftRevenueController", "NFTRevenueController");

  /**
   * Grant roles
   */
  // await grantRoles(rewards, vault);
  
  // save deployed address in config file
  let config = `
  export const vault = "${vault.address}"
  export const rewards = "${rewards.address}"
  `
  // export const swap = "${swap.address}"
  // export const treasurystorage = "${treasurystorage.address}"
  // export const treasuryController = "${treasuryController.address}"
  // export const ccAssets = "${ccAssets.address}"
  // export const nftRevenueController = "${nftRevenueController.address}"

  let data = JSON.stringify(config);
  fs.writeFileSync('config.js', JSON.parse(data));
}

async function saveContractABI(contract, contractArtifact) {
  const fs = require("fs");
  const abiDir = __dirname + "/../../app/src/abi";

  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir);
  }

  const artifact = JSON.stringify(artifacts.readArtifactSync(contractArtifact).abi, null, 2);
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
