import { EIP6963Connector } from "@web3modal/wagmi";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import PropTypes from "prop-types";

import { polygonMumbai } from "viem/chains";
import {
  WagmiConfig,
  configureChains,
  createConfig,
  useAccount,
  useContractEvent,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";

import { useDebounce } from "@uidotdev/usehooks";
import React from "react";
import { Button, Dropdown, DropdownButton, Form, Modal, Spinner } from "react-bootstrap";
import { stringToHex } from "viem";
import contractInfo from "../../contract-abis/contract-info.json";
import { ElevateOperatorModal } from "../routes/company/ElevateOperatorModal";
import { useRoleData } from "../hooks/useRoleData";
import { Link } from "react-router-dom";

// 1. Get projectId
const projectId = "9ef7f1e1ff7dec0aba278a7ba1f4171b";

// 2. Create wagmiConfig
const { chains, publicClient } = configureChains(
  [polygonMumbai],
  [
    infuraProvider({ apiKey: "1c2ccb427ffb4f29a9bcd78c87ea88e0" }),
    // walletConnectProvider({ projectId }),
    publicProvider(),
  ]
);

const metadata = {
  name: "Supplychain DApp",
  description: "Supplychain DApp",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new WalletConnectConnector({ chains, options: { projectId, showQrModal: false, metadata } }),
    new EIP6963Connector({ chains }),
    // new InjectedConnector({ chains, options: { shimDisconnect: true } }),
    // new CoinbaseWalletConnector({ chains, options: { appName: metadata.name } }),
    // new MetaMaskConnector({
    //   chains,
    //   options: {
    //     shimChainChangedDisconnect: false,
    //   },
    // }),
  ],
  publicClient,
});

// 3. Create modal
createWeb3Modal({ wagmiConfig, projectId, chains });

export function Web3Config({ children }) {
  return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>;
}

export default function ConnectButton() {
  const { isConnected } = useAccount();

  return (
    <div className="bg-dark d-flex align-items-center text-light gap-2 ps-3 pe-3 rounded">
      {isConnected && (
        <>
          <Button
            size="sm"
            variant="outline-light"
            onClick={() => {
              window.ethereum
                .request({
                  method: "wallet_requestPermissions",
                  params: [
                    {
                      eth_accounts: {},
                    },
                  ],
                })
                .then((a) => {
                  console.log({ a });
                  window.location.reload();
                });
            }}
          >
            Trocar conta
          </Button>
          <AccountData />
        </>
      )}
      <w3m-button label="Conectar" loadingLabel="Conectando" />
    </div>
  );
}

Web3Config.propTypes = {
  children: PropTypes.node.isRequired,
};

function AccountData() {
  const { address } = useAccount();

  const { data, isLoading, isSuccess, write, isError } = useContractWrite({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "register",
  });

  const unwatch = useContractEvent({
    address: contractInfo.address,
    abi: contractInfo.abi,
    eventName: "UserRegistered",
    args: [address],
    listener: (event) => {
      console.log({ event, address });
      if (event[0]?.args.user === address) {
        unwatch?.();
        handleClose();
        window.location.reload();
      }
    },
  });

  const [isUser, setIsUser] = React.useState(null);

  useContractRead({
    address: contractInfo.address,
    abi: contractInfo.abi,
    functionName: "users",
    args: [address],
    onSuccess: (data) => {
      const [registered] = data;
      setIsUser(registered || false);

      if (!data) handleShow();
      if (registered) {
        unwatch?.();
        handleClose();
      }
    },
  });

  const [show, setShow] = React.useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  if (isSuccess) {
    console.log(data);
  }

  return (
    <>
      {isUser && <UserActions />}
      {isUser === false && (
        <>
          <Button variant="success" onClick={handleShow} size="sm" className="me-3">
            Concluir registro
          </Button>
          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Registrar-se</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {isSuccess ? (
                <p>Parabéns, seu registro foi enviado. Aguarde a transação ser confirmada.</p>
              ) : (
                <>
                  {isLoading ? (
                    <>Para concluir o registro, cheque sua carteira e aprove a transação.</>
                  ) : (
                    <>
                      <p>
                        Parece que voce ainda não se registrou. É necessário registrar-se e isso só pode ser feito uma
                        vez.
                      </p>
                      {isError && <p>Algo deu errado, tente novamente.</p>}
                    </>
                  )}
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
                    write();
                  }}
                >
                  Registrar
                </Button>
              ) : (
                <Button variant="primary" disabled>
                  <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-2">Carregando...</span>
                </Button>
              )}
            </Modal.Footer>
          </Modal>
        </>
      )}
    </>
  );
}

function UserActions() {
  const { address } = useAccount();
  const roles = useRoleData(address);

  const [show, setShow] = React.useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  console.log(roles);

  const [show2, setShow2] = React.useState(false);

  const handleClose2 = () => setShow2(false);
  const handleShow2 = () => setShow2(true);

  return (
    <DropdownButton title="Registrado" variant="outline-light" size="sm">
      {roles.OWNER === true && (
        <>
          <Dropdown.ItemText>Administrador</Dropdown.ItemText>
          <Dropdown.Item className="ps-4" onClick={handleShow}>
            <span>Elevar permissões</span>
          </Dropdown.Item>
          <ElevatePermissionsModal show={show} handleClose={handleClose} />
        </>
      )}
      {roles.COMPANY === true && (
        <>
          <Dropdown.ItemText>Gestor</Dropdown.ItemText>
          <Dropdown.Item className="ps-4" as={Link} to="/company/manage">
            <span>Companhia</span>
          </Dropdown.Item>
          <Dropdown.Item className="ps-4" onClick={handleShow2}>
            <span>Elevar Operadores</span>
          </Dropdown.Item>
          {show2 && <ElevateOperatorModal show={show2} handleClose={handleClose2} />}
        </>
      )}
      {roles.OPERATOR === true && (
        <>
          <Dropdown.ItemText>Operador</Dropdown.ItemText>
          <Dropdown.Item className="ps-4" as={Link} to="/operator/catalog">
            <span>Gerenciar Catálogo</span>
          </Dropdown.Item>
          <Dropdown.Item className="ps-4" as={Link} to="/operator/lot">
            <span>Gerenciar Lote</span>
          </Dropdown.Item>
          <Dropdown.Item className="ps-4" as={Link} to="/operator/movement">
            <span>Gerenciar Movimentação</span>
          </Dropdown.Item>
        </>
      )}
    </DropdownButton>
  );
}

function ElevatePermissionsModal({ show, handleClose }) {
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
