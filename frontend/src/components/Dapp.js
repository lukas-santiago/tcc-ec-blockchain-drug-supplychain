import React, { useEffect, useState } from "react";

// We'll use ethers to interact with the Ethereum network and our contract
import { ethers } from "ethers";

// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import TokenArtifact from "../contracts/Token.json";
import contractAddress from "../contracts/contract-address.json";

// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
import { Transfer } from "./Transfer";
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";
import { NoTokensMessage } from "./NoTokensMessage";

// This is the default id used by the Hardhat Network
const HARDHAT_NETWORK_ID = '31337';

// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

export function Dapp() {
  const [state, setState] = useState({
    tokenData: undefined,
    selectedAddress: undefined,
    balance: undefined,
    txBeingSent: undefined,
    transactionError: undefined,
    networkError: undefined,
  });
  const [provider, setProvider] = useState();
  const [token, setToken] = useState();
  const [pollDataInterval, setPollDataInterval] = useState();
  const [, set] = useState();

  useEffect(() => {

    return () => {
      _stopPollingData();
    };

  }, []);

  async function _connectWallet() {
    const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    _checkNetwork();
    _initialize(selectedAddress);
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      _stopPollingData();
      if (newAddress === undefined) {
        return _resetState();
      }
      _initialize(newAddress);
    });
  }

  function _initialize(userAddress) {
    setState({
      ...state,
      selectedAddress: userAddress,
    });
    _initializeEthers();
    _getTokenData();
    _startPollingData();
  }

  async function _initializeEthers() {
    setProvider(new ethers.providers.Web3Provider(window.ethereum));
    setToken(new ethers.Contract(
      contractAddress.Token,
      TokenArtifact.abi,
      provider.getSigner(0)
    ));
  }

  function _startPollingData() {
    setPollDataInterval(setInterval(() => _updateBalance(), 1000));
    _updateBalance();
  }

  const _stopPollingData = () => {
    clearInterval(pollDataInterval);
    setPollDataInterval(undefined)
  }
  async function _getTokenData() {
    const name = await token.name();
    const symbol = await token.symbol();

    setState({ ...state, tokenData: { name, symbol } });
  }

  async function _updateBalance() {
    const balance = await token.balanceOf(state.selectedAddress);
    setState({ ...state, balance });
  }

  async function _transferTokens(to, amount) {
    // Sending a transaction is a complex operation:
    //   - The user can reject it
    //   - It can fail before reaching the ethereum network (i.e. if the user
    //     doesn't have ETH for paying for the tx's gas)
    //   - It has to be mined, so it isn't immediately confirmed.
    //     Note that some testing networks, like Hardhat Network, do mine
    //     transactions immediately, but your dapp should be prepared for
    //     other networks.
    //   - It can fail once mined.
    //
    // This method handles all of those things, so keep reading to learn how to
    // do it.

    try {
      // If a transaction fails, we save that error in the component's state.
      // We only save one such error, so before sending a second transaction, we
      // clear it.
      _dismissTransactionError();

      // We send the transaction, and save its hash in the Dapp's state. This
      // way we can indicate that we are waiting for it to be mined.
      const tx = await token.transfer(to, amount);
      setState({ ...state, txBeingSent: tx.hash });

      // We use .wait() to wait for the transaction to be mined. This method
      // returns the transaction's receipt.
      const receipt = await tx.wait();

      // The receipt, contains a status flag, which is 0 to indicate an error.
      if (receipt.status === 0) {
        // We can't know the exact error that made the transaction fail when it
        // was mined, so we throw this generic one.
        throw new Error("Transaction failed");
      }

      // If we got here, the transaction was successful, so you may want to
      // update your state. Here, we update the user's balance.
      await _updateBalance();
    } catch (error) {
      // We check the error code to see if this error was produced because the
      // user rejected a tx. If that's the case, we do nothing.
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }

      // Other errors are logged and stored in the Dapp's state. This is used to
      // show them to the user, and for debugging.
      console.error(error);
      setState({ ...state, transactionError: error });
    } finally {
      // If we leave the try/catch, we aren't sending a tx anymore, so we clear
      // this part of the state.
      setState({ ...state, txBeingSent: undefined });
    }
  }

  function _dismissTransactionError() {
    setState({ ...state, transactionError: undefined });
  }

  function _dismissNetworkError() {
    setState({ ...state, networkError: undefined });
  }

  function _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }
  function _resetState() {
    setState({
      tokenData: undefined,
      selectedAddress: undefined,
      balance: undefined,
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
    });
  }

  async function _switchChain() {
    const chainIdHex = `0x${HARDHAT_NETWORK_ID.toString(16)}`
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
    await _initialize(state.selectedAddress);
  }

  // This method checks if the selected network is Localhost:8545
  function _checkNetwork() {
    if (window.ethereum.networkVersion !== HARDHAT_NETWORK_ID) {
      _switchChain();
    }
  }

  if (window.ethereum === undefined) {
    return <NoWalletDetected />;
  }

  if (!state.selectedAddress) {
    return (
      <ConnectWallet
        connectWallet={() => _connectWallet()}
        networkError={state.networkError}
        dismiss={() => _dismissNetworkError()}
      />
    );
  }

  if (!state.tokenData || !state.balance) {
    return <Loading />;
  }

  return (
    <div className="container p-4">
      <div className="row">
        <div className="col-12">
          <h1>
            {state.tokenData.name} ({state.tokenData.symbol})
          </h1>
          <p>
            Welcome <b>{state.selectedAddress}</b>, you have{" "}
            <b>
              {state.balance.toString()} {state.tokenData.symbol}
            </b>
            .
          </p>
        </div>
      </div>

      <hr />

      <div className="row">
        <div className="col-12">
          {/* 
            Sending a transaction isn't an immediate action. You have to wait
            for it to be mined.
            If we are waiting for one, we show a message here.
          */}
          {state.txBeingSent && (
            <WaitingForTransactionMessage txHash={state.txBeingSent} />
          )}

          {/* 
            Sending a transaction can fail in multiple ways. 
            If that happened, we show a message here.
          */}
          {state.transactionError && (
            <TransactionErrorMessage
              message={_getRpcErrorMessage(state.transactionError)}
              dismiss={() => _dismissTransactionError()}
            />
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          {/*
            If the user has no tokens, we don't show the Transfer form
          */}
          {state.balance.eq(0) && (
            <NoTokensMessage selectedAddress={state.selectedAddress} />
          )}

          {/*
            This component displays a form that the user can use to send a 
            transaction and transfer some tokens.
            The component doesn't have logic, it just calls the transferTokens
            callback.
          */}
          {state.balance.gt(0) && (
            <Transfer
              transferTokens={(to, amount) =>
                _transferTokens(to, amount)
              }
              tokenSymbol={state.tokenData.symbol}
            />
          )}
        </div>
      </div>
    </div>
  )

};
