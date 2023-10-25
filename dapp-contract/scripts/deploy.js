const { ethers, artifacts } = require("hardhat");
const fs = require('fs/promises')
const path = require('path')

async function main() {

  const artifact = await artifacts.readArtifact('dApp')
  console.log({ contractName: artifact.contractName })

  const contract = await ethers.deployContract("dApp")
  await contract.waitForDeployment()

  const address = await contract.getAddress()
  console.log({ address })

  const humanReadableAbi = new ethers.Interface(artifact.abi).format(false)

  saveToFile(artifact.contractName, artifact.abi, address)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function saveToFile(contractName, abi, address) {
  await fs.writeFile(path.resolve('../dapp-web/contract-info.json'), JSON.stringify({
    contractName,
    abi,
    address
  }, null, 4), {
    encoding: 'utf-8',
  })
}
