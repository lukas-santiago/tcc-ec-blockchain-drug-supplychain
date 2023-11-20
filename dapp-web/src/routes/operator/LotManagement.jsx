import { useDebounce } from "@uidotdev/usehooks";
import { PropTypes } from "prop-types";
import React from "react";
import {
  Alert,
  Button,
  ButtonGroup,
  Card,
  Col,
  Form,
  FormSelect,
  InputGroup,
  Modal,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { BaseError, ContractFunctionExecutionError, ContractFunctionRevertedError, hexToString } from "viem";
import {
  useAccount,
  useContractInfiniteReads,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import contractInfo from "../../../contract-abis/contract-info.json";

export function LotManagement() {
  const { companiesRows: rawCompaniesRows } = useCompaniesFetcher();

  const companiesRows = rawCompaniesRows?.filter((company) => company?.isManufacture);
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
            <LotEditModalForm show={showEditModal} handleClose={handleClose} company={company} defaultLot={lot} />
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
    lotData = [company.companyId, lotQuantity];
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

function LotEditModalForm({ company, show, handleClose, defaultLot }) {
  const [lotQuantity, setLotQuantity] = React.useState(defaultLot?.quantity || "");

  const { data: rawLotProducts } = useContractRead({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "getLotProducts",
    args: [defaultLot.lotId],
  });

  const { catalogData } = useCatalogFetcher(company);
  const [catalogSelected, setCatalogSelected] = React.useState(catalogData[0]);

  const lotProducts = rawLotProducts?.map((lotProduct) => ({
    ...lotProduct,
    productName: catalogData.find((catalog) => catalog.catalogId === lotProduct.catalogId)?.productName || "",
  })) || [];

  const [productList, setProductList] = React.useState(lotProducts || []);

  let lotData = [company.companyId, defaultLot?.lotId, lotQuantity, productList];

  const { config, error } = usePrepareContractWrite({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "editLot",
    args: lotData,
    enabled: productList.length > 0 && Boolean(lotQuantity),
  });

  const { data, write } = useContractWrite(config);

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess: () => {
      handleClose();
      window.location.reload();
    },
  });

  const productQuantity = productList.reduce((acc, product) => acc + product.quantity, 0);
  const disabled = productQuantity < lotQuantity || !write || isLoading;

  console.log({
    lotQuantity,
    company,
    defaultLot,
    catalogData,
    lotData,
    productList,
    catalogSelected,
    lotProducts,
    rawLotProducts,
  });

  const handleSelectedCatalog = (e) =>
    setCatalogSelected(catalogData.find((catalog) => catalog.catalogId === Number(e.target.value)));

  const addProduct = () => {
    setProductList([
      ...productList,
      {
        catalogId: catalogSelected.catalogId,
        productName: catalogSelected.productName,
        quantity: 1,
      },
    ]);
  };

  const disableAddProduct =
    !catalogSelected || productList.some((product) => product.catalogId == catalogSelected.catalogId);

  const increaseProductQuantity = (product) => {
    setProductList(
      productList.map((p) => (p.catalogId === product.catalogId ? { ...p, quantity: p.quantity + 1 } : p))
    );
  };

  const decreaseProductQuantity = (product) => {
    setProductList(
      productList.map((p) => (p.catalogId === product.catalogId ? { ...p, quantity: p.quantity - 1 } : p))
    );
  };

  const removeProduct = (product) => {
    setProductList(productList.filter((p) => p.catalogId !== product.catalogId).map((p) => ({ ...p })));
  };

  const disableIncreaseProductQuantity = productQuantity >= Number(lotQuantity);

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
          <Card className="mt-4">
            <Card.Header className="d-flex justify-content-between">
              <span>Produtos</span>
              <span>Total: {productQuantity}</span>
            </Card.Header>
            <Card.Body>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>Selecione o Catálogo</Form.Label>
                <InputGroup>
                  <Form.Select onChange={handleSelectedCatalog}>
                    {catalogData?.map((catalog, i) => (
                      <option key={i} value={catalog.catalogId}>
                        {catalog.productName}
                      </option>
                    ))}
                  </Form.Select>
                  <Button onClick={addProduct} disabled={disableAddProduct}>
                    Adicionar
                  </Button>
                </InputGroup>
                <hr />
                {productList.map((product, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center mt-2">
                    <span>
                      <span>{product?.productName}</span>
                      <Button size="sm" variant="danger" className="ms-2" onClick={() => removeProduct(product)}>
                        ✕
                      </Button>
                    </span>
                    <div className="d-flex justify-content-between align-items-center" style={{ gap: "0.5rem" }}>
                      <Button
                        size="sm"
                        onClick={() => decreaseProductQuantity(product)}
                        disabled={product?.quantity === 1}
                      >
                        −
                      </Button>
                      <span>{product?.quantity}</span>
                      <Button
                        size="sm"
                        onClick={() => increaseProductQuantity(product)}
                        disabled={disableIncreaseProductQuantity}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ))}
              </Form.Group>
            </Card.Body>
          </Card>
        </Form>
        {error && <ErrorHandler error={error} />}
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

LotEditModalForm.propTypes = {
  company: PropTypes.object,
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  defaultLot: PropTypes.object,
};

function useCatalogFetcher(company) {
  console.log({ company });

  const { data } = useContractInfiniteReads({
    cacheKey: "catalogs",
    contracts() {
      return company.productCatalogIds.map((catalog) => ({
        address: contractInfo.address,
        abi: contractInfo.abi,
        functionName: "getCatalog",
        args: [catalog],
        // enabled: Boolean(company.productCatalogIds.length > 0),
      }));
    },
    enabled: Boolean(company),
  });

  const catalogData = data?.pages[0]?.map(({ result: catalog }) => ({
    ...catalog,
    productName: hexToString(catalog?.productName, { size: 32 }),
  }));

  return {
    catalogData,
  };
}

function ErrorHandler({ error }) {
  let reason;

  if (error instanceof BaseError) {
    let errorInstance =
      error.walk((error) => error instanceof ContractFunctionRevertedError) ||
      error.walk((error) => error instanceof ContractFunctionExecutionError);

    if (errorInstance) {
      reason = error?.cause?.reason || error.shortMessage;
      console.log({ reason });
    }
  }

  return (
    <>
      <hr />
      <Alert
        style={{
          wordWrap: "break-word",
        }}
        variant="danger"
      >
        {reason || error?.message?.split("Details: ")[1] || error?.message}
      </Alert>
    </>
  );
}

ErrorHandler.propTypes = {
  error: PropTypes.any,
};
