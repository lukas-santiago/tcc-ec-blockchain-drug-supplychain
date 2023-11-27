import { useDebounce } from "@uidotdev/usehooks";
import PropTypes from "prop-types";
import React from "react";
import { Button, ButtonGroup, Form, Modal, Table } from "react-bootstrap";
import { hexToString, stringToHex } from "viem";
import {
  useAccount,
  useContractEvent,
  useContractInfiniteReads,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import contractInfo from "../../../../contract-abis/contract-info.json";
import { LoadingButton } from "../../../components/LoadingButton";

export function CompanyManagement() {
  const { address } = useAccount();
  const [user, setUser] = React.useState(null);

  const [show, setShow] = React.useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useContractRead({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "getUser",
    args: [address],
    onSuccess: (data) => setUser(data),
  });

  const { data } = useContractInfiniteReads({
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

  // useContractRead({
  //   address: contractInfo.address,
  //   abi: contractInfo.abi,
  //   functionName: "companies",
  //   args: [address],
  //   enabled: Boolean(user),
  // });
  console.log({ user, data });

  const companiesRows =
    data?.pages[0]?.map(({ result: company }) => ({
      id: company[0],
      name: hexToString(company[1], { size: 32 }),
      isManufacture: company[2],
      isIntermediate: company[3],
      active: company[4],
    })) || [];

  return (
    <div>
      <h1 className="mb-4">Companhia</h1>
      <div className="d-flex justify-content-end mb-4">
        <Button variant="primary" onClick={handleShow}>
          Criar Companhia
        </Button>
        <CompanyModalForm show={show} handleClose={handleClose} />
      </div>

      <Table responsive>
        <thead>
          <tr>
            <th>Nome</th>
            <th>É Fabricante</th>
            <th>É Intermediário</th>
            <th>Ativa</th>
            <th width={1}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {companiesRows.map((company, i) => (
            <TableRowData key={i} company={company} />
          ))}
        </tbody>
      </Table>
    </div>
  );
}

function CompanyModalForm({ show, handleClose, defaultValues }) {
  const { address } = useAccount();

  const [companyName, setCompanyName] = React.useState(defaultValues?.name || "");
  const [isManufacture, setIsManufacture] = React.useState(defaultValues?.isManufacture || false);
  const [isIntermediate, setIsIntermediate] = React.useState(defaultValues?.isIntermediate || false);
  // const [isEndPoint, setIsEndPoint] = React.useState(defaultValues?.isEndPoint || false);

  let method = "addCompany";
  let addCompanyArgsObject;

  if (defaultValues?.id) {
    method = "editCompany";
    let _addCompanyArgsObject = [
      {
        id: String(defaultValues?.id),
        name: stringToHex(companyName || "", { size: 32 }),
        isManufacture: !!isManufacture,
        isIntermediate: !!isIntermediate,
        active: true,
        productCatalogIds: [],
        lotIds: [],
      },
    ];

    addCompanyArgsObject = [Object.values(_addCompanyArgsObject[0])];
    console.log({ addCompanyArgsObject });
  } else {
    addCompanyArgsObject = {
      name: stringToHex(companyName || "", { size: 32 }),
      isManufacture: !!isManufacture,
      isIntermediate: !!isIntermediate,
    };
  }

  const { config, error } = usePrepareContractWrite({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: method,
    args: Object.values(addCompanyArgsObject),
  });

  const { write, isLoading: isWriteLoading, data } = useContractWrite(config);

  const { isLoading: isWaitLoading } = useWaitForTransaction({
    hash: data?.hash,
  });

  if (error) {
    console.log(error, defaultValues);
  }

  console.log({ isWriteLoading, isWaitLoading });

  const unwatch = useContractEvent({
    address: contractInfo.address,
    abi: contractInfo.abi,
    eventName: "CompanyRegistered",
    args: [address],
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
            {/* <Form.Switch
              checked={isEndPoint}
              onChange={(e) => setIsEndPoint(e.target.checked)}
              id="isEndPoint"
              label="Ponto de Destino"
            /> */}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <LoadingButton isLoading={isWriteLoading || isWaitLoading}>
          <Button
            variant="primary"
            disabled={write === undefined}
            onClick={() => {
              write?.();
              console.log({ companyName, isManufacture, isIntermediate, isWriteLoading, isWaitLoading, config });
            }}
          >
            Salvar
          </Button>
        </LoadingButton>
      </Modal.Footer>
    </Modal>
  );
}

CompanyModalForm.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  defaultValues: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    isManufacture: PropTypes.bool,
    isIntermediate: PropTypes.bool,
    isEndPoint: PropTypes.bool,
    active: PropTypes.bool,
  }),
};

function TableRowData({ company }) {
  let { name, isManufacture, isIntermediate, active } = company || {};

  const [showEditModal, setShowEditModal] = React.useState(false);

  const handleClose = () => setShowEditModal(false);
  const handleShow = () => setShowEditModal(true);

  const [showDisableModal, setShowDisableModal] = React.useState(false);

  const handleCloseDisable = () => setShowDisableModal(false);
  const handleShowDisable = () => setShowDisableModal(true);

  return (
    <tr>
      <td>{name}</td>
      <td>{isManufacture ? "Sim" : "Não"}</td>
      <td>{isIntermediate ? "Sim" : "Não"}</td>
      <td>{active ? "Sim" : "Não"}</td>
      <td>
        <ButtonGroup>
          <Button variant="primary" onClick={handleShow}>
            Editar
          </Button>
          <Button variant="danger" onClick={handleShowDisable} disabled={!active}>
            Desativar
          </Button>
        </ButtonGroup>
        {showEditModal && <CompanyModalForm show={showEditModal} handleClose={handleClose} defaultValues={company} />}
        {showDisableModal && (
          <DisableCompanyModal
            showDisableModal={showDisableModal}
            handleCloseDisable={handleCloseDisable}
            company={company}
          />
        )}
      </td>
    </tr>
  );
}

TableRowData.propTypes = {
  company: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    isManufacture: PropTypes.bool,
    isIntermediate: PropTypes.bool,
    isEndPoint: PropTypes.bool,
    active: PropTypes.bool,
  }),
};

