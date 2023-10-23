require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  settings: {
    optimizer: {
      enabled: true,
      runs: 1000000,
    },
  },
  mocha: {
    timeout: 90000,
  },
  networks: {
    hardhat: {
      initialBaseFeePerGas: 0,
      blockGasLimit: 18800000,
    },
    polygon_testnet: {
      url: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [`0x` + process.env.PRIVATE_KEY],
      gasPrice: 1000,
      saveDeployments: true,
      deploy: ["scripts/"],
    },
    // palm_mainnet: {
    //   url: `https://palm-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    //   accounts: [`0x` + process.env.PRIVATE_KEY],
    //   gasPrice: 1000,
    //   saveDeployments: true,
    //   deploy: ["scripts/"],
    // },
  },
  namedAccounts: {
    deployer: 0
  },
};
