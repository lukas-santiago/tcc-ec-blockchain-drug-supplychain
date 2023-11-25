import React from "react";
import { Button, Col, Form, FormSelect, Row, Table } from "react-bootstrap";
import { hexToString } from "viem";
import {
  useAccount,
  useContractInfiniteReads,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import contractInfoPart2 from "../../../../contract-abis/contract-info-part2.json";
import contractInfo from "../../../../contract-abis/contract-info.json";
import { PropTypes } from "prop-types";

export function MovementManagement() {
  const { companiesRows: rawCompaniesRows } = useCompaniesFetcher();

  const companiesRows = rawCompaniesRows?.filter((company) => company?.isManufacture);
  const [selectedCompany, setSelectedCompany] = React.useState(companiesRows[0] || null);

  const handleSelectCompany = (e) => {
    setSelectedCompany(companiesRows.find((company) => company.companyId === Number(e.target.value)));
  };

  const { lotData: rawLotData } = useLotFetcher();
  const lotData = rawLotData?.filter((lot) => lot.confirmed === true) || [];
  const [lot, setLot] = React.useState(lotData[0] || null);

  const handleSelectLot = (e) => {
    setLot(lotData.find((lot) => lot.lotId === Number(e.target.value)));
  };

  const [movementText, setMovementText] = React.useState("");
  const handleMovementText = (e) => setMovementText(e.target.value);

  const { config, error } = usePrepareContractWrite({
    address: contractInfoPart2.address,
    abi: contractInfoPart2.abi,
    functionName: "registerActivity",
    args: [selectedCompany?.companyId, lot?.lotId, movementText],
    enabled: selectedCompany && lot && movementText.length > 0,
  });

  const { write, data, status } = useContractWrite(config);

  console.log({ write, data, status, error, selectedCompany, lot, movementText, rawLotData });

  window.write = write;
  return (
    <>
      <h1>Movimentação</h1>
      <Form>
        <Row>
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
          <Col md={3}>
            <Form.Label>Escolha um Lote</Form.Label>
            <FormSelect value={lot?.lotId || ""} onChange={handleSelectLot}>
              {lotData.map((lot, i) => (
                <option key={i} value={lot?.lotId}>
                  #{lot.lotId} ({lot.quantity} itens)
                </option>
              ))}
            </FormSelect>
          </Col>
          <Col md={6}>
            <Form.Label>Descreva a Movimentação</Form.Label>
            <Form.Control type="text" value={movementText} onChange={handleMovementText} />
          </Col>
        </Row>
        <Row className="mt-3">
          <div className="d-flex justify-content-end">
            <Button variant="primary" onClick={() => write?.()} disabled={!write}>
              Criar Movimentação
            </Button>
          </div>
        </Row>
        <Row>
          <MovementManagementTable lot={lot} />
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

function MovementManagementTable({ lot }) {
  const { data: lotActivities } = useContractRead({
    address: contractInfoPart2.address,
    abi: contractInfoPart2.abi,
    functionName: "getLotActivities",
    args: [lot?.lotId],
    enabled: Boolean(lot),
  });

  console.log({ lotActivities, lot });

  return (
    <Table>
      <thead>
        <tr>
          <th width={100}>ID do Lote</th>
          <th width={140}>ID da Atividade</th>
          <th width={1}>Autor</th>
          <th width={180}>Criado Em</th>
          <th>Atividade</th>
        </tr>
      </thead>
      <tbody>
        {lotActivities?.map((lotActivity, i) => (
          <tr key={i}>
            <td>{lotActivity?.lotId}</td>
            <td>{lotActivity?.activityId}</td>
            <td>{lotActivity?.actor}</td>
            <td>
              {lotActivity?.started_at
                ? new Date(String(lotActivity?.started_at) * 1000).toLocaleString("pt-BR", {
                    timeZone: "America/Sao_Paulo",
                  })
                : "---"}
            </td>
            <td>{lotActivity?.activity}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

MovementManagementTable.propTypes = {
  lot: PropTypes.object,
};
