require("@nomiclabs/hardhat-waffle");
require("hardhat-interface-generator");
require('dotenv').config();

const privateKey = process.env.PRIVATE_KEY;
const infuraId = process.env.INFURA_ID;

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.11",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${infuraId}`,
      accounts: [privateKey]
    }
  },
};
