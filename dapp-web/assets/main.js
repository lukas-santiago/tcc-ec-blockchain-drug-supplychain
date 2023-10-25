import './style.scss'
import { Contract, ethers } from "ethers";
import contractInfo from '../contract-info.json'

document.querySelector('#app').innerHTML = `
  <div>
    <h1>Hello Vite!</h1>
  </div>
`

async function main() {
  console.log("main")
  etherInitialize(ethers)
}

async function etherInitialize() {
  let signer = null;
  let provider;

  if (window.ethereum == null) {
    console.log("MetaMask not installed; using read-only defaults")
    provider = ethers.getDefaultProvider()

  } else {
    provider = new ethers.BrowserProvider(window.ethereum)
    signer = await provider.getSigner();

    // const provider = new ethers.JsonRpcProvider('https://polygon-mumbai.infura.io/v3/be0e5dcdfe2b4a0187752ac184c5137f')
    // const signer = provider.getSigner()
  }

  // let blockNumber = await provider.getBlockNumber()

  // let balance = await provider.getBalance(signer.address)
  // console.log({
  //   address: signer.address,
  //   blockNumber,
  //   balance: {
  //     raw: balance,
  //     value: ethers.formatEther(balance) + " ETH"
  //   }
  // })

  // console.log(contractInfo.abi)


  const contract = new Contract(contractInfo.address, contractInfo.abi, provider)
  console.log('address', await contract.getAddress())
  const value = await contract.getValue()
  console.log('value', value, ethers.toUtf8String(value))

  window['contract'] = contract
  window['ethers'] = ethers
}

/**
 * Initializes a connection to a contract using the provided provider.
 *
 * @param {ethers.Provider} provider - The provider to use for the connection.
 */
async function contract(provider) {
  const contractAddress = "dai.tokens.ethers.eth";
  const contractAbi = [];
  const ContractConnection = new ethers.Contract(contractAddress, contractAbi, provider);
}

main()