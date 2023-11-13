import { useAccount, useContractRead } from "wagmi";
import contractInfo from "../../../contract-abis/contract-info.json";
import React from "react";

export function CompanyManagement() {
  const { address } = useAccount();
  const [user, setUser] = React.useState(null);

  useContractRead({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "users",
    args: [address],
    onSuccess: (data) => setUser(data),
  });

  console.log(user);

  return (
    <div>
      <h2>Gestão de Companhia</h2>
      <hr />
      {user && (
        <div>
          <p>Seu cargo: {user}</p>
        </div>
      )}
    </div>
  );
}
