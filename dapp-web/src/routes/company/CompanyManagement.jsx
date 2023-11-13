import PropTypes from "prop-types";
import React from "react";
import { Button, Form, Modal, Table } from "react-bootstrap";
import { encodeAbiParameters, stringToHex } from "viem";
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from "wagmi";
import contractInfo from "../../../contract-abis/contract-info.json";

export function CompanyManagement() {
  const { address } = useAccount();
  const [user, setUser] = React.useState(null);

  const [show, setShow] = React.useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

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
      <div>
        <p>Seu cargo: {user}</p>
      </div>
      <hr />
      <div className="d-flex justify-content-end">
        <Button variant="primary" onClick={handleShow}>
          Criar Companhia
        </Button>
        <CompanyModalForm show={show} handleClose={handleClose} />
      </div>
      <Table responsive>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Ativa</th>
          </tr>
        </thead>
        <tbody></tbody>
      </Table>
    </div>
  );
}

function CompanyModalForm({ show, handleClose, defaultValues }) {
  const [companyName, setCompanyName] = React.useState(defaultValues?.companyName || "");
  const [isManufacture, setIsManufacture] = React.useState(defaultValues?.isManufacture || false);
  const [isIntermediate, setIsIntermediate] = React.useState(defaultValues?.isIntermediate || false);
  const [isEndPoint, setIsEndPoint] = React.useState(defaultValues?.isEndPoint || false);

  const { config, error } = usePrepareContractWrite({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "addCompany",
    //encodeAbiParameters(contractInfo.abi.find(({ name }) => name === "addCompany").inputs, [
    args: [
      // {
      //   name: stringToHex(companyName, { size: 32 }),
      //   companyType: {
      //     isManufacture,
      //     isIntermediate,
      //     isEndPoint,
      //   },
      // },
    ],
    //]),
  });

  const { write } = useContractWrite(config);
  if (error) {
    console.log(error);
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Criar Companhia</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Label>Nome da Companhia</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nome da Companhia"
            onChange={(e) => setCompanyName(e.target.value)}
            value={companyName}
          />

          {/* Switches isManufacture, isIntermediate, isEndPoint */}
          <Form.Group className="mt-3 d-flex gap-3 flex-wrap">
            <Form.Switch
              checked={isManufacture}
              onChange={(e) => setIsManufacture(e.target.checked)}
              id="isManufacture"
              label="Fabricante"
            />
            <Form.Switch
              checked={isIntermediate}
              onChange={(e) => setIsIntermediate(e.target.checked)}
              id="isIntermediate"
              label="Intermediário"
            />
            <Form.Switch
              checked={isEndPoint}
              onChange={(e) => setIsEndPoint(e.target.checked)}
              id="isEndPoint"
              label="Ponto de Destino"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            write?.();
            console.log({ companyName, isManufacture, isIntermediate, isEndPoint });
          }}
        >
          Criar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

CompanyModalForm.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  defaultValues: PropTypes.shape({
    companyName: PropTypes.string,
    isManufacture: PropTypes.bool,
    isIntermediate: PropTypes.bool,
    isEndPoint: PropTypes.bool,
  }),
};
