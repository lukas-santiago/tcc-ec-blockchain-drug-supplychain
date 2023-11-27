import { PropTypes } from "prop-types";
import React, { useEffect, useState } from "react";
import {
  Button,
  ButtonGroup,
  Card,
  Col,
  Form,
  FormSelect,
  ListGroup,
  ListGroupItem,
  Row,
  Table,
} from "react-bootstrap";
import { hexToString, numberToHex } from "viem";
import {
  useAccount,
  useContractInfiniteReads,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import contractInfoPart2 from "../../../../contract-abis/contract-info-part2.json";
import contractInfo from "../../../../contract-abis/contract-info.json";

import { BiSearch } from "react-icons/bi";
import { LoadingButton } from "../../../components/LoadingButton";

export function MovementManagement() {
  const { companiesRows: rawCompaniesRows } = useCompaniesFetcher();

  const intermediateCompaniesRows = rawCompaniesRows?.filter((company) => company?.isIntermediate);
  console.log({ intermediateCompaniesRows });

  const [selectedIntermediateCompany, setSelectedIntermediateCompany] = useState(intermediateCompaniesRows[0] || null);

  const handleSelectIntermediateCompany = (e) => {
    setSelectedIntermediateCompany(
      intermediateCompaniesRows.find((company) => company.companyId === Number(e.target.value))
    );
  };

  const [movementText, setMovementText] = React.useState("");
  const handleMovementText = (e) => setMovementText(e.target.value);

  const [input_lotCode, input_setLotCode] = useState("");
  const input_handleLotCode = (e) => input_setLotCode(e.target.value);

  const [lotCode, setLotCode] = useState(null);

  const searchLotCode = () => {
    try {
      const _lotCode = JSON.parse(atob(atob(input_lotCode)));
      setLotCode(_lotCode);
      console.log({ _lotCode });
    } catch (error) {
      console.log({ searchLotCodeError: error });
      input_setLotCode("");
      setLotCode(null);
    }
  };

  const { data: foundedLotRaw } = useContractRead({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "getLot",
    args: [numberToHex(lotCode?.[1] || 0, { size: 32 })],
    enabled: Boolean(lotCode),
  });

  const foundedLot = foundedLotRaw?.confirmed
    ? {
        ...foundedLotRaw,
      }
    : null;

  const { data: foundedCompany } = useContractRead({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "getCompany",
    args: [numberToHex(lotCode?.[0] || 0, { size: 32 })],
    enabled: Boolean(lotCode),
  });

  const { data: foundedLotProducts } = useContractRead({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "getLotProducts",
    args: [numberToHex(lotCode?.[1] || 0, { size: 32 })],
    enabled: Boolean(lotCode),
  });

  const { data: foundedLotProductsCatalogRows } = useContractInfiniteReads({
    cacheKey: "foundedLotProductsCatalog",
    contracts() {
      return (
        foundedLotProducts?.map((lotProduct) => ({
          address: contractInfo.address,
          abi: contractInfo.abi,
          functionName: "getCatalog",
          args: [lotProduct.catalogId],
        })) || []
      );
    },
    enabled: Boolean(foundedLotProducts),
  });

  const foundedLotProductsCatalog = foundedLotProductsCatalogRows?.pages[0]?.map(({ result: catalog }) => ({
    ...catalog,
    productName: hexToString(catalog?.productName, { size: 32 }),
  }));

  if (foundedLotRaw)
    console.log({ foundedLot, lotCode, foundedCompany, foundedLotProducts, foundedLotProductsCatalog, foundedLotRaw });

  const { config } = usePrepareContractWrite({
    address: contractInfoPart2.address,
    abi: contractInfoPart2.abi,
    functionName: "registerActivity",
    args: [selectedIntermediateCompany?.companyId, foundedLot?.lotId, movementText],
    enabled: selectedIntermediateCompany && foundedLot && movementText.length > 0,
  });

  const { write, data, isLoading: isWriteLoading } = useContractWrite(config);

  const { isLoading: isWaitLoading } = useWaitForTransaction({
    hash: data?.hash,
  });

  return (
    <>
      <h1>Movimentação</h1>
      <Form>
        <Row>
          <Col md={6}>
            <Form.Label>Insira o código do Lote</Form.Label>
            <ButtonGroup>
              <Form.Control value={input_lotCode} onChange={input_handleLotCode} />
              <Button variant="secondary" className="d-flex align-items-center gap-2" onClick={searchLotCode}>
                <BiSearch />
                Buscar
              </Button>
            </ButtonGroup>
          </Col>
          <Col md={6}>
            <Form.Label>Escolha uma empresa intermediária</Form.Label>
            <FormSelect value={selectedIntermediateCompany?.companyId || ""} onChange={handleSelectIntermediateCompany}>
              {intermediateCompaniesRows.map((company, i) => (
                <option key={i} value={company?.companyId}>
                  {company.name}
                </option>
              ))}
            </FormSelect>
          </Col>
        </Row>
        <Row className="mb-3">
          {foundedLot && (
            <>
              <Col md={6}>
                <h4 className="mt-3">Lote encontrado</h4>

                <Table>
                  <thead>
                    <tr>
                      <th>Fabricante</th>
                      <th>Lote</th>
                      <th>Quantidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{hexToString(foundedCompany?.name, { size: 32 }) || ""}</td>
                      <td>#{foundedLot?.lotId}</td>
                      <td>{foundedLot?.quantity}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
              <Col md={6} className="mt-5">
                <>
                  <Card>
                    <Card.Header>Produtos no lote</Card.Header>
                    <Card.Body>
                      {foundedLotProducts.map((lotProduct, i) => (
                        <ListGroup key={i}>
                          <ListGroupItem className="d-flex justify-content-between align-items-center">
                            <span>{foundedLotProductsCatalog[i]?.productName}</span>
                            <span>x{lotProduct.quantity}</span>
                          </ListGroupItem>
                        </ListGroup>
                      ))}
                    </Card.Body>
                  </Card>
                </>
              </Col>
            </>
          )}
        </Row>
        <Row className="mt-3">
          <Col md={12}>
            <Form.Label>Descreva a Movimentação</Form.Label>
            <Form.Control type="text" value={movementText} onChange={handleMovementText} />
          </Col>
        </Row>
        <Row className="mt-3">
          <div className="d-flex justify-content-end">
            <LoadingButton
              isLoading={isWaitLoading || isWriteLoading}
              onClick={() => write?.()}
              title="Criar Movimentação"
              isDisabled={!write}
            />
          </div>
        </Row>
        <Row>
          <MovementManagementTable lot={foundedLot} />
        </Row>
      </Form>
    </>
  );
}

function useCompaniesFetcher() {
  const { address } = useAccount();
  const [user, setUser] = React.useState(null);

  useContractRead({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "getUser",
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

// function useLotFetcher(company) {
//   console.log({ company });

//   const { data } = useContractInfiniteReads({
//     cacheKey: "lots",
//     contracts() {
//       return company.lotIds.map((lot) => ({
//         address: contractInfo.address,
//         abi: contractInfo.abi,
//         functionName: "getLot",
//         args: [lot],
//         // enabled: Boolean(company.productCatalogIds.length > 0),
//       }));
//     },
//     enabled: Boolean(company),
//   });

//   const lotData = data?.pages[0]?.map(({ result: lot }) => ({
//     ...lot,
//   }));

//   return {
//     lotData,
//   };
// }

export function MovementManagementTable({ lot }) {
  const { data: lotActivities, refetch } = useContractRead({
    address: contractInfoPart2.address,
    abi: contractInfoPart2.abi,
    functionName: "getLotActivities",
    args: [lot?.lotId],
    enabled: Boolean(lot),
  });

  console.log({ lotActivities, lot });

  useEffect(() => {
    let interval = setInterval(() => {
      refetch();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  });
  return (
    <div
      style={{
        overflowX: "auto",
      }}
    >
      <Table>
        <thead>
          <tr>
            <th className="text-wrap" width={100}>
              Lote
            </th>
            <th className="text-wrap" width={140}>
              Atividade
            </th>
            <th className="text-wrap" width={180}>
              Criado Em
            </th>
            <th className="text-wrap" width={500}>
              Atividade
            </th>
            <th className="text-wrap" width={1}>
              Autor
            </th>
          </tr>
        </thead>
        <tbody>
          {lotActivities?.map((lotActivity, i) => (
            <tr key={i}>
              <td className="text-wrap">#{lotActivity?.lotId}</td>
              <td className="text-wrap">#{lotActivity?.activityId}</td>
              <td className="text-wrap">
                {lotActivity?.started_at
                  ? new Date(String(lotActivity?.started_at) * 1000).toLocaleString("pt-BR", {
                      timeZone: "America/Sao_Paulo",
                    })
                  : "---"}
              </td>
              <td className="text-wrap">{lotActivity?.activity}</td>
              <td className="text-wrap">{lotActivity?.actor}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

MovementManagementTable.propTypes = {
  lot: PropTypes.object,
};
