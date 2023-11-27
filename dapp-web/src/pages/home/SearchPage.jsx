import { Card, Col, Container, ListGroup, ListGroupItem, Row, Table } from "react-bootstrap";
import { Web3ConfigPublic } from "../../config/Web3ConfigPublic";
import { useParams } from "react-router-dom";
import { useContractInfiniteReads, useContractRead } from "wagmi";
import contractInfo from "../../../contract-abis/contract-info.json";
import { hexToString, numberToHex } from "viem";
import { MovementManagementTable } from "../platform/operator/MovementManagement";

export function SearchPage() {
  return (
    <>
      <Web3ConfigPublic>
        <Inside />
      </Web3ConfigPublic>
    </>
  );
}

function Inside() {
  let { lotCode: _lotCode } = useParams();

  let lotCode = JSON.parse(atob(atob(_lotCode)));

  const { data: foundedLotRaw } = useContractRead({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "getLot",
    args: [numberToHex(lotCode?.[1] || 0, { size: 32 })],
    enabled: Boolean("V3pFc01sMD0"),
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
  return (
    <Container>
      <h1 className="mb-4">Busca para o Lote: {_lotCode}</h1>
      <hr />
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
      <Row>
        <MovementManagementTable lot={foundedLot} />
      </Row>
    </Container>
  );
}
