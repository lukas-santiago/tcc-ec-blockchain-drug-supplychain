import { PropTypes } from "prop-types";
import { polygonMumbai } from "viem/chains";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

const { publicClient } = configureChains([polygonMumbai], [publicProvider()]);

const wagmiConfig = createConfig({
  autoConnect: true,
  publicClient,
});

export function Web3ConfigPublic({ children }) {
  return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>;
}

Web3ConfigPublic.propTypes = {
  children: PropTypes.node,
};

console._error = console.error;
console.error = function (...args) {
  //debugger;
  if (args[0].name == "ChainDoesNotSupportContract") return;
  console._error(...args);
};
