import { ConnectKitButton } from "connectkit";
import { Button, Container, Nav, Navbar, Spinner } from "react-bootstrap";
import { MdOutlineChangeCircle } from "react-icons/md";
import { Link } from "react-router-dom";
import { useAccount, useBalance } from "wagmi";
import { useModal } from "../hooks/useModal";
import { useUserFetcher } from "../hooks/useUserFetcher";
import { CustomModal } from "./CustomModal";
import React from "react";
import { LoadingButton } from "./LoadingButton";

export function Web3Navbar() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary" style={{ height: "6em" }}>
      <Container className="gap-3">
        <Navbar.Brand as={Link} to="/">
          Drug Supplychain dApp
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0" style={{ maxHeight: "200px" }} navbarScroll>
            <Nav.Link as={Link} to="/">
              Início
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
        <ConnectButton />
      </Container>
    </Navbar>
  );
}

export default function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { data } = useBalance({ address, enabled: isConnected });
  return (
    <>
      <div
        className={"d-flex align-items-center text-light gap-2 ps-3 pe-3 rounded" + (isConnected ? " bg-dark" : "")}
        style={{ height: "3em" }}
      >
        {isConnected && (
          <>
            <ChangeAccount />
            <Onboarding />
            <span>
              {Number(data?.formatted)?.toLocaleString("en-US") || ""} {data?.symbol || ""}
            </span>
          </>
        )}

        <ConnectKitButton />
      </div>
    </>
  );
}

function ChangeAccount() {
  const [isLoading, setIsLoading] = React.useState(false);

  const handle = () => {
    setIsLoading(true);
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
        setIsLoading(false);
        window.location.pathname = "/tcc-ec-blockchain-drug-supplychain/platform";
      })
      .catch((e) => {
        console.log({ e });
        setIsLoading(false);
      });
  };
  return (
    <LoadingButton
      isLoading={isLoading}
      loadingElement={
        <Button size="sm" variant="outline-light" onClick={handle} disabled>
          <span className="ms-2">Carregando...</span>
          <Spinner
            as="span"
            animation="grow"
            size="sm"
            role="status"
            aria-hidden="true"
            style={{ marginLeft: "0.5em" }}
          />
        </Button>
      }
    >
      <Button size="sm" variant="outline-light" onClick={handle}>
        Trocar conta
        <MdOutlineChangeCircle size="1.5em" style={{ marginLeft: "0.5em" }} />
      </Button>
    </LoadingButton>
  );
}

function Onboarding() {
  const { address } = useAccount();

  const { isRegistered, registerContract } = useUserFetcher(address);

  const { show, handleClose, handleShow } = useModal();

  let messageElement = <></>;
  if (registerContract.write.isSuccess) {
    messageElement = <p>Parabéns, seu registro foi enviado. Aguarde a transação ser confirmada.</p>;
  } else if (registerContract?.write?.isLoading || registerContract?.wait?.isLoading) {
    messageElement = <p>Para concluir o registro, cheque sua carteira e aprove a transação.</p>;
  } else {
    messageElement = (
      <>
        <p className="text-center text-secondary-emphasis">
          Parece que voce ainda não se registrou.
          <br />É necessário registrar-se e isso só pode ser feito uma vez.
        </p>
        {(registerContract?.prepare?.isError ||
          registerContract?.write?.isError ||
          registerContract?.wait?.isError) && <p>Algo deu errado, tente novamente.</p>}
      </>
    );
  }

  return (
    <>
      {isRegistered == false && (
        <>
          <Button variant="success" onClick={handleShow} size="sm" className="me-3">
            Concluir registro
          </Button>
          <CustomModal
            show={show}
            handleClose={handleClose}
            title="Registrar-se"
            buttons={
              <>
                <Button variant="secondary" onClick={handleClose}>
                  Cancelar
                </Button>
                <LoadingButton
                  isLoading={registerContract?.write?.isLoading || registerContract?.wait?.isLoading}
                  onClick={registerContract?.write?.write}
                  title="Registrar-se"
                />
              </>
            }
          >
            {messageElement}
          </CustomModal>
        </>
      )}
    </>
  );
}
