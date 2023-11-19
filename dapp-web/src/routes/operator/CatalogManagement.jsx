import { PropTypes } from "prop-types";
import React from "react";
import { Alert, Button, Col, Form, FormSelect, Modal, Row, Spinner, Table } from "react-bootstrap";
import { hexToString, stringToHex } from "viem";
import {
  useAccount,
  useContractInfiniteReads,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import contractInfo from "../../../contract-abis/contract-info.json";

export function CatalogManagement() {
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
      <h1>Catalog Management</h1>
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
              Criar Companhia
            </Button>
            {show && <CatalogModalForm company={selectedCompany} show={show} handleClose={handleClose} />}
          </div>
        </Row>
      </Form>
      <CatalogManagementTable company={selectedCompany} />
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

function CatalogManagementTable({ company }) {
  const { catalogData } = useCatalogFetcher(company);
  return (
    <Table>
      <thead>
        <tr>
          <th>Nome</th>
        </tr>
      </thead>
      <tbody>
        {catalogData?.map((catalog, i) => (
          <tr key={i}>
            <td>{catalog?.productName}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

CatalogManagementTable.propTypes = {
  company: PropTypes.object,
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

function CatalogModalForm({ company, show, handleClose }) {
  const [catalogName, setCatalogName] = React.useState("");

  const { config, error } = usePrepareContractWrite({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "addCatalog",
    args: [company?.companyId, !catalogName ? "" : stringToHex(catalogName, { size: 32 })],
    enabled: Boolean(catalogName),
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

  console.log({ catalogName, company });

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Criar Catalogo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formBasicEmail">
            <Form.Label>Nome do Catalogo</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nome do Catalogo"
              value={catalogName}
              onChange={(e) => setCatalogName(e.target.value)}
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
            Criar
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

CatalogModalForm.propTypes = {
  company: PropTypes.object,
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};
