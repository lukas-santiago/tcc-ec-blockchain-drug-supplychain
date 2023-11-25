import React from "react";
import {
  useContractEvent,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import contractInfo from "../../contract-abis/contract-info.json";
import { Web3Context } from "../contexts/Web3Context";

export function useUserFetcher(address) {
  const { web3Data, setWeb3Data } = React.useContext(Web3Context);

  const { data, refetch: refetchIsRegistered } = useContractRead({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "users",
    args: [address],
    enabled: Boolean(!web3Data.user?.isUser),
  });

  const isRegistered = data?.[0];

  const prepare = usePrepareContractWrite({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "register",
    enabled: Boolean(!web3Data.user?.isUser && !isRegistered),
  });
  const write = useContractWrite(prepare.config);

  const wait = useWaitForTransaction({
    hash: write?.data?.hash,
    enabled: Boolean(write?.data?.hash),
    onSuccess: () => {
      refetchIsRegistered();
    },
  });

  const unwatch = useContractEvent({
    address: contractInfo.address,
    abi: contractInfo.abi,
    eventName: "UserRegistered",
    args: [address],
    listener: (event) => {
      if (event[0]?.args.user === address) {
        unwatch?.();
        refetchIsRegistered();
      }
    },
  });

  React.useEffect(() => {
    if (isRegistered !== web3Data.user?.isUser) {
      setWeb3Data((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          isRegistered,
          refetchIsRegistered,
        },
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRegistered]);

  return {
    isRegistered: web3Data.user?.isRegistered,
    registerContract: {
      prepare,
      write,
      wait,
    },
  };
}
