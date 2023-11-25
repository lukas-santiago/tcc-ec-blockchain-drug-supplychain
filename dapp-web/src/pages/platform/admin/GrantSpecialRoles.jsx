import { useDebounce } from "@uidotdev/usehooks";
import React from "react";
import { Button, Form } from "react-bootstrap";
import { stringToHex } from "viem";
import { useAccount, useContractEvent, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import contractInfo from "../../../../contract-abis/contract-info.json";
import { LoadingButton } from "../../../components/LoadingButton";

export function GrantSpecialRoles() {
  const { address } = useAccount();
  const [addressInput, setAddressInput] = React.useState("");
  const debouncedAddress = useDebounce(addressInput);

  const companyRole = stringToHex("COMPANY", { size: 32 });

  const {
    config,
    error,
    isLoading: isPrepareLoading,
  } = usePrepareContractWrite({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "grantRole",
    args: [companyRole, debouncedAddress],
    enabled: Boolean(debouncedAddress),
  });

  const { data, write, isLoading: isWriteLoading } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const unwatch = useContractEvent({
    address: contractInfo.address,
    abi: contractInfo.abi,
    eventName: "RoleGranted",
    args: [companyRole, address],
    listener: (event) => {
      console.log(event);
      if (event[0]?.args?.account === address) {
        unwatch?.();
        window.location.reload();
      }
    },
  });

  return (
    <>
      <h1 className="mb-4">Conceder funções especiais</h1>
      <p>Selecione o endereço do cargo que deseja atribuir.</p>
      <Form>
        <Form.Label>Endereço da carteira</Form.Label>
        <Form.Control
          type="text"
          placeholder="Ex: 0x0000..."
          aria-label="Ex: 0x0000..."
          value={addressInput}
          onChange={(e) => setAddressInput(e.target.value)}
        />
        <br />
        <p>Escolha o cargo que deseja atribuir abaixo:</p>

        <Button variant="danger" disabled={!write || isLoading || isSuccess} onClick={() => write?.()}>
          {isLoading ? "Carregando..." : "COMPANY_ROLE"}
        </Button>
        {/* <LoadingButton
          isLoading={isLoading || isWriteLoading || isPrepareLoading}
          loadingElement={<Button variant="danger">COMPANY_ROLE</Button>}
        ></LoadingButton> */}
        {error && (
          <>
            <hr />
            <div
              style={{
                wordWrap: "break-word",
              }}
            >
              <p>Erro ao processar</p>
              <p>{error?.message?.split("Details: ")[1] || error?.message}</p>
            </div>
          </>
        )}
        {isSuccess && (
          <>
            <hr />
            <div>
              Transação concluída com sucesso.
              <div>
                <a href={`https://mumbai.polygonscan.com/tx/${data?.hash}`}>Ver transação na Mumbai Polygonscan</a>
              </div>
            </div>
          </>
        )}
      </Form>
    </>
  );
}
