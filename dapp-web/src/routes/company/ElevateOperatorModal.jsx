import { useDebounce } from "@uidotdev/usehooks";
import { PropTypes } from "prop-types";
import React from "react";
import { Button, Form, FormSelect, Modal } from "react-bootstrap";
import { hexToString, stringToHex } from "viem";
import {
  useAccount,
  useContractEvent,
  useContractInfiniteReads,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import contractInfo from "../../../contract-abis/contract-info.json";

export function ElevateOperatorModal({ show, handleClose }) {
  const { address } = useAccount();
  const [addressInput, setAddressInput] = React.useState("");
  const debouncedAddress = useDebounce(addressInput, 500);
  const [selectedCompanyId, setSelectedCompanyId] = React.useState("");

  const operatorRole = stringToHex("OPERATOR", { size: 32 });

  const { data, write } = useContractWrite({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "grantOperatorRole",
    args: [selectedCompanyId, debouncedAddress, address],
    enabled: Boolean(debouncedAddress) && Boolean(selectedCompanyId),
  });

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const unwatch = useContractEvent({
    address: contractInfo.address,
    abi: contractInfo.abi,
    eventName: "RoleGranted",
    args: [operatorRole, address],
    listener: (event) => {
      console.log(event);
      if (event[0]?.args?.account === address) {
        unwatch?.();
        handleClose();
      }
    },
  });

  const [user, setUser] = React.useState(null);

  useContractRead({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "me",
    args: [address],
    onSuccess: (data) => setUser(data),
  });

  const { data: data2 } = useContractInfiniteReads({
    cacheKey: "companies",
    contracts() {
      return user.companyIds.map((company) => ({
        address: contractInfo.address,
        abi: contractInfo.abi,
        functionName: "companies",
        args: [company],
      }));
    },
    enabled: Boolean(user),
  });

  console.log({ user, data2 });

  const companiesRows = data2?.pages[0]?.map(({ result: company }) => ({
    id: company[0],
    name: hexToString(company[1], { size: 32 }),
    isManufacture: company[2],
    isIntermediate: company[3],
    active: company[4],
  }));

  React.useEffect(() => {
    if (user) {
      setSelectedCompanyId(user.companyIds[0]);
    }
  }, [user]);

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton onClose={handleClose}>
        <Modal.Title>Elevar permissões a operadores</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Selecione o endereço do cargo que deseja atribuir.</p>
        <Form>
          <Form.Label>Selecione uma empresa</Form.Label>
          <FormSelect value={selectedCompanyId} onChange={(e) => setSelectedCompanyId(Number(e.target.value))}>
            {companiesRows.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </FormSelect>
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
          <Button
            variant="danger"
            disabled={(!selectedCompanyId && !write) || isLoading || isSuccess}
            onClick={() => {
              console.log({
                selectedCompanyId,
                addressInput,
                address,
              });
              write?.();
            }}
          >
            {isLoading ? "Carregando..." : "OPERATOR_ROLE"}
          </Button>
          {/* {error && (
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
          )} */}
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
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

ElevateOperatorModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};
