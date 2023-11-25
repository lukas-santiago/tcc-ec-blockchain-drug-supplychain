import PropTypes from "prop-types";

import { useAccount, useContractEvent, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";

import { useDebounce } from "@uidotdev/usehooks";
import React from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { stringToHex } from "viem";
import contractInfo from "../../contract-abis/contract-info.json";

export function ElevatePermissionsModal({ show, handleClose }) {
  const { address } = useAccount();
  const [addressInput, setAddressInput] = React.useState("");
  const debouncedAddress = useDebounce(addressInput);

  const companyRole = stringToHex("COMPANY", { size: 32 });

  const { config, error } = usePrepareContractWrite({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "grantRole",
    args: [companyRole, debouncedAddress],
    enabled: Boolean(debouncedAddress),
  });

  const { data, write } = useContractWrite(config);

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
        handleClose();
        window.location.reload();
      }
    },
  });

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton onClick={handleClose}>
        <Modal.Title>Elevar permissões</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

ElevatePermissionsModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};
