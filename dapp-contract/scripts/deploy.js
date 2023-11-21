const { ethers, artifacts } = require("hardhat");
const fs = require("fs/promises");
const path = require("path");

async function main() {
  const contract = await ethers.deployContract("SupplyChainDApp");
  await contract.waitForDeployment();

  const deploymentInfo = await getDeploymentInfo(contract);

  const contractPart2 = await ethers.deployContract("SupplyChainDappPart2", [deploymentInfo.address]);
  await contractPart2.waitForDeployment();

  const deploymentInfoPart2 = await getDeploymentInfo(contractPart2);

  console.log({
    contractName: deploymentInfo.contractName,
    address: deploymentInfo.address,
    owner: deploymentInfo.owner,
  });

  console.log("\n", {
    contractName: deploymentInfoPart2.contractName,
    address: deploymentInfoPart2.address,
    owner: deploymentInfoPart2.owner,
  });

  saveToFile(deploymentInfo);

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
  const artifact = await artifacts.readArtifact("SupplyChainDApp");
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

async function saveToFile(deploymentInfo) {
  // To frontend
  await fs.writeFile(
    path.resolve("../dapp-web/contract-abis/contract-info.json"),
    JSON.stringify(
      {
        contractName: deploymentInfo.contractName,
        abi: deploymentInfo.abi.full,
        humanReadableAbi: deploymentInfo.abi.humanReadableAbi,
        humanReadableAbiMinified: deploymentInfo.abi.humanReadableAbiMinified,
        address: deploymentInfo.address,
      },
      null,
      4
    ),
    {
      encoding: "utf-8",
    }
  );

  // To deploy-info
  const deployInfoFileName = deploymentInfo.network ? `deploy-info.${deploymentInfo.network}.json` : "deploy-info.json";
  const deployInfoFilePath = path.resolve(`./deploys/${deployInfoFileName}`);

  await fs.access("deploys").catch(async () => {
    console.log('Folder "deploys" does not exist. Creating it...');
    await fs.mkdir("deploys").catch(console.error);
  });

  let deployInfo;
  try {
    const file = JSON.parse(await fs.readFile(deployInfoFilePath, "utf8"));
    if (!Array.isArray(file)) {
      await fs.copyFile(deployInfoFilePath, deployInfoFilePath + ".bak");
      throw new Error(`${deployInfoFileName} is not an array`);
    }
    deployInfo = [...file, deploymentInfo];
  } catch (error) {
    deployInfo = [deploymentInfo];
    console.log(`${deployInfoFileName} does not exist, creating it.`);
  }

  // Add BigInt.prototype.toJSON to JSON.stringify support big numbers
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };
  await fs.writeFile(deployInfoFilePath, JSON.stringify(deployInfo, null, 4), {
    encoding: "utf-8",
  });
}
