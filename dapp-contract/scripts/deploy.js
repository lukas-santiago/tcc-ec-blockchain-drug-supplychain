const hre = require("hardhat");

async function main() {
  const contract = await hre.ethers.deployContract("dApp", [], {});
  await contract.waitForDeployment();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