function DisableCompanyModal({ showDisableModal, handleCloseDisable, company }) {
  const { config, error } = usePrepareContractWrite({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "disableCompany",
    args: [company.id],
    enabled: showDisableModal,
  });
  const _ = useDebounce(null, 1000);

  const { data, write, isLoading: isWriteLoading } = useContractWrite(config);

  const { isLoading, isSuccess, error2 } = useWaitForTransaction({
    hash: data?.hash,
  });

  React.useEffect(() => {
    console.log({ data, isLoading, isSuccess, error, error2, company, _ });
  }, [_, company, data, error, error2, isLoading, isSuccess]);

  return (
    <Modal show={showDisableModal} onHide={handleCloseDisable}>
      <Modal.Header closeButton onClose={handleCloseDisable}>
        <Modal.Title>Desativar Companhia</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Tem certeza que deseja desativar a companhia?</p>
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
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseDisable}>
          Cancelar
        </Button>
        <LoadingButton isLoading={isWriteLoading || isLoading} variant="danger">
          <Button
            variant="danger"
            onClick={() => {
              write();
            }}
          >
            Desativar
          </Button>
        </LoadingButton>
      </Modal.Footer>
    </Modal>
  );
}

DisableCompanyModal.propTypes = {
  showDisableModal: PropTypes.bool.isRequired,
  handleCloseDisable: PropTypes.func.isRequired,
  company: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    isManufacture: PropTypes.bool,
    isIntermediate: PropTypes.bool,
    isEndPoint: PropTypes.bool,
    active: PropTypes.bool,
  }),
};
