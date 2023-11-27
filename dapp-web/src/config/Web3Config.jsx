import { EIP6963Connector, createWeb3Modal, walletConnectProvider } from "@web3modal/wagmi";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { PropTypes } from "prop-types";
import { polygonMumbai } from "viem/chains";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";

const projectId = "9ef7f1e1ff7dec0aba278a7ba1f4171b";

const { chains, publicClient } = configureChains(
  [polygonMumbai],
  [
    infuraProvider({ apiKey: "1c2ccb427ffb4f29a9bcd78c87ea88e0" }),
    walletConnectProvider({ projectId }),
    publicProvider(),
  ]
);

const metadata = {
  name: "Supplychain DApp",
  description: "Supplychain DApp",
  url: "/platform", // your app's url
  icons: ["/vite.svg"], // your app's icon, no bigger than 1024x1024px (max. 1MB)
};

const connectors = [
  new WalletConnectConnector({ chains, options: { projectId, showQrModal: true, metadata } }),
  new EIP6963Connector({ chains }),
];

const connectKitConfig = getDefaultConfig({
  infuraId: "9ef7f1e1ff7dec0aba278a7ba1f4171b",
  chains: [polygonMumbai],
  walletConnectProjectId: projectId,
  appName: "Your App Name",
  appDescription: "Your App Description",
  appUrl: "https://family.co",
  appIcon: "https://family.co/logo.png",
});

// console.log({
//   getDefaultConfig: connectKitConfig,
//   supportedConnectors,
//   connectors,
// });

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: connectKitConfig.connectors.map((c, i) => (i == 1 ? connectors[1] : c)),
  publicClient,
});

createWeb3Modal({ wagmiConfig, projectId, chains });

export function Web3Config({ children }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <ConnectKitProvider
        theme="soft"
        customTheme={{
          "--ck-font-family": "'Open Sans', sans-serif",
        }}
        options={{
          language: "pt-BR",
        }}
      >
        {children}
      </ConnectKitProvider>
    </WagmiConfig>
  );
}

Web3Config.propTypes = {
  children: PropTypes.node,
};

console._error = console.error;
console.error = function (...args) {
  //debugger;
  if (args[0].name == "ChainDoesNotSupportContract") return;
  console._error(...args);
};
