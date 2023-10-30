import 'dotenv/config'
import '@typechain/hardhat'
import '@nomicfoundation/hardhat-ethers'
import '@nomicfoundation/hardhat-chai-matchers'
import '@nomicfoundation/hardhat-network-helpers'

/** @type import('hardhat/config').HardhatUserConfig */
export default {
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
      saveDeployments: true,
      deploy: ["scripts/deploy.js"],
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
  typechain: {
    outDir: 'types',
    target: 'ethers-v6',
    alwaysGenerateOverloads: false, // should overloads with full signatures like deposit(uint256) be generated always, even if there are no overloads?
    externalArtifacts: ['externalArtifacts/*.json'], // optional array of glob patterns with external artifacts to process (for example external libs from node_modules)
    dontOverrideCompile: false // defaults to false
  },
}
