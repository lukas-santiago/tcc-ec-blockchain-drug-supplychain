import { PropTypes } from "prop-types";
import React from "react";
import { Alert, Button, ButtonGroup, Col, Form, FormSelect, Modal, Row, Spinner, Table } from "react-bootstrap";
import { hexToString } from "viem";
import {
  useAccount,
  useContractInfiniteReads,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import contractInfo from "../../../contract-abis/contract-info.json";
import { useDebounce } from "@uidotdev/usehooks";

export function LotManagement() {
  const { companiesRows } = useCompaniesFetcher();

  const [selectedCompany, setSelectedCompany] = React.useState(null);

  console.log({ companiesRows });
  const handleSelectCompany = (e) => {
    setSelectedCompany(companiesRows.find((company) => company.companyId === Number(e.target.value)));
  };

  const [show, setShow] = React.useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  if (!selectedCompany && companiesRows?.length > 0) {
    setSelectedCompany(companiesRows[0]);
  }

  return (
    <>
      <h1>Gerenciamento de Lotes</h1>
      <Form>
        <Col md={3}>
          <Form.Label>Escolha uma empresa</Form.Label>
          <FormSelect value={selectedCompany?.companyId || ""} onChange={handleSelectCompany}>
            {companiesRows.map((company, i) => (
              <option key={i} value={company?.companyId}>
                {company.name}
              </option>
            ))}
          </FormSelect>
        </Col>
        <Row>
          <div className="d-flex justify-content-end">
            <Button variant="primary" onClick={handleShow}>
              Criar Lote
            </Button>
            {show && <LotModalForm company={selectedCompany} show={show} handleClose={handleClose} />}
          </div>
        </Row>
      </Form>
      <LotManagementTable company={selectedCompany} />
    </>
  );
}

function useCompaniesFetcher() {
  const { address } = useAccount();
  const [user, setUser] = React.useState(null);

  useContractRead({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "me",
    args: [address],
    onSuccess: (data) => setUser(data),
    enabled: Boolean(address),
  });

  const { data } = useContractInfiniteReads({
    cacheKey: "getCompany",
    contracts() {
      return user.operatorIds.map((company) => ({
        address: contractInfo.address,
        abi: contractInfo.abi,
        functionName: "getCompany",
        args: [company],
      }));
    },
    enabled: Boolean(user),
  });

  console.log({ user, data });

  const companiesRows =
    data?.pages[0]?.map(({ result: company }) => ({
      ...company,
      companyId: Number(company.companyId),
      name: hexToString(company.name, {
        size: 32,
      }),
    })) || [];

  return {
    companiesRows,
  };
}

function LotManagementTable({ company }) {
  const { lotData } = useLotFetcher(company);

  console.log({ lotData });
  return (
    <Table>
      <thead>
        <tr>
          <th>#</th>
          <th>Quantidade</th>
          <th>Confirmado</th>
          <th>Ativo</th>
          <th width={1}>Ações</th>
        </tr>
      </thead>
      <tbody>
        {lotData?.map((lot, i) => (
          <LotManagementTableRow key={i} lot={lot} company={company} />
        ))}
      </tbody>
    </Table>
  );
}

LotManagementTable.propTypes = {
  company: PropTypes.object,
};

function LotManagementTableRow({ lot, company }) {
  const [showEditModal, setShowEditModal] = React.useState(false);

  const handleClose = () => setShowEditModal(false);
  const handleShow = () => setShowEditModal(true);

  const [showDisableModal, setShowDisableModal] = React.useState(false);

  const handleCloseDisable = () => setShowDisableModal(false);
  const handleShowDisable = () => setShowDisableModal(true);

  const [showConfirmModal, setShowConfirmModal] = React.useState(false);

  const handleCloseConfirm = () => setShowConfirmModal(false);
  const handleShowConfirm = () => setShowConfirmModal(true);

  return (
    <>
      <tr>
        <td>{lot?.lotId}</td>
        <td>{lot?.quantity}</td>
        <td>{lot?.confirmed ? "Sim" : "Não"}</td>
        <td>{lot?.active ? "Sim" : "Não"}</td>
        <td>
          <ButtonGroup>
            <Button variant="primary" onClick={handleShow} disabled={lot.confirmed || !lot.active}>
              Editar
            </Button>
            <Button variant="success" onClick={handleShowConfirm} disabled={lot.confirmed || !lot.active}>
              Confirmar
            </Button>
            <Button variant="danger" onClick={handleShowDisable} disabled={lot.confirmed || !lot.active}>
              Desativar
            </Button>
          </ButtonGroup>
          {showEditModal && (
            <LotModalForm show={showEditModal} handleClose={handleClose} company={company} defaultLot={lot} />
          )}
          {showConfirmModal && (
            <ConfirmLotModal show={showConfirmModal} close={handleCloseConfirm} company={company} lot={lot} />
          )}
          {showDisableModal && (
            <DisableLotModal
              showDisableModal={showDisableModal}
              handleCloseDisable={handleCloseDisable}
              company={company}
              lot={lot}
            />
          )}
        </td>
      </tr>
    </>
  );
}

LotManagementTableRow.propTypes = {
  lot: PropTypes.object,
  company: PropTypes.object,
};

function useLotFetcher(company) {
  console.log({ company });

  const { data } = useContractInfiniteReads({
    cacheKey: "lots",
    contracts() {
      return company.lotIds.map((lot) => ({
        address: contractInfo.address,
        abi: contractInfo.abi,
        functionName: "getLot",
        args: [lot],
        // enabled: Boolean(company.productCatalogIds.length > 0),
      }));
    },
    enabled: Boolean(company),
  });

  const lotData = data?.pages[0]?.map(({ result: lot }) => ({
    ...lot,
  }));

  return {
    lotData,
  };
}

function LotModalForm({ company, show, handleClose, defaultLot }) {
  const [lotQuantity, setLotQuantity] = React.useState(defaultLot?.quantity || "");

  let lotData;
  if (defaultLot) {
    lotData = [company.companyId, defaultLot?.lotId, defaultLot.productIds, lotQuantity];
  } else {
    lotData = [company.companyId, [], lotQuantity];
  }

  const { config, error } = usePrepareContractWrite({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: defaultLot ? "editLot" : "addLot",
    args: lotData,
    enabled: Boolean(lotQuantity),
  });
  const { data, write } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess: () => {
      handleClose();
      window.location.reload();
    },
  });

  const disabled = !write || isLoading;

  console.log({ lotQuantity, company, defaultLot });

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Criar Lote</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formBasicEmail">
            <Form.Label>Quantidade do Lote</Form.Label>
            <Form.Control
              type="number"
              placeholder="Quantidade do Lote"
              value={lotQuantity}
              onChange={(e) => setLotQuantity(e.target.value)}
            />
          </Form.Group>
        </Form>

        {error && (
          <>
            <hr />
            <Alert
              style={{
                wordWrap: "break-word",
              }}
              variant="danger"
            >
              {error?.message?.split("Details: ")[1] || error?.message}
            </Alert>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        {!isLoading ? (
          <Button
            variant="primary"
            onClick={() => {
              write?.();
            }}
            disabled={disabled}
          >
            Salvar
          </Button>
        ) : (
          <Button variant="primary" disabled>
            <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />
            <span className="ms-2">Carregando...</span>
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

LotModalForm.propTypes = {
  company: PropTypes.object,
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  defaultLot: PropTypes.object,
};

function DisableLotModal({ showDisableModal, handleCloseDisable, company, lot }) {
  const { config, error } = usePrepareContractWrite({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "disableLot",
    args: [company.companyId, lot.lotId],
    enabled: showDisableModal,
  });
  const _ = useDebounce(null, 1000);

  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess, error2 } = useWaitForTransaction({
    hash: data?.hash,
  });

  React.useEffect(() => {
    console.log({ data, isLoading, isSuccess, error, error2, company, _, lot });
  }, [_, company, data, error, error2, isLoading, isSuccess, lot]);

  console.log([company.companyId, lot.lotId]);

  return (
    <Modal show={showDisableModal} onHide={handleCloseDisable}>
      <Modal.Header closeButton onClose={handleCloseDisable}>
        <Modal.Title>Desativar Lote</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Tem certeza que deseja desativar esse lote?</p>
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
        {!isLoading ? (
          <Button
            variant="danger"
            onClick={() => {
              write();
            }}
          >
            Desativar
          </Button>
        ) : (
          <Button variant="primary" disabled>
            <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />
            <span className="ms-2">Carregando...</span>
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

DisableLotModal.propTypes = {
  showDisableModal: PropTypes.bool.isRequired,
  handleCloseDisable: PropTypes.func.isRequired,
  company: PropTypes.object,
  lot: PropTypes.object,
};

function ConfirmLotModal({ show, close, company, lot }) {
  const { config, error } = usePrepareContractWrite({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "confirmLot",
    args: [company.companyId, lot.lotId],
    enabled: show,
  });
  const _ = useDebounce(null, 1000);

  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess, error2 } = useWaitForTransaction({
    hash: data?.hash,
  });

  React.useEffect(() => {
    console.log({ data, isLoading, isSuccess, error, error2, company, _, lot });
  }, [_, company, data, error, error2, isLoading, isSuccess, lot]);

  console.log([company.companyId, lot.lotId]);

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton onClose={close}>
        <Modal.Title>Confirmar Lote</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Tem certeza que deseja confirmar esse lote? Essa ação não pode ser desfeita.</p>
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
        <Button variant="secondary" onClick={close}>
          Cancelar
        </Button>
        {!isLoading ? (
          <Button
            variant="danger"
            onClick={() => {
              write();
            }}
          >
            Confirmar
          </Button>
        ) : (
          <Button variant="primary" disabled>
            <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />
            <span className="ms-2">Carregando...</span>
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

ConfirmLotModal.propTypes = {
  show: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  company: PropTypes.object,
  lot: PropTypes.object,
};
