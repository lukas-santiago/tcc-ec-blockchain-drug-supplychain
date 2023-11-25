import { useContractRead } from "wagmi";
import React from "react";
import contractInfo from "../../contract-abis/contract-info.json";
import { Web3Context } from "../contexts/Web3Context";

export function useRoleData(address) {
  const { web3Data, setWeb3Data } = React.useContext(Web3Context);

  const roles = web3Data?.user?.roles || {};
  const setRoles = (data) =>
    setWeb3Data({ ...web3Data, user: { ...web3Data.user, roles: { ...web3Data.user.roles, ...data } } });

  const availableRoles = {
    COMPANY: "0x434f4d50414e5900000000000000000000000000000000000000000000000000",
    OPERATOR: "0x4f50455241544f52000000000000000000000000000000000000000000000000",
    OWNER: "0x4f574e4552000000000000000000000000000000000000000000000000000000",
  };

  useContractRead({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "hasRole",
    args: [availableRoles.OWNER, address],
    onSuccess: (data) => {
      setRoles({ OWNER: data });
    },
    enabled: Boolean(address),
  });
  useContractRead({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "hasRole",
    args: [availableRoles.COMPANY, address],
    onSuccess: (data) => {
      setRoles({ COMPANY: data });
    },
    enabled: Boolean(address),
  });
  useContractRead({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "hasRole",
    args: [availableRoles.OPERATOR, address],
    onSuccess: (data) => {
      setRoles({ OPERATOR: data });
    },
    enabled: Boolean(address),
  });

  return roles;
}
