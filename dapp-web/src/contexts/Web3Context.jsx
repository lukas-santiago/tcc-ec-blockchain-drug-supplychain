import React, { createContext, useMemo } from "react";
import { PropTypes } from "prop-types";

export const Web3Context = createContext({
  web3Data: {},
  setWeb3Data: () => {},
});

export function Web3Provider({ children }) {
  const [web3Data, setWeb3Data] = React.useState({});
  const value = useMemo(() => ({ web3Data, setWeb3Data }), [web3Data]);

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

Web3Provider.propTypes = {
  children: PropTypes.node,
};
