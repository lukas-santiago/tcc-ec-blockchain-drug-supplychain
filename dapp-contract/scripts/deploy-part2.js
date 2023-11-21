const { ethers, artifacts } = require("hardhat");
const fs = require("fs/promises");
const path = require("path");

async function main() {
  const contractPart2 = await ethers.deployContract("SupplyChainDappPart2", [
    "0x60AF19508EfFaB52eA2C1279724591A9b6b79713",
  ]);
  await contractPart2.waitForDeployment();

  const deploymentInfoPart2 = await getDeploymentInfo(contractPart2);

  console.log({
    contractName: deploymentInfoPart2.contractName,
    address: deploymentInfoPart2.address,
    owner: deploymentInfoPart2.owner,
  });

  await fs.writeFile(
    path.resolve("../dapp-web/contract-abis/contract-info-part2.json"),
    JSON.stringify(
      {
        contractName: deploymentInfoPart2.contractName,
        abi: deploymentInfoPart2.abi.full,
        humanReadableAbi: deploymentInfoPart2.abi.humanReadableAbi,
        humanReadableAbiMinified: deploymentInfoPart2.abi.humanReadableAbiMinified,
        address: deploymentInfoPart2.address,
      },
      null,
      4
    ),
    {
      encoding: "utf-8",
    }
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function getDeploymentInfo(contract) {
  const artifact = await artifacts.readArtifact("SupplyChainDappPart2");
  const humanReadableAbi = new ethers.Interface(artifact.abi).format(false);
  const humanReadableAbiMinified = new ethers.Interface(artifact.abi).format(true);

  const {
    accessList,
    blockNumber,
    blockHash,
    chainId,
    from,
    gasLimit,
    gasPrice,
    hash,
    maxFeePerGas,
    maxPriorityFeePerGas,
    signature,
    to,
    index,
    type,
    value,
  } = contract.deploymentTransaction();

  const deploymentInfo = {
    contractName: artifact.contractName,
    address: contract.target,
    owner: contract.runner.address,
    abi: {
      full: artifact.abi,
      humanReadableAbi,
      humanReadableAbiMinified,
    },
    deploymentTransaction: {
      accessList,
      blockNumber,
      blockHash,
      chainId,
      from,
      gasLimit,
      gasPrice,
      hash,
      maxFeePerGas,
      maxPriorityFeePerGas,
      signature,
      to,
      index,
      type,
      value,
    },
    network: (await contract.runner.provider.getNetwork()).name,
    deployed_at: new Date().toISOString(),
  };
  return deploymentInfo;
}
