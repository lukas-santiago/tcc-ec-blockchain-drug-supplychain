import { ConnectKitButton } from "connectkit";
import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
// import { ConnectButton } from "../../old_src/config/Web3Config";
import { useAccount, useBalance } from "wagmi";
import { MdOutlineChangeCircle } from "react-icons/md";

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
        {/* <ConnectButton /> */}
        <ConnectButton1 />
      </Container>
    </Navbar>
  );
}

export default function ConnectButton1() {
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
  return (
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
      <MdOutlineChangeCircle size="1.5em" style={{ marginLeft: "0.5em" }} />
    </Button>
  );
}
