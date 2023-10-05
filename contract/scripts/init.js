require('dotenv').config()
const helpers = require("@nomicfoundation/hardhat-network-helpers");

async function init() {
  const address = process.env.ADDRESS;

  await helpers.setBalance(address, 1000 * 1e18);
}

init()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });