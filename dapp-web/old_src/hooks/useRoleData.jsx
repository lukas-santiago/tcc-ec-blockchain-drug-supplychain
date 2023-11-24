import { useContractRead } from "wagmi";
import React from "react";
import contractInfo from "../../contract-abis/contract-info.json";

export function useRoleData(address) {
  const [roles, setRoles] = React.useState({});
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
      setRoles((prev) => ({ ...prev, OWNER: data }));
    },
    enabled: Boolean(address),
  });
  useContractRead({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "hasRole",
    args: [availableRoles.COMPANY, address],
    onSuccess: (data) => {
      setRoles((prev) => ({ ...prev, COMPANY: data }));
    },
    enabled: Boolean(address),
  });
  useContractRead({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "hasRole",
    args: [availableRoles.OPERATOR, address],
    onSuccess: (data) => {
      setRoles((prev) => ({ ...prev, OPERATOR: data }));
    },
    enabled: Boolean(address),
  });

  return roles;
}
